'use client'

import { LayoutGrid, List, BookOpen } from 'lucide-react'
import { ViewMode } from '@/types'

const VIEWS: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'shelf', icon: <BookOpen size={15} />, label: 'Étagère' },
  { mode: 'grid', icon: <LayoutGrid size={15} />, label: 'Grille' },
  { mode: 'list', icon: <List size={15} />, label: 'Liste' },
]

export function ViewSelector({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
      {VIEWS.map(({ mode, icon, label }) => (
        <button key={mode} onClick={() => onChange(mode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={view === mode
            ? { background: 'var(--accent)', color: '#0A0A0A' }
            : { color: 'var(--muted)' }}
          title={label}>
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
