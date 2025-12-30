// SuggestionsPanel.tsx
export default function SuggestionsPanel({ analysisData }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Organization Suggestions</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4">
          <p className="text-neutral-400">Suggestions will appear here...</p>
        </div>
      </div>
    </div>
  )
}
