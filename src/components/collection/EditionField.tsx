'use client'

import { editionsForFamily } from '@/lib/editions'
import { Chip } from '@/components/ui/Chip'

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
            <Chip key={e} active={active || (e === 'Standard' && !value.trim())} onClick={() => onChange(e === 'Standard' ? '' : e)}>
              {e}
            </Chip>
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
