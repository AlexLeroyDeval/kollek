'use client'

import { EyeOff, Eye, ArrowDownUp } from 'lucide-react'
import { Condition, Completion, SortField } from '@/types'
import { COMPLETIONS } from '@/lib/completion'
import { CONDITIONS } from '@/lib/condition'

export type FilterState = {
  platformId: number | null
  condition: Condition | null
  completion: Completion | null
  hideSold: boolean
  sort: SortField
}

export const DEFAULT_FILTERS: FilterState = {
  platformId: null,
  condition: null,
  completion: null,
  hideSold: false,
  sort: 'added_at',
}

type PlatformOption = { id: number; label: string }

const selectStyle = {
  background: 'var(--background)',
  border: '1px solid var(--border)',
  color: 'var(--foreground)',
}

export function FilterBar({
  filters,
  onChange,
  platforms,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  platforms: PlatformOption[]
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Plateforme */}
      <select
        value={filters.platformId ?? ''}
        onChange={(e) => set({ platformId: e.target.value ? Number(e.target.value) : null })}
        className="px-2.5 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
        style={selectStyle}
      >
        <option value="">Toutes plateformes</option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>

      {/* État */}
      <select
        value={filters.condition ?? ''}
        onChange={(e) => set({ condition: (e.target.value || null) as Condition | null })}
        className="px-2.5 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
        style={selectStyle}
      >
        <option value="">Tous états</option>
        {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      {/* Completion */}
      <select
        value={filters.completion ?? ''}
        onChange={(e) => set({ completion: (e.target.value || null) as Completion | null })}
        className="px-2.5 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
        style={selectStyle}
      >
        <option value="">Toutes completions</option>
        {COMPLETIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>

      {/* Masquer vendus */}
      <button
        onClick={() => set({ hideSold: !filters.hideSold })}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
        style={filters.hideSold
          ? { background: 'var(--accent)', color: '#0A0A0A' }
          : selectStyle}
        title={filters.hideSold ? 'Vendus masqués' : 'Vendus visibles'}
      >
        {filters.hideSold ? <EyeOff size={13} /> : <Eye size={13} />}
        Vendus
      </button>

      {/* Tri */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs" style={selectStyle}>
        <ArrowDownUp size={13} style={{ color: 'var(--muted)' }} />
        <select
          value={filters.sort}
          onChange={(e) => set({ sort: e.target.value as SortField })}
          className="bg-transparent outline-none cursor-pointer"
        >
          <option value="added_at">Plus récent</option>
          <option value="title">Nom (A→Z)</option>
        </select>
      </div>
    </div>
  )
}
