'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Trash2, Loader2, Pencil, Tag, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { CollectionEntry, Condition, Completion } from '@/types'
import { COMPLETIONS, completionLabel } from '@/lib/completion'
import { CONDITIONS, CONDITION_COLOR, conditionLabel } from '@/lib/condition'
import { isStandardEdition } from '@/lib/editions'
import { EditionField } from './EditionField'

export function GameDetailDialog({ entry, siblings, onNavigate, onClose }: {
  entry: CollectionEntry | null
  siblings: CollectionEntry[]
  onNavigate: (id: number) => void
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [sellMode, setSellMode] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [condition, setCondition] = useState<Condition>('Very Good')
  const [completion, setCompletion] = useState<Completion>('loose')
  const [edition, setEdition] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [notes, setNotes] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [saleDate, setSaleDate] = useState('')

  useEffect(() => {
    if (entry) {
      setCondition(entry.condition)
      setCompletion(entry.completion)
      setEdition(entry.edition ?? '')
      setPurchasePrice(entry.purchase_price?.toString() ?? '')
      setPurchaseDate(entry.purchase_date ?? '')
      setNotes(entry.notes ?? '')
      setSalePrice(entry.sale_price?.toString() ?? '')
      setSaleDate(entry.sale_date ?? '')
      setEditing(false)
      setSellMode(false)
      setConfirmDelete(false)
    }
    // Dépend de l'id seulement : on réinitialise le formulaire au changement de
    // sélection, pas à chaque refetch du même item (sinon une saisie en cours saute).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id])

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const res = await fetch(`/api/collection/${entry!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: (_data, patch) => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      if (patch.is_sold === true) toast.success(`${game?.title} marqué comme vendu`)
      else if (patch.is_sold === false) toast.success('Vente annulée')
      else toast.success('Fiche mise à jour')
      setEditing(false)
      setSellMode(false)
    },
    onError: () => toast.error('Échec de la mise à jour'),
  })

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/collection/${entry!.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      toast.success(`${game?.title} supprimé de la collection`)
      // S'il reste d'autres exemplaires du jeu, on bascule dessus ; sinon on ferme.
      const next = siblings.find((s) => s.id !== entry!.id)
      if (next) onNavigate(next.id)
      else onClose()
    },
    onError: () => toast.error('Échec de la suppression'),
  })

  const { mutate: duplicate, isPending: duplicating } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/collection/${entry!.id}/duplicate`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to duplicate')
      return res.json() as Promise<{ id: number }>
    },
    onSuccess: async (created) => {
      // Attendre le refetch pour que le nouvel exemplaire existe dans data avant
      // d'y naviguer (sinon entry serait introuvable et la modale se fermerait).
      await queryClient.invalidateQueries({ queryKey: ['collection'] })
      toast.success('Exemplaire dupliqué')
      onNavigate(created.id)
    },
    onError: () => toast.error('Échec de la duplication'),
  })

  if (!entry) return null

  const game = entry.game
  const rawCover = game?.cover_front_url ?? null
  const coverUrl = rawCover?.startsWith('//') ? `https:${rawCover}` : rawCover

  // Position de l'exemplaire courant parmi toutes les copies du jeu.
  const index = siblings.findIndex((s) => s.id === entry.id)
  const total = siblings.length

  function handleSaveEdit() {
    save({
      condition,
      completion,
      edition: edition.trim() || null,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
      purchase_date: purchaseDate || null,
      notes: notes || null,
    })
  }

  function handleSell() {
    save({
      is_sold: true,
      sale_price: salePrice ? parseFloat(salePrice) : null,
      sale_date: saleDate || null,
    })
  }

  function handleUnsell() {
    save({ is_sold: false, sale_price: null, sale_date: null })
  }

  return (
    <Dialog.Root open={!!entry} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-40" />
        <Dialog.Content className="dialog-content fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6 shadow-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

          <div className="flex items-start justify-between mb-6 gap-4">
            <Dialog.Title className="text-lg font-semibold leading-tight">{game?.title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded hover:opacity-60 transition-opacity flex-shrink-0"><X size={18} /></button>
            </Dialog.Close>
          </div>

          {/* Navigation entre exemplaires du même jeu */}
          {total > 1 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  Exemplaire {index + 1} / {total}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={() => onNavigate(siblings[index - 1].id)} disabled={index <= 0}
                    aria-label="Exemplaire précédent"
                    className="p-1 rounded transition-opacity disabled:opacity-30 hover:opacity-70"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                    <ChevronLeft size={15} />
                  </button>
                  <button onClick={() => onNavigate(siblings[index + 1].id)} disabled={index >= total - 1}
                    aria-label="Exemplaire suivant"
                    className="p-1 rounded transition-opacity disabled:opacity-30 hover:opacity-70"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {siblings.map((s, idx) => {
                  const active = s.id === entry.id
                  return (
                    <button key={s.id} onClick={() => onNavigate(s.id)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors"
                      style={active
                        ? { background: 'var(--accent)', color: 'var(--on-accent)' }
                        : { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: active ? 'var(--on-accent)' : (CONDITION_COLOR[s.condition] ?? 'var(--muted)') }} />
                      #{idx + 1} · {conditionLabel(s.condition)}{s.is_sold ? ' · Vendu' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-6">
            {/* Cover */}
            <div className="flex-shrink-0 w-40">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden" style={{ background: 'var(--background)' }}>
                {coverUrl ? (
                  <Image src={coverUrl} alt={game?.title ?? ''} fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs p-2" style={{ color: 'var(--muted)' }}>
                    {game?.title}
                  </div>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                {game?.platform?.name}{game?.release_year && ` · ${game.release_year}`}
              </p>
            </div>

            {/* Details / edit */}
            <div className="flex-1 min-w-0 space-y-4">
              {!editing ? (
                <>
                  <Field label="État" value={conditionLabel(entry.condition)} />
                  <Field label="Completion" value={completionLabel(entry.completion)} />
                  {!isStandardEdition(entry.edition) && <Field label="Édition" value={entry.edition!} accent />}
                  <Field label="Prix d'achat" value={entry.purchase_price != null ? `${entry.purchase_price} €` : '—'} />
                  <Field label="Date d'achat" value={entry.purchase_date ? new Date(entry.purchase_date).toLocaleDateString('fr-FR') : '—'} />
                  {entry.is_sold && (
                    <>
                      <Field label="Prix de vente" value={entry.sale_price != null ? `${entry.sale_price} €` : '—'} accent />
                      <Field label="Date de vente" value={entry.sale_date ? new Date(entry.sale_date).toLocaleDateString('fr-FR') : '—'} accent />
                    </>
                  )}
                  {entry.notes && <Field label="Notes" value={entry.notes} />}
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>État</label>
                    <div className="flex flex-wrap gap-1.5">
                      {CONDITIONS.map((c) => (
                        <Chip key={c.value} active={condition === c.value} onClick={() => setCondition(c.value)}>{c.label}</Chip>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Completion</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMPLETIONS.map((c) => (
                        <Chip key={c.value} active={completion === c.value} onClick={() => setCompletion(c.value)}>{c.label}</Chip>
                      ))}
                    </div>
                  </div>
                  <EditionField value={edition} onChange={setEdition} family={game?.platform?.manufacturer} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Prix d'achat (€)" type="number" value={purchasePrice} onChange={setPurchasePrice} />
                    <Input label="Date d'achat" type="date" value={purchaseDate} onChange={setPurchaseDate} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Notes</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                </>
              )}

              {/* Sell form */}
              {sellMode && (
                <div className="p-3 rounded-lg space-y-3" style={{ background: 'var(--background)' }}>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Marquer comme vendu</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Prix de vente (€)" type="number" value={salePrice} onChange={setSalePrice} />
                    <Input label="Date de vente" type="date" value={saleDate} onChange={setSaleDate} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-6 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--danger)' }}>Confirmer ?</span>
                <button onClick={() => remove()} disabled={removing}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'var(--danger)', color: 'var(--on-accent)' }}>
                  {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Supprimer
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button onClick={() => setConfirmDelete(true)} disabled={removing}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  style={{ color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                  Supprimer
                </button>
                <button onClick={() => duplicate()} disabled={duplicating}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 hover:opacity-70"
                  style={{ color: 'var(--muted)' }}
                  title="Créer un exemplaire identique">
                  {duplicating ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                  Dupliquer
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>Annuler</button>
                  <button onClick={handleSaveEdit} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
                    {saving && <Loader2 size={14} className="animate-spin" />}Enregistrer
                  </button>
                </>
              ) : sellMode ? (
                <>
                  <button onClick={() => setSellMode(false)} className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>Annuler</button>
                  <button onClick={handleSell} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
                    {saving && <Loader2 size={14} className="animate-spin" />}Confirmer la vente
                  </button>
                </>
              ) : (
                <>
                  {entry.is_sold ? (
                    <button onClick={handleUnsell} disabled={saving} className="px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                      Annuler la vente
                    </button>
                  ) : (
                    <button onClick={() => setSellMode(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                      <Tag size={14} />Vendre
                    </button>
                  )}
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
                    <Pencil size={14} />Modifier
                  </button>
                </>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-sm" style={accent ? { color: 'var(--accent)' } : undefined}>{value}</p>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="px-2.5 py-1 rounded text-xs transition-colors"
      style={active
        ? { background: 'var(--accent)', color: 'var(--on-accent)' }
        : { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
      {children}
    </button>
  )
}

function Input({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</label>
      <input type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.01' : undefined}
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
        style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
    </div>
  )
}
