'use client'

import { editionsForFamily } from '@/lib/editions'

export function EditionField({
  value,
  onChange,
  family,
}: {
  value: string
  onChange: (v: string) => void
  family?: string | null
}) {
  const options = editionsForFamily(family)
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Édition</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((e) => {
          const active = value.trim().toLowerCase() === e.toLowerCase()
          return (
            <button key={e} type="button" onClick={() => onChange(e === 'Standard' ? '' : e)}
              className="px-2.5 py-1 rounded text-xs transition-colors"
              style={active || (e === 'Standard' && !value.trim())
                ? { background: 'var(--accent)', color: '#0A0A0A' }
                : { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
              {e}
            </button>
          )
        })}
      </div>
      <input type="text" placeholder="Autre édition…" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
    </div>
  )
}
