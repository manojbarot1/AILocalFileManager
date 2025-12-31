import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Save, X, Zap, Copy, Download, RefreshCw, FolderOpen } from 'lucide-react'

export default function SuggestionsPanel() {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [customRules, setCustomRules] = useState([])
  const [analysisData, setAnalysisData] = useState(null)
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set())
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  const [applyStatus, setApplyStatus] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'organization',
    priority: 'medium',
    impact: 'Medium',
    timeToImplement: '5 min',
    fileExtensions: '',
    targetFolder: '',
    type: 'extension'
  })

  useEffect(() => {
    loadData()
  }, [])

  // Load custom rules
  const loadCustomRules = () => {
    try {
      const saved = localStorage.getItem('customSuggestions')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (err) {
      console.error('Error loading custom rules:', err)
    }
    return []
  }

  // Save custom rules
  const saveCustomRules = (rules) => {
    try {
      localStorage.setItem('customSuggestions', JSON.stringify(rules))
    } catch (err) {
      console.error('Error saving custom rules:', err)
    }
  }

  // Load data
  const loadData = () => {
    try {
      setLoading(true)

      const rules = loadCustomRules()
      setCustomRules(rules)

      let data = sessionStorage.getItem('analysisData')
      if (!data) {
        data = localStorage.getItem('analysisData')
      }

      if (data) {
        const parsedData = JSON.parse(data)
        setAnalysisData(parsedData)
        console.log('✅ Analysis data loaded:', parsedData)
        generateSuggestions(parsedData, rules)
      } else {
        console.log('❌ No analysis data found')
        setSuggestions([])
        setLoading(false)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setSuggestions([])
      setLoading(false)
    }
  }

  // Generate suggestions
  const generateSuggestions = (data, rules) => {
    let allSuggestions = []

    if (data.files && rules.length > 0) {
      rules.forEach((rule) => {
        const matchingFiles = data.files.filter(file => {
          let matches = false

          if (rule.type === 'extension') {
            const extensions = rule.fileExtensions.split(',').map(e => e.trim().toLowerCase())
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            matches = extensions.some(ext => fileExt === ext || fileExt === `.${ext}`)
          } else if (rule.type === 'filename') {
            try {
              const pattern = new RegExp(rule.fileExtensions, 'i')
              matches = pattern.test(file.name)
            } catch (e) {
              console.error('Invalid regex:', rule.fileExtensions)
              matches = false
            }
          } else if (rule.type === 'folder') {
            matches = file.path.includes(rule.fileExtensions)
          }

          return matches
        })

        if (matchingFiles.length > 0) {
          allSuggestions.push({
            id: `custom_${rule.id}`,
            title: rule.title,
            description: `${rule.description} (Found ${matchingFiles.length} matching files)`,
            category: rule.category || 'organization',
            priority: rule.priority || 'medium',
            impact: rule.impact || 'Medium',
            timeToImplement: rule.timeToImplement || '5 min',
            isCustom: true,
            matchingFiles: matchingFiles,
            targetFolder: rule.targetFolder,
            files: matchingFiles,
            basePath: data.path
          })
        }
      })
    }

    setSuggestions(allSuggestions)
    setLoading(false)
  }

  // Add/Update custom rule
  const handleAddCustomRule = () => {
    if (!formData.title || !formData.targetFolder) {
      alert('Please fill in title and target folder')
      return
    }

    if (editingId) {
      const updated = customRules.map(r => (r.id === editingId ? { ...formData, id: editingId } : r))
      setCustomRules(updated)
      saveCustomRules(updated)
      setEditingId(null)
    } else {
      const newRule = {
        ...formData,
        id: Date.now()
      }
      const updated = [...customRules, newRule]
      setCustomRules(updated)
      saveCustomRules(updated)
    }

    setFormData({
      title: '',
      description: '',
      category: 'organization',
      priority: 'medium',
      impact: 'Medium',
      timeToImplement: '5 min',
      fileExtensions: '',
      targetFolder: '',
      type: 'extension'
    })
    setShowAddForm(false)

    if (analysisData) {
      generateSuggestions(analysisData, [...customRules])
    }
  }

  const handleEditRule = (rule) => {
    setFormData(rule)
    setEditingId(rule.id)
    setShowAddForm(true)
  }

  const handleDeleteRule = (id) => {
    const updated = customRules.filter(r => r.id !== id)
    setCustomRules(updated)
    saveCustomRules(updated)

    if (analysisData) {
      generateSuggestions(analysisData, updated)
    }
  }

  const handleCancelEdit = () => {
    setFormData({
      title: '',
      description: '',
      category: 'organization',
      priority: 'medium',
      impact: 'Medium',
      timeToImplement: '5 min',
      fileExtensions: '',
      targetFolder: '',
      type: 'extension'
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  // Apply selected suggestions
  const handleApplySelected = async () => {
    const selectedList = suggestions.filter(s => selectedSuggestions.has(s.id))
    if (selectedList.length === 0) {
      alert('Please select at least one suggestion')
      return
    }

    setIsApplying(true)
    setApplyStatus('Preparing files to move...')

    try {
      // Collect all files from selected suggestions
      const filesToMove = []
      selectedList.forEach(suggestion => {
        suggestion.matchingFiles.forEach(file => {
          filesToMove.push({
            path: file.path,
            suggested_category: suggestion.targetFolder,
            category: suggestion.targetFolder
          })
        })
      })

      console.log('📁 Moving', filesToMove.length, 'files')
      setApplyStatus(`Moving ${filesToMove.length} files...`)

      const response = await fetch('http://localhost:8000/api/v1/move-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: filesToMove,
          base_path: analysisData.path
        })
      })

      const result = await response.json()

      if (result.success) {
        setApplyStatus(`✅ Successfully moved ${result.moved} files!`)
        console.log('✅ Move completed:', result)

        setTimeout(() => {
          setApplyStatus('')
          setIsApplying(false)
          setSelectedSuggestions(new Set())
          setAnalysisData(null)
          setSuggestions([])
        }, 2000)
      } else {
        throw new Error('Move operation failed')
      }
    } catch (err) {
      console.error('❌ Apply error:', err)
      setApplyStatus(`❌ Error: ${err.message}`)
      setIsApplying(false)
    }
  }

  const handleRefresh = () => {
    console.log('🔄 Refreshing suggestions...')
    loadData()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/20 border-red-500/30 text-red-300'
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'
      case 'low':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-300'
      default:
        return 'bg-neutral-800 border-neutral-700 text-neutral-300'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'organization':
        return '📁'
      case 'storage':
        return '💾'
      case 'cleanup':
        return '🧹'
      case 'security':
        return '🔒'
      default:
        return '💡'
    }
  }

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const toggleSuggestion = (id) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedSuggestions(newSelected)
  }

  const exportSuggestions = () => {
    const selectedList = suggestions.filter(s => selectedSuggestions.has(s.id))
    const text = selectedList
      .map(s => `${s.title}\n${s.description}\nTarget: ${s.targetFolder}\nPriority: ${s.priority}\n`)
      .join('\n---\n\n')

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', 'custom-suggestions.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
          <p className="text-neutral-300">Loading suggestions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Smart Suggestions</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Add Custom Rule Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId ? 'Edit Custom Rule' : 'Create Custom Rule'}
            </h3>
            <button onClick={handleCancelEdit} className="p-1 hover:bg-neutral-700 rounded transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rule Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="extension">File Extensions (.ps1, .py, etc)</option>
                <option value="filename">Filename Pattern (regex)</option>
                <option value="folder">Folder Contains</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rule Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Organize PowerShell Scripts"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Move all PowerShell scripts to dedicated folder"
                rows={2}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.type === 'extension' && 'File Extensions (comma-separated)'}
                {formData.type === 'filename' && 'Filename Pattern (regex)'}
                {formData.type === 'folder' && 'Folder Path Contains'}
              </label>
              <input
                type="text"
                value={formData.fileExtensions}
                onChange={(e) => setFormData({ ...formData, fileExtensions: e.target.value })}
                placeholder={formData.type === 'extension' ? '.ps1, .bat, .cmd' : formData.type === 'filename' ? '.*script.*' : 'scripts, utils'}
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Folder Name</label>
              <input
                type="text"
                value={formData.targetFolder}
                onChange={(e) => setFormData({ ...formData, targetFolder: e.target.value })}
                placeholder="e.g., PowerShell Scripts"
                className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="text"
                  value={formData.timeToImplement}
                  onChange={(e) => setFormData({ ...formData, timeToImplement: e.target.value })}
                  placeholder="5 min"
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-neutral-700">
              <button
                onClick={handleAddCustomRule}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Rule' : 'Create Rule'}
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 py-2 px-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Status */}
      {analysisData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-900/20 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-green-300">Analysis Data Available</div>
              <div className="text-sm text-green-300/70 mt-1">
                {analysisData.totalFiles} files ({(analysisData.totalSize / (1024 * 1024)).toFixed(2)}MB)
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom Rules */}
      {customRules.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-300">Custom Rules</h3>
              <span className="text-xs bg-blue-600 px-2 py-1 rounded">{customRules.length}</span>
            </div>
            <div className="space-y-2">
              {customRules.map(rule => (
                <div key={rule.id} className="bg-black/30 rounded p-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{rule.title}</div>
                    <div className="text-xs text-neutral-400">
                      {rule.type === 'extension' && `Extensions: ${rule.fileExtensions}`}
                      {rule.type === 'filename' && `Pattern: ${rule.fileExtensions}`}
                      {rule.type === 'folder' && `Folder: ${rule.fileExtensions}`}
                      {' → '} <span className="text-blue-300">{rule.targetFolder}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="p-1 hover:bg-neutral-700 rounded transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 hover:bg-neutral-700 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* No Data Message */}
      {!analysisData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-300">No Analysis Data</div>
              <div className="text-sm text-yellow-300/70 mt-1">
                Run an analysis first to see custom rule suggestions
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Suggestions List */}
      {suggestions.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="text-sm font-semibold text-neutral-300">
            {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
          </div>

          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-green-900/20 border border-green-500/30 rounded-lg hover:border-green-400/50 transition overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.has(suggestion.id)}
                    onChange={() => toggleSuggestion(suggestion.id)}
                    className="w-5 h-5 rounded border-neutral-600 bg-neutral-700 cursor-pointer mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getCategoryIcon(suggestion.category)}</span>
                      <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                      <span className="text-xs bg-green-600 px-2 py-0.5 rounded text-white font-medium">
                        CUSTOM
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300">{suggestion.description}</p>
                  </div>
                </div>

                {/* Files List */}
                {suggestion.matchingFiles && suggestion.matchingFiles.length > 0 && (
                  <div className="bg-black/30 rounded p-3 space-y-1">
                    <div className="text-xs font-semibold text-green-300 mb-2">
                      Matching Files ({suggestion.matchingFiles.length}):
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {suggestion.matchingFiles.map((file, fidx) => (
                        <div key={fidx} className="text-xs text-neutral-400 flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          <span className="font-mono">{file.name}</span>
                          <span className="text-neutral-500 text-xs ml-auto">
                            {(file.size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-green-500/20">
                  <div className={`text-xs px-2 py-1 rounded border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                  </div>

                  <div className="text-xs px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                    📁 {suggestion.targetFolder}
                  </div>

                  <div className="text-xs px-2 py-1 bg-neutral-700 rounded text-neutral-300">
                    ⏱️ {suggestion.timeToImplement}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => copyToClipboard(suggestion.title, idx)}
                    className="ml-auto px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 rounded transition flex items-center gap-1"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Apply Status Message */}
          {applyStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                applyStatus.includes('✅')
                  ? 'bg-green-900/20 border border-green-500/30'
                  : 'bg-yellow-900/20 border border-yellow-500/30'
              }`}
            >
              <div className="text-sm text-neutral-200">{applyStatus}</div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {selectedSuggestions.size > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 pt-4 border-t border-neutral-700"
            >
              <button
                onClick={handleApplySelected}
                disabled={isApplying}
                className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Apply {selectedSuggestions.size} Selected
              </button>

              <button
                onClick={exportSuggestions}
                disabled={isApplying}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export {selectedSuggestions.size} Selected
              </button>
            </motion.div>
          )}
        </motion.div>
      ) : analysisData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center"
        >
          <div className="text-sm text-yellow-300">
            No custom rules matched any files
          </div>
          <div className="text-xs text-yellow-300/70 mt-1">
            Create custom rules to organize your files
          </div>
        </motion.div>
      ) : null}

      {/* Help Text */}
      <div className="bg-neutral-900/50 rounded-lg p-4 text-xs text-neutral-400 space-y-2">
        <div className="font-semibold text-neutral-300">💡 Tips:</div>
        <ul className="space-y-1 list-disc list-inside">
          <li>Click "Add Rule" to create custom file organization rules</li>
          <li>Select suggestions and click "Apply" to move files immediately</li>
          <li>Or click "Export" to save an action plan</li>
          <li>Click "Refresh" to reload suggestions from latest analysis</li>
        </ul>
      </div>
    </div>
  )
}
