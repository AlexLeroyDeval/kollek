'use client'

import { EyeOff, Eye, ArrowDownUp } from 'lucide-react'
import { Condition, Completion, SortField } from '@/types'
import { COMPLETIONS } from '@/lib/completion'
import { CONDITIONS } from '@/lib/condition'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'

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
      <Select
        value={filters.platformId ?? ''}
        onChange={(v) => set({ platformId: v ? Number(v) : null })}
        aria-label="Plateforme"
      >
        <option value="">Toutes plateformes</option>
        {platforms.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </Select>

      {/* État */}
      <Select
        value={filters.condition ?? ''}
        onChange={(v) => set({ condition: (v || null) as Condition | null })}
        aria-label="État"
      >
        <option value="">Tous états</option>
        {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </Select>

      {/* Completion */}
      <Select
        value={filters.completion ?? ''}
        onChange={(v) => set({ completion: (v || null) as Completion | null })}
        aria-label="Completion"
      >
        <option value="">Toutes completions</option>
        {COMPLETIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </Select>

      {/* Masquer vendus */}
      <Button
        size="xs"
        variant={filters.hideSold ? 'primary' : 'secondary'}
        onClick={() => set({ hideSold: !filters.hideSold })}
        className="gap-1.5"
        icon={filters.hideSold ? <EyeOff size={13} /> : <Eye size={13} />}
        title={filters.hideSold ? 'Vendus masqués' : 'Vendus visibles'}
      >
        Vendus
      </Button>

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
