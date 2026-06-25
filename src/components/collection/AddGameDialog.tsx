'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import { Search, X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { IgdbGame, Condition, Completion } from '@/types'
import { COMPLETIONS } from '@/lib/completion'
import { CONDITIONS } from '@/lib/condition'
import { useDebounce } from '@/hooks/useDebounce'
import { EditionField } from './EditionField'
import Image from 'next/image'

type IgdbPlatform = NonNullable<IgdbGame['platforms']>[number]
type SelectedGame = IgdbGame & {
  selectedPlatformId: number
  selectedPlatformName: string
  selectedPlatformAbbr?: string
  selectedPlatformFamily?: string
}

export function AddGameDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<SelectedGame | null>(null)
  const [condition, setCondition] = useState<Condition>('Very Good')
  const [completion, setCompletion] = useState<Completion>('loose')
  const [edition, setEdition] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [notes, setNotes] = useState('')

  const debouncedQuery = useDebounce(query, 400)
  const queryClient = useQueryClient()

  const { data: results, isFetching } = useQuery<IgdbGame[]>({
    queryKey: ['igdb-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return []
      const res = await fetch(`/api/igdb/search?q=${encodeURIComponent(debouncedQuery)}`)
      return res.json()
    },
    enabled: debouncedQuery.length > 1,
  })

  const { mutate: addGame, isPending } = useMutation({
    mutationFn: async () => {
      if (!selected) return
      const res = await fetch('/api/collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          igdb_id: selected.id,
          platform_igdb_id: selected.selectedPlatformId,
          platform_name: selected.selectedPlatformName,
          platform_abbreviation: selected.selectedPlatformAbbr,
          platform_family: selected.selectedPlatformFamily,
          title: selected.matched_alt_name ?? selected.name,
          release_year: selected.first_release_date ? new Date(selected.first_release_date * 1000).getFullYear() : undefined,
          cover_front_url: selected.cover?.url,
          condition,
          completion,
          edition: edition.trim() || undefined,
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
          purchase_date: purchaseDate || undefined,
          notes: notes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to add game')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      toast.success(`${selected?.matched_alt_name ?? selected?.name} ajouté à la collection`)
      handleClose()
    },
    onError: () => {
      toast.error("Échec de l'ajout du jeu")
    },
  })

  function handleClose() {
    setOpen(false)
    setQuery('')
    setSelected(null)
    setCondition('Very Good')
    setCompletion('loose')
    setEdition('')
    setPurchasePrice('')
    setPurchaseDate('')
    setNotes('')
  }

  function selectGame(game: IgdbGame, platform: IgdbPlatform) {
    setSelected({
      ...game,
      selectedPlatformId: platform.id,
      selectedPlatformName: platform.name,
      selectedPlatformAbbr: platform.abbreviation,
      selectedPlatformFamily: platform.platform_family?.name,
    })
  }

  const coverUrl = selected?.cover?.url
    ? `https:${selected.cover.url.replace('t_thumb', 't_cover_big')}`
    : null

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
      <Dialog.Trigger asChild>
        <motion.button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#0A0A0A' }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
          <Plus size={16} />
          Ajouter un jeu
        </motion.button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
        <Dialog.Content className="dialog-content fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold">Ajouter un jeu</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded hover:opacity-60 transition-opacity"><X size={18} /></button>
            </Dialog.Close>
          </div>

          {!selected ? (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                {isFetching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: 'var(--muted)' }} />}
              </div>

              {/* Results */}
              {results && results.length > 0 && (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {results.map((game) => (
                    <div key={game.id}>
                      {game.platforms && game.platforms.length > 1 ? (
                        game.platforms.map((p) => (
                          <button key={p.id} onClick={() => selectGame(game, p)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:opacity-80"
                            style={{ background: 'var(--background)' }}>
                            {game.cover && (
                              <Image src={`https:${game.cover.url}`} alt={game.name} width={32} height={42}
                                className="rounded object-cover flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{game.matched_alt_name ?? game.name}</p>
                              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                                {p.abbreviation ?? p.name}
                                {game.matched_alt_name && ` · ${game.name}`}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <button onClick={() => selectGame(game, game.platforms![0])}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:opacity-80"
                          style={{ background: 'var(--background)' }}>
                          {game.cover && (
                            <Image src={`https:${game.cover.url}`} alt={game.name} width={32} height={42}
                              className="rounded object-cover flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{game.matched_alt_name ?? game.name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                              {game.platforms?.[0]?.abbreviation ?? game.platforms?.[0]?.name ?? '—'}
                              {game.matched_alt_name && ` · ${game.name}`}
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {results?.length === 0 && debouncedQuery.length > 1 && !isFetching && (
                <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>Aucun résultat pour "{debouncedQuery}"</p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Selected game header */}
              <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--background)' }}>
                {coverUrl && (
                  <Image src={coverUrl} alt={selected.name} width={52} height={70}
                    className="rounded object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{selected.matched_alt_name ?? selected.name}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {selected.selectedPlatformAbbr ?? selected.selectedPlatformName}
                    {selected.first_release_date && ` · ${new Date(selected.first_release_date * 1000).getFullYear()}`}
                  </p>
                  {selected.matched_alt_name && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      Titre original : {selected.name}
                    </p>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="ml-auto text-xs px-3 py-1 rounded"
                  style={{ background: 'var(--surface-hover)', color: 'var(--muted)' }}>
                  Changer
                </button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-4">
                {/* Condition */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>État</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CONDITIONS.map((c) => (
                      <button key={c.value} onClick={() => setCondition(c.value)}
                        className="px-2.5 py-1 rounded text-xs transition-colors"
                        style={condition === c.value
                          ? { background: 'var(--accent)', color: '#0A0A0A' }
                          : { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Completion */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Completion</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMPLETIONS.map((c) => (
                      <button key={c.value} onClick={() => setCompletion(c.value)}
                        className="px-2.5 py-1 rounded text-xs transition-colors"
                        style={completion === c.value
                          ? { background: 'var(--accent)', color: '#0A0A0A' }
                          : { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Prix d'achat (€)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                </div>

                {/* Purchase date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Date d'achat</label>
                  <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                </div>
              </div>

              {/* Édition */}
              <EditionField value={edition} onChange={setEdition} family={selected.selectedPlatformFamily} />

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Notes</label>
                <textarea rows={3} placeholder="Notes libres..." value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                  Annuler
                </button>
                <button onClick={() => addGame()} disabled={isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: '#0A0A0A' }}>
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  Ajouter à la collection
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
