// AnalysisPanel.tsx
export default function AnalysisPanel({ path, onAnalysisComplete }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analyzing: {path}</h2>
      <div className="bg-neutral-800 rounded-lg p-4">
        <div className="animate-pulse">Analyzing files... 0%</div>
      </div>
    </div>
  )
}
