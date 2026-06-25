'use client'

import { LayoutGrid, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { ViewMode } from '@/types'

const VIEWS: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'grid', icon: <LayoutGrid size={15} />, label: 'Grille' },
  { mode: 'list', icon: <List size={15} />, label: 'Liste' },
]

export function ViewSelector({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ background: 'var(--surface)' }}>
      {VIEWS.map(({ mode, icon, label }) => {
        const active = view === mode
        return (
          <button key={mode} onClick={() => onChange(mode)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ color: active ? 'var(--on-accent)' : 'var(--muted)' }}
            title={label}>
            {active && (
              <motion.div layoutId="view-pill" className="absolute inset-0 rounded-md"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
