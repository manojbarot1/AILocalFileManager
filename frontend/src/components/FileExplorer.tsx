import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, ChevronRight } from 'lucide-react'

export default function FileExplorer({ onPathSelect, onAnalysisStart }) {
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Common Mac/Linux paths with descriptions
  const commonPaths = [
    { 
      name: 'Downloads', 
      path: '/Users/manojbarot/Downloads',
      icon: '📥',
      files: '~2.5 GB'
    },
    { 
      name: 'Documents', 
      path: '/Users/manojbarot/Documents',
      icon: '📄',
      files: '~1.2 GB'
    },
    { 
      name: 'Desktop', 
      path: '/Users/manojbarot/Desktop',
      icon: '🖥️',
      files: '~500 MB'
    },
    { 
      name: 'Pictures', 
      path: '/Users/manojbarot/Pictures',
      icon: '🖼️',
      files: '~3.8 GB'
    },
    { 
      name: 'Movies', 
      path: '/Users/manojbarot/Movies',
      icon: '🎬',
      files: '~15 GB'
    },
    { 
      name: 'Music', 
      path: '/Users/manojbarot/Music',
      icon: '🎵',
      files: '~2.1 GB'
    },
  ]

  const handlePathSelect = (path: string) => {
    setSelectedPath(path)
    onPathSelect(path)
    setShowCustomInput(false)
    setInputValue('')
  }

  const handleCustomPath = () => {
    if (inputValue.trim()) {
      handlePathSelect(inputValue.trim())
    }
  }

  const handleStartAnalysis = () => {
    if (selectedPath) {
      onAnalysisStart()
    }
  }

  // Suggested organization for selected path
  const getSuggestedTargets = (sourcePath: string) => {
    const suggestions = [
      { type: 'Documents', icon: '📄', path: `${sourcePath}/Documents` },
      { type: 'Images', icon: '🖼️', path: `${sourcePath}/Images` },
      { type: 'Videos', icon: '🎬', path: `${sourcePath}/Videos` },
      { type: 'Audio', icon: '🎵', path: `${sourcePath}/Audio` },
      { type: 'Archives', icon: '📦', path: `${sourcePath}/Archives` },
      { type: 'Other', icon: '📋', path: `${sourcePath}/Other` },
    ]
    return suggestions
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Select Directory to Analyze</h2>
        <p className="text-neutral-400">Choose a folder to organize and get AI recommendations...</p>
      </div>

      {/* Quick Select Common Paths */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">📁 Quick Select Folders</h3>
          <span className="text-xs text-neutral-500">Click to select</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {commonPaths.map((pathItem) => (
            <motion.button
              key={pathItem.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePathSelect(pathItem.path)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedPath === pathItem.path
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{pathItem.icon}</span>
                {selectedPath === pathItem.path && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </div>
              <div className="font-medium text-sm">{pathItem.name}</div>
              <div className="text-xs opacity-60 mt-1">{pathItem.files}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Custom Path Section */}
      <div className="space-y-4">
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronRight size={20} className={`transition-transform ${showCustomInput ? 'rotate-90' : ''}`} />
          <span className="text-lg font-semibold">Or Enter Custom Path</span>
        </button>

        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 bg-neutral-800 rounded-lg p-4 border border-neutral-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomPath()}
                placeholder="e.g., /Users/yourname/Downloads"
                className="flex-1 px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCustomPath}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add
              </motion.button>
            </div>
            <p className="text-xs text-neutral-400">Enter a valid folder path (absolute path required)</p>
          </motion.div>
        )}
      </div>

      {/* Selected Path Display with Source & Target */}
      {selectedPath && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Source Path */}
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-sm text-blue-300 font-semibold mb-2 flex items-center gap-2">
              <FolderOpen size={16} />
              Source Directory
            </div>
            <div className="text-white font-mono text-sm bg-neutral-900/50 p-3 rounded border border-neutral-700 break-all">
              {selectedPath}
            </div>
            <p className="text-xs text-neutral-400 mt-2">Files will be organized from this location</p>
          </div>

          {/* Suggested Target Directories */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <ChevronRight size={16} className="text-blue-400" />
              Suggested Organization Structure
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getSuggestedTargets(selectedPath).map((target, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{target.icon}</span>
                    <span className="text-sm font-medium">{target.type}</span>
                  </div>
                  <div className="text-xs text-neutral-400 font-mono break-all">{target.path}</div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-neutral-500">These folders will be created automatically to organize your files</p>
          </div>

          {/* Start Analysis Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartAnalysis}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-blue-500/30"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">⚡</span>
              <span>Start Analysis</span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Info Box */}
      <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
        <div className="text-sm text-neutral-300 space-y-2">
          <p className="font-medium flex items-center gap-2">
            <span className="text-lg">💡</span>
            How it works:
          </p>
          <ul className="space-y-2 text-xs text-neutral-400 ml-6">
            <li className="flex gap-2">
              <span>1.</span>
              <span>Select a source folder (where your files currently are)</span>
            </li>
            <li className="flex gap-2">
              <span>2.</span>
              <span>Review suggested target folders for organization</span>
            </li>
            <li className="flex gap-2">
              <span>3.</span>
              <span>Click "Start Analysis" to scan and get recommendations</span>
            </li>
            <li className="flex gap-2">
              <span>4.</span>
              <span>AI will suggest which files go into which category</span>
            </li>
            <li className="flex gap-2">
              <span>5.</span>
              <span>Apply suggestions with one click</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
