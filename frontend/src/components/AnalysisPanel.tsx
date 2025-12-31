import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AIProviderSelector from './AIProviderSelector'
import FileResultsTable from './FileResultsTable'
import { Zap, FileText, AlertCircle, Activity } from 'lucide-react'

export default function AnalysisPanel({ path, onAnalysisComplete }) {
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [selectedProvider, setSelectedProvider] = useState('ollama')
  const [selectedModel, setSelectedModel] = useState(null)
  const [fileProgress, setFileProgress] = useState({
    processed: 0,
    total: 0,
    currentFile: '',
    currentCategory: ''
  })
  const [recentFiles, setRecentFiles] = useState([])
  const [isMoving, setIsMoving] = useState(false)
  const [moveStatus, setMoveStatus] = useState('')

  // Save analysis data to localStorage and sessionStorage
  const saveAnalysisData = (data) => {
    try {
      const dataToSave = {
        path: data.path,
        totalFiles: data.totalFiles,
        totalSize: data.totalSize,
        categories: data.categories,
        files: data.files.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          category: f.category,
          confidence: f.confidence,
          path: f.path,
          filename: f.name,
          suggested_category: f.category,
          confidence_score: f.confidence,
          mime_type: f.type,
          modified_date: new Date().toISOString()
        }))
      }

      // Save to both sessionStorage (current session) and localStorage (persistent)
      sessionStorage.setItem('analysisData', JSON.stringify(dataToSave))
      localStorage.setItem('analysisData', JSON.stringify(dataToSave))
      
      console.log('✅ Analysis data saved to localStorage and sessionStorage')
    } catch (err) {
      console.error('Error saving analysis data:', err)
    }
  }

  const startAnalysis = async () => {
    if (!selectedModel) {
      setError('Please select a model first')
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setError(null)
    setAnalysisData(null)
    setStatus('Initializing scan...')
    setFileProgress({ processed: 0, total: 0, currentFile: '', currentCategory: '' })
    setRecentFiles([])

    try {
      console.log('🔍 Starting analysis with provider:', selectedProvider, 'model:', selectedModel)

      const response = await fetch('http://localhost:8000/api/v1/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: path,
          recursive: true,
          provider: selectedProvider,
          model: selectedModel,
        })
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      // Handle Server-Sent Events (SSE) stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let allFiles = []

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              console.log('📨 Received:', data.type)

              if (data.type === 'started') {
                setStatus(`Found ${data.total} files to analyze...`)
                setFileProgress({ 
                  processed: 0, 
                  total: data.total, 
                  currentFile: '', 
                  currentCategory: '' 
                })
              } 
              else if (data.type === 'progress') {
                setProgress(data.progress)
                setStatus(`Analyzing file ${data.processed} of ${data.total}...`)
                setFileProgress({
                  processed: data.processed,
                  total: data.total,
                  currentFile: data.current_file || '',
                  currentCategory: data.category || ''
                })

                if (data.file_info) {
                  setRecentFiles(prev => [data.file_info, ...prev].slice(0, 5))
                }
              } 
              else if (data.type === 'completed') {
                setProgress(100)
                setStatus('Analysis complete!')

                if (data.files && Array.isArray(data.files)) {
                  allFiles = data.files

                  // Build categories object
                  const categories = {
                    Documents: { count: 0, size: 0 },
                    Images: { count: 0, size: 0 },
                    Videos: { count: 0, size: 0 },
                    Code: { count: 0, size: 0 },
                    'Logs & Configs': { count: 0, size: 0 },
                    Archives: { count: 0, size: 0 },
                    Data: { count: 0, size: 0 },
                    Audio: { count: 0, size: 0 },
                    Other: { count: 0, size: 0 }
                  }

                  // Process files and count categories
                  data.files.forEach((f) => {
                    const cat = f.suggested_category || 'Other'
                    if (categories[cat]) {
                      categories[cat].count += 1
                      categories[cat].size += f.size || 0
                    } else {
                      // If category doesn't exist, add to Other
                      categories['Other'].count += 1
                      categories['Other'].size += f.size || 0
                    }
                  })

                  // Create analysis result
                  const analysisResult = {
                    path,
                    totalFiles: data.files.length,
                    totalSize: data.files.reduce((sum, f) => sum + (f.size || 0), 0),
                    categories,
                    files: data.files.map((f) => ({
                      name: f.filename,
                      size: f.size,
                      type: f.mime_type,
                      category: f.suggested_category,
                      confidence: f.confidence_score,
                      path: f.path
                    }))
                  }

                  // Save analysis data before setting state
                  saveAnalysisData(analysisResult)

                  // Set state
                  setAnalysisData(analysisResult)
                }

                setIsAnalyzing(false)
              } 
              else if (data.type === 'error') {
                throw new Error(data.error || 'Unknown error')
              }
            } catch (parseErr) {
              console.error('Parse error:', parseErr)
            }
          }
        }
      }
    } catch (err) {
      console.error('❌ Analysis error:', err)
      setError(err.message || 'Analysis failed')
      setProgress(100)
      setStatus('Analysis failed')
      setIsAnalyzing(false)
    }
  }

  const handleApplySelection = async (selectedFiles) => {
    setIsMoving(true)
    setMoveStatus('Starting file operations...')

    try {
      console.log('📁 Moving', selectedFiles.length, 'files')

      // Transform files to expected format
      const filesToMove = selectedFiles.map(f => ({
        path: f.path,
        suggested_category: f.category,
        category: f.category
      }))

      const response = await fetch('http://localhost:8000/api/v1/move-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToMove,
          base_path: path
        })
      })

      const result = await response.json()

      if (result.success) {
        setMoveStatus(`✅ Successfully moved ${result.moved} files!`)
        console.log('✅ Move operations completed:', result)
        
        setTimeout(() => {
          setAnalysisData(null)
          setMoveStatus('')
          setIsMoving(false)
        }, 2000)
      } else {
        throw new Error('Move operation failed')
      }
    } catch (err) {
      console.error('❌ Move error:', err)
      setMoveStatus(`❌ Error: ${err.message}`)
      setIsMoving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Provider Selector */}
      <AIProviderSelector 
        onProviderSelect={setSelectedProvider}
        onModelSelect={setSelectedModel}
        currentProvider={selectedProvider}
        currentModel={selectedModel}
      />

      {!analysisData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Analysis Section */}
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Analyzing: {path}</h3>
              <p className="text-sm text-neutral-400">
                {isAnalyzing ? `Scanning files with ${selectedProvider} AI...` : 'Ready to analyze directory'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-300">Analysis Error</div>
                    <div className="text-sm text-red-300/80 mt-1">{error}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {isAnalyzing && (
              <>
                {/* Overall Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-sm font-medium">{status}</span>
                    </div>
                    <span className="text-sm text-neutral-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* File Progress */}
                {fileProgress.total > 0 && (
                  <div className="bg-neutral-900/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Files Processed</span>
                      <span className="text-sm font-semibold text-green-400">
                        {fileProgress.processed} / {fileProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        animate={{ width: `${(fileProgress.processed / fileProgress.total) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-green-500"
                      />
                    </div>
                  </div>
                )}

                {/* Current File */}
                {fileProgress.currentFile && (
                  <div className="bg-neutral-900/50 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-neutral-400">Currently processing:</div>
                    <div className="text-sm font-mono bg-black/50 p-2 rounded truncate text-blue-300">
                      {fileProgress.currentFile}
                    </div>
                    {fileProgress.currentCategory && (
                      <div className="text-xs text-neutral-400">
                        Category: <span className="text-blue-300 font-medium">{fileProgress.currentCategory}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Files Processed */}
                {recentFiles.length > 0 && (
                  <div className="bg-neutral-900/50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                    <div className="text-xs font-semibold text-neutral-300">Recent Files:</div>
                    {recentFiles.map((file, idx) => (
                      <div key={idx} className="text-xs text-neutral-400 p-2 bg-black/30 rounded truncate">
                        ✓ {file.filename}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {!isAnalyzing && !analysisData && (
              <button
                onClick={startAnalysis}
                disabled={!selectedModel || isAnalyzing}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                ⚡ Start Analysis
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {moveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-4 ${
                moveStatus.includes('✅')
                  ? 'bg-green-900/20 border border-green-500/30'
                  : 'bg-yellow-900/20 border border-yellow-500/30'
              }`}
            >
              <div className="text-sm text-neutral-200">{moveStatus}</div>
            </motion.div>
          )}

          {!isMoving && (
            <FileResultsTable 
              files={analysisData.files}
              onApplySelection={handleApplySelection}
            />
          )}

          {isMoving && (
            <div className="text-center py-12">
              <div className="inline-block">
                <Activity className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                <p className="text-neutral-300">{moveStatus}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
