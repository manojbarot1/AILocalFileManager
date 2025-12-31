import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function OllamaModelSelector({ onModelSelect, currentModel }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [ollamaStatus, setOllamaStatus] = useState('checking') // checking, connected, error

  useEffect(() => {
    checkOllamaAndLoadModels()
  }, [])

  const checkOllamaAndLoadModels = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if Ollama is running
      const healthResponse = await fetch('http://localhost:11434/api/tags')
      
      if (!healthResponse.ok) {
        throw new Error('Ollama is not running')
      }

      const data = await healthResponse.json()
      const modelList = data.models?.map(m => ({
        name: m.name,
        displayName: m.name.replace(':latest', ''),
        size: formatBytes(m.size),
        modified: new Date(m.modified_at).toLocaleDateString()
      })) || []

      setModels(modelList)
      setOllamaStatus('connected')
      
      // If no model selected, select the first one
      if (modelList.length > 0 && !currentModel) {
        onModelSelect(modelList[0].name)
      }
    } catch (err) {
      console.error('Ollama connection error:', err)
      setError(err.message)
      setOllamaStatus('error')
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">AI Model</h3>
          {ollamaStatus === 'connected' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-300">Ollama Connected</span>
            </div>
          )}
          {ollamaStatus === 'error' && (
            <div className="flex items-center gap-1 px-3 py-1 bg-red-900/20 border border-red-500/30 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">Ollama Offline</span>
            </div>
          )}
        </div>
        <button
          onClick={checkOllamaAndLoadModels}
          disabled={loading}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition"
        >
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
        >
          <div className="text-sm text-red-300">
            <div className="font-semibold mb-2">⚠️ Ollama Not Available</div>
            <div className="text-xs">{error}</div>
            <div className="mt-3 text-xs text-red-300/70">
              Start Ollama with: <code className="bg-black/50 px-2 py-1 rounded">ollama serve</code>
            </div>
          </div>
        </motion.div>
      )}

      {models.length > 0 ? (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-blue-500 transition text-left"
          >
            <div>
              <div className="text-sm font-medium">{currentModel?.replace(':latest', '') || 'Select Model'}</div>
              <div className="text-xs text-neutral-400">{models.find(m => m.name === currentModel)?.size || ''}</div>
            </div>
            <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg z-50 shadow-xl"
            >
              {models.map((model, idx) => (
                <button
                  key={model.name}
                  onClick={() => {
                    onModelSelect(model.name)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-900/30 transition ${
                    idx !== models.length - 1 ? 'border-b border-neutral-700' : ''
                  } ${currentModel === model.name ? 'bg-blue-900/50 border-l-2 border-blue-500' : ''}`}
                >
                  <div className="font-medium text-sm">{model.displayName}</div>
                  <div className="text-xs text-neutral-400">{model.size}</div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-neutral-800 rounded-lg text-center text-neutral-400 text-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading models...</span>
            </div>
          ) : (
            'No models available'
          )}
        </div>
      )}
    </div>
  )
}
