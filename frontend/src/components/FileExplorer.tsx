// FileExplorer.tsx
export default function FileExplorer({ onPathSelect, onAnalysisStart }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Select Directory to Analyze</h2>
      <p className="text-neutral-400">Choose a folder to organize...</p>
      <button 
        onClick={() => {
          onPathSelect('/home/user')
          onAnalysisStart()
        }}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
      >
        Select Directory
      </button>
    </div>
  )
}
