import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Loader2, CheckCircle2, AlertCircle, Settings } from 'lucide-react'

export default function AIProviderSelector({ onProviderSelect, onModelSelect, currentProvider, currentModel }) {
  const [selectedProvider, setSelectedProvider] = useState(currentProvider || 'ollama')
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [providerStatus, setProviderStatus] = useState('disconnected') // disconnected, checking, connected, error
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')

  // Available providers
  const providers = [
    {
      id: 'ollama',
      name: 'Ollama Local',
      icon: '🖥️',
      description: 'Local AI models',
      endpoint: 'http://localhost:11434',
      needsApiKey: false,
      models: []
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '🤖',
      description: 'GPT-4, GPT-3.5',
      endpoint: 'https://api.openai.com/v1',
      needsApiKey: true,
      models: [
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
      ]
    },
    {
      id: 'grok',
      name: 'Grok (xAI)',
      icon: '⚡',
      description: 'Grok AI',
      endpoint: 'https://api.x.ai/v1',
      needsApiKey: true,
      models: [
        { id: 'grok-2', name: 'Grok-2' },
        { id: 'grok-vision', name: 'Grok Vision' }
      ]
    },
    {
      id: 'claude',
      name: 'Claude (Anthropic)',
      icon: '🧠',
      description: 'Claude AI',
      endpoint: 'https://api.anthropic.com',
      needsApiKey: true,
      models: [
        { id: 'claude-3-opus', name: 'Claude 3 Opus' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
        { id: 'claude-3-haiku', name: 'Claude 3 Haiku' }
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      description: 'Google Gemini AI',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      needsApiKey: true,
      models: [
        { id: 'gemini-pro', name: 'Gemini Pro' },
        { id: 'gemini-vision', name: 'Gemini Vision' }
      ]
    },
    {
      id: 'custom',
      name: 'Custom API',
      icon: '⚙️',
      description: 'Custom API endpoint',
      endpoint: '',
      needsApiKey: true,
      models: []
    }
  ]

  const currentProviderData = providers.find(p => p.id === selectedProvider)

  // Check provider connection
  const checkProviderConnection = async () => {
    setLoading(true)
    setError(null)
    setProviderStatus('checking')

    try {
      if (selectedProvider === 'ollama') {
        // Check Ollama connection
        const response = await fetch('http://localhost:11434/api/tags')
        
        if (!response.ok) {
          throw new Error('Ollama is not running')
        }

        const data = await response.json()
        const modelList = data.models?.map(m => ({
          id: m.name,
          name: m.name.replace(':latest', ''),
          size: formatBytes(m.size)
        })) || []

        setModels(modelList)
        setProviderStatus('connected')
        
        if (modelList.length > 0 && !currentModel) {
          onModelSelect(modelList[0].id)
        }
      } else {
        // For cloud providers, just validate API key
        if (!apiKey) {
          throw new Error('API key is required')
        }
        
        setProviderStatus('connected')
        setModels(currentProviderData?.models || [])
      }
    } catch (err) {
      console.error('Provider connection error:', err)
      setError(err.message)
      setProviderStatus('error')
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  // Auto-check connection when provider changes
  useEffect(() => {
    setProviderStatus('disconnected')
    setModels([])
    setError(null)
  }, [selectedProvider])

  const handleProviderChange = (providerId) => {
    setSelectedProvider(providerId)
    onProviderSelect(providerId)
    setIsOpen(false)
  }

  const handleConnect = () => {
    checkProviderConnection()
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = () => {
    switch (providerStatus) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />
      case 'checking':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = () => {
    switch (providerStatus) {
      case 'connected':
        return 'bg-green-900/20 border-green-500/30'
      case 'checking':
        return 'bg-blue-900/20 border-blue-500/30'
      case 'error':
        return 'bg-red-900/20 border-red-500/30'
      default:
        return 'bg-yellow-900/20 border-yellow-500/30'
    }
  }

  const getStatusText = () => {
    switch (providerStatus) {
      case 'connected':
        return 'Connected'
      case 'checking':
        return 'Checking...'
      case 'error':
        return 'Disconnected'
      default:
        return 'Not Connected'
    }
  }

  return (
    <div className="space-y-4">
      {/* Provider Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">AI Provider</h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-neutral-700 rounded transition"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
          </motion.button>
        </div>

        {/* Provider Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-blue-500 transition text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentProviderData?.icon}</span>
              <div>
                <div className="text-sm font-medium">{currentProviderData?.name}</div>
                <div className="text-xs text-neutral-400">{currentProviderData?.description}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg z-50 shadow-xl"
            >
              {providers.map((provider, idx) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderChange(provider.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-900/30 transition ${
                    idx !== providers.length - 1 ? 'border-b border-neutral-700' : ''
                  } ${selectedProvider === provider.id ? 'bg-blue-900/50 border-l-2 border-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{provider.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-neutral-400">{provider.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-medium">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* API Key Input (for cloud providers) */}
      {showSettings && currentProviderData?.needsApiKey && selectedProvider !== 'ollama' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <label className="text-sm text-neutral-400">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key..."
            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-neutral-400">
            Your API key is only used locally and never stored.
          </p>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/20 border border-red-500/30 rounded-lg p-3"
        >
          <div className="text-sm text-red-300">{error}</div>
          {selectedProvider === 'ollama' && (
            <div className="mt-2 text-xs text-red-300/70">
              Start Ollama with: <code className="bg-black/50 px-2 py-1 rounded">ollama serve</code>
            </div>
          )}
        </motion.div>
      )}

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={loading || (currentProviderData?.needsApiKey && !apiKey)}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4" />
            {providerStatus === 'connected' ? 'Connected' : 'Connect Provider'}
          </>
        )}
      </button>

      {/* Model Selection */}
      {models.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <label className="text-sm text-neutral-400">Model</label>
          <select
            value={currentModel || ''}
            onChange={(e) => onModelSelect(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="">Select a model...</option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
                {model.size && ` (${model.size})`}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Provider Info */}
      {selectedProvider === 'ollama' && (
        <div className="bg-neutral-900/50 rounded-lg p-3 text-xs text-neutral-400 space-y-1">
          <div>✓ No API key required</div>
          <div>✓ Runs locally on your machine</div>
          <div>✓ Complete privacy</div>
          <div>✓ Visit: <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ollama.ai</a></div>
        </div>
      )}

      {selectedProvider !== 'ollama' && currentProviderData?.needsApiKey && (
        <div className="bg-neutral-900/50 rounded-lg p-3 text-xs text-neutral-400 space-y-1">
          <div className="font-semibold text-neutral-300">Get your API key:</div>
          {selectedProvider === 'openai' && (
            <div>Visit: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">platform.openai.com</a></div>
          )}
          {selectedProvider === 'grok' && (
            <div>Visit: <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">console.x.ai</a></div>
          )}
          {selectedProvider === 'claude' && (
            <div>Visit: <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">console.anthropic.com</a></div>
          )}
          {selectedProvider === 'gemini' && (
            <div>Visit: <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ai.google.dev</a></div>
          )}
          {selectedProvider === 'custom' && (
            <div>Configure your custom API endpoint in the settings above</div>
          )}
        </div>
      )}
    </div>
  )
}
