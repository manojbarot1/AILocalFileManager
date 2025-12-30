// Header.tsx
export default function Header() {
  return (
    <header className="bg-neutral-800 border-b border-neutral-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🤖 AILocalFileManager</h1>
          <p className="text-neutral-400 text-sm">Intelligent Privacy-First File Organization</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-green-900 text-green-100 rounded-full text-sm">Ready</span>
        </div>
      </div>
    </header>
  )
}
