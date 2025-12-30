import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import FileExplorer from './components/FileExplorer'
import AnalysisPanel from './components/AnalysisPanel'
import SuggestionsPanel from './components/SuggestionsPanel'
import Header from './components/Header'
import Navigation from './components/Navigation'

import './App.css'

const queryClient = new QueryClient()

function App() {
  const [currentView, setCurrentView] = useState<'explorer' | 'analysis' | 'suggestions'>('explorer')
  const [selectedPath, setSelectedPath] = useState<string>('')
  const [analysisData, setAnalysisData] = useState(null)

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-neutral-900 text-neutral-50">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <div className="flex h-screen">
          {/* Sidebar Navigation */}
          <Navigation currentView={currentView} onViewChange={setCurrentView} />

          {/* Content Area */}
          <main className="flex-1 overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {currentView === 'explorer' && (
                <FileExplorer 
                  onPathSelect={setSelectedPath}
                  onAnalysisStart={() => setCurrentView('analysis')}
                />
              )}
              
              {currentView === 'analysis' && (
                <AnalysisPanel 
                  path={selectedPath}
                  onAnalysisComplete={(data) => {
                    setAnalysisData(data)
                    setCurrentView('suggestions')
                  }}
                />
              )}
              
              {currentView === 'suggestions' && (
                <SuggestionsPanel analysisData={analysisData} />
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
