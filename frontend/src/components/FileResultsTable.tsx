import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Check, Copy, FolderOpen } from 'lucide-react'

export default function FileResultsTable({ files, onApplySelection }) {
  const [selectedFiles, setSelectedFiles] = useState(new Set())
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })

  const toggleSelectFile = (filename) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(filename)) {
      newSelected.delete(filename)
    } else {
      newSelected.add(filename)
    }
    setSelectedFiles(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map(f => f.name)))
    }
  }

  const toggleExpandRow = (filename) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
    } else {
      newExpanded.add(filename)
    }
    setExpandedRows(newExpanded)
  }

  const handleApply = () => {
    const filesToApply = files.filter(f => selectedFiles.has(f.name))
    onApplySelection(filesToApply)
    setSelectedFiles(new Set())
  }

  const sortedFiles = [...files].sort((a, b) => {
    let aVal = a[sortConfig.key]
    let bVal = b[sortConfig.key]

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400 bg-green-900/20'
    if (confidence >= 0.7) return 'text-yellow-400 bg-yellow-900/20'
    return 'text-orange-400 bg-orange-900/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Files Analysis</h3>
          <p className="text-sm text-neutral-400">{files.length} files analyzed</p>
        </div>
        {selectedFiles.size > 0 && (
          <motion.button
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply {selectedFiles.size} {selectedFiles.size === 1 ? 'file' : 'files'}
          </motion.button>
        )}
      </div>

      {/* Table */}
      <div className="border border-neutral-700 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-neutral-800/50 border-b border-neutral-700 grid grid-cols-12 gap-4 p-4 font-semibold text-sm sticky top-0">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedFiles.size === files.length && files.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleSort('name')}
            className="col-span-3 text-left hover:text-blue-400 transition flex items-center gap-1"
          >
            Source File
            {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
          </button>
          <button
            onClick={() => handleSort('category')}
            className="col-span-3 text-left hover:text-blue-400 transition flex items-center gap-1"
          >
            AI Suggested Path
            {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
          </button>
          <button
            onClick={() => handleSort('confidence')}
            className="col-span-2 text-left hover:text-blue-400 transition flex items-center gap-1"
          >
            Confidence
            {sortConfig.key === 'confidence' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
          </button>
          <div className="col-span-3">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-neutral-700">
          {sortedFiles.map((file, idx) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
            >
              {/* Main Row */}
              <div className="grid grid-cols-12 gap-4 p-4 hover:bg-neutral-800/30 transition items-center">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.name)}
                    onChange={() => toggleSelectFile(file.name)}
                    className="w-4 h-4 rounded border-neutral-600 bg-neutral-700 cursor-pointer"
                  />
                </div>
                <div className="col-span-3">
                  <div className="font-medium text-sm truncate">{file.name}</div>
                  <div className="text-xs text-neutral-400">{formatBytes(file.size)}</div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="font-medium text-sm">{file.category}</div>
                      <div className="text-xs text-neutral-400">{file.type}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(file.confidence)}`}>
                    {(file.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleSelectFile(file.name)}
                    className={`px-3 py-1 rounded text-xs transition ${
                      selectedFiles.has(file.name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                    }`}
                  >
                    {selectedFiles.has(file.name) ? '✓ Selected' : 'Select'}
                  </button>
                  <button
                    onClick={() => toggleExpandRow(file.name)}
                    className="px-3 py-1 rounded text-xs bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition"
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* Expanded Details Row */}
              {expandedRows.has(file.name) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-neutral-900/50 border-t border-neutral-700 p-4"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-400 text-xs mb-1">Full Path</div>
                      <div className="font-mono text-xs bg-black/50 p-2 rounded break-all">{file.path}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 text-xs mb-1">MIME Type</div>
                      <div className="font-mono text-xs bg-black/50 p-2 rounded">{file.type}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="text-neutral-400 text-xs mb-1">Total Files</div>
            <div className="text-2xl font-bold">{files.length}</div>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="text-neutral-400 text-xs mb-1">Selected</div>
            <div className="text-2xl font-bold text-blue-400">{selectedFiles.size}</div>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4">
            <div className="text-neutral-400 text-xs mb-1">Total Size</div>
            <div className="text-2xl font-bold">{formatBytes(files.reduce((sum, f) => sum + f.size, 0))}</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
