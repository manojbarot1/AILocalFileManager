// Navigation.tsx
import { FileText, Zap, Settings } from 'lucide-react'

export default function Navigation({ currentView, onViewChange }) {
  const navItems = [
    { id: 'explorer', label: 'Explorer', icon: FileText },
    { id: 'analysis', label: 'Analysis', icon: Zap },
    { id: 'suggestions', label: 'Suggestions', icon: Settings },
  ]

  return (
    <nav className="w-64 bg-neutral-800 border-r border-neutral-700 p-4">
      <div className="space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
              currentView === item.id
                ? 'bg-primary text-white'
                : 'text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
