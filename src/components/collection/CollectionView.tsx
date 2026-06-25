'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ViewMode, CollectionEntry } from '@/types'
import { ViewSelector } from './ViewSelector'
import { CollectionGrid } from './CollectionGrid'
import { CollectionList } from './CollectionList'
import { GameDetailDialog } from './GameDetailDialog'
import { FilterBar, FilterState, DEFAULT_FILTERS } from './FilterBar'
import { CollectionSkeleton } from './CollectionSkeleton'

export function CollectionView() {
  const [view, setView] = useState<ViewMode>('grid')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const { data, isLoading, error } = useQuery<CollectionEntry[]>({
    queryKey: ['collection'],
    queryFn: async () => {
      const res = await fetch('/api/collection')
      if (!res.ok) throw new Error('Failed to fetch collection')
      return res.json()
    },
  })

  // Dérivé de data pour rester à jour après une mutation (vente, édition…)
  const selected = useMemo(
    () => data?.find((e) => e.id === selectedId) ?? null,
    [data, selectedId]
  )

  // Tous les exemplaires du même jeu (vendus inclus), triés par id pour une
  // numérotation stable. Permet de naviguer entre copies dans la modale.
  const siblings = useMemo(() => {
    if (!data || !selected) return []
    return data
      .filter((e) => e.game_id === selected.game_id)
      .sort((a, b) => a.id - b.id)
  }, [data, selected])

  // Plateformes présentes dans la collection (pour le filtre)
  const platforms = useMemo(() => {
    if (!data) return []
    const map = new Map<number, string>()
    for (const entry of data) {
      const p = entry.game?.platform
      if (p) map.set(p.id, p.abbreviation ?? p.name)
    }
    return [...map.entries()].map(([id, label]) => ({ id, label })).sort((a, b) => a.label.localeCompare(b.label))
  }, [data])

  // Application des filtres + tri
  const visible = useMemo(() => {
    if (!data) return []
    let rows = data.filter((entry) => {
      if (filters.platformId != null && entry.game?.platform_id !== filters.platformId) return false
      if (filters.condition != null && entry.condition !== filters.condition) return false
      if (filters.completion != null && entry.completion !== filters.completion) return false
      if (filters.hideSold && entry.is_sold) return false
      return true
    })

    rows = [...rows].sort((a, b) => {
      if (filters.sort === 'title') {
        return (a.game?.title ?? '').localeCompare(b.game?.title ?? '')
      }
      // added_at desc (plus récent en premier)
      return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
    })

    return rows
  }, [data, filters])

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <p className="text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
            {isLoading ? '…' : `${visible.length} / ${data?.length ?? 0} jeu${(data?.length ?? 0) > 1 ? 'x' : ''}`}
          </p>
          {data && data.length > 0 && (
            <FilterBar filters={filters} onChange={setFilters} platforms={platforms} />
          )}
        </div>
        <ViewSelector view={view} onChange={setView} />
      </div>

      {/* Content */}
      {isLoading && <CollectionSkeleton view={view} />}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Erreur de chargement.</p>
        </div>
      )}

      {data && !isLoading && data.length > 0 && visible.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucun jeu ne correspond à ces filtres.</p>
        </div>
      )}

      {data && !isLoading && visible.length > 0 && view === 'grid' && <CollectionGrid data={visible} onSelect={(e) => setSelectedId(e.id)} />}
      {data && !isLoading && visible.length > 0 && view === 'list' && <CollectionList data={visible} onSelect={(e) => setSelectedId(e.id)} activeId={selectedId} />}
      {data && !isLoading && data.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Ta collection est vide. Ajoute ton premier jeu !</p>
        </div>
      )}

      <GameDetailDialog entry={selected} siblings={siblings} onNavigate={setSelectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
