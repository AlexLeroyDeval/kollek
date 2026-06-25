'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CollectionEntry } from '@/types'
import { completionLabel } from '@/lib/completion'
import { isStandardEdition } from '@/lib/editions'
import { saleGainLoss } from '@/lib/pricing'
import { Badge } from '@/components/ui/Badge'
import { ConditionDot } from '@/components/ui/ConditionDot'

/**
 * Clé de regroupement des exemplaires en grille.
 * Une copie vendue n'est jamais empilée (chaque vente est un événement distinct) :
 * elle forme son propre groupe. Les copies possédées strictement identiques
 * (jeu + état + completion + édition) sont empilées en une seule carte.
 */
function groupKey(entry: CollectionEntry): string {
  if (entry.is_sold) return `sold:${entry.id}`
  return `own:${entry.game_id}|${entry.condition}|${entry.completion}|${entry.edition ?? ''}`
}

export function CollectionGrid({ data, onSelect }: { data: CollectionEntry[]; onSelect: (e: CollectionEntry) => void }) {
  // Regroupe en préservant l'ordre d'apparition (donc le tri appliqué en amont).
  const groups = useMemo(() => {
    const result: { key: string; entries: CollectionEntry[] }[] = []
    const index = new Map<string, number>()
    for (const entry of data) {
      const key = groupKey(entry)
      const at = index.get(key)
      if (at != null) result[at].entries.push(entry)
      else {
        index.set(key, result.length)
        result.push({ key, entries: [entry] })
      }
    }
    // Au sein d'un groupe, ordonner par id : le représentant (entries[0]) est ainsi
    // le 1er exemplaire, cohérent avec la numérotation de la modale (siblings triés par id).
    for (const group of result) group.entries.sort((a, b) => a.id - b.id)
    return result
  }, [data])

  if (data.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Ta collection est vide. Ajoute ton premier jeu !</p>
    </div>
  )

  return (
    <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
      {groups.map((group, i) => {
        const entry = group.entries[0] // représentant (les copies empilées sont identiques)
        const count = group.entries.length
        const game = entry.game
        const rawCover = game?.cover_front_url ?? null
        const coverUrl = rawCover?.startsWith('//') ? `https:${rawCover}` : rawCover
        const gain = saleGainLoss(entry)

        return (
          <motion.div key={group.key} onClick={() => onSelect(entry)}
            className="flex flex-col gap-2 group cursor-pointer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 24) * 0.025, ease: [0.16, 1, 0.3, 1], y: { duration: 0.12, ease: 'easeOut' } }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}>
            <div className="relative">
              {/* Couches décalées : effet de pile pour les exemplaires multiples */}
              {count > 1 && (
                <div aria-hidden className="absolute inset-0 rounded-lg"
                  style={{ transform: 'translate(5px, 5px)', background: 'var(--surface)', boxShadow: '0 0 0 1px var(--border)' }} />
              )}
              {count > 2 && (
                <div aria-hidden className="absolute inset-0 rounded-lg"
                  style={{ transform: 'translate(2.5px, 2.5px)', background: 'var(--surface)', boxShadow: '0 0 0 1px var(--border)' }} />
              )}

              <div className="relative aspect-[3/4] rounded-lg overflow-hidden"
                style={{ background: 'var(--surface)', boxShadow: '0 0 0 1px var(--border)' }}>
                {coverUrl ? (
                  <Image src={coverUrl} alt={game?.title ?? ''} fill sizes="(max-width: 640px) 33vw, 160px"
                    className={`object-cover transition-transform duration-150 group-hover:scale-105 ${entry.is_sold ? 'opacity-50 grayscale' : ''}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-center p-2"
                    style={{ color: 'var(--muted)' }}>
                    {game?.title}
                  </div>
                )}

                {/* Pastille d'état (haut gauche) */}
                <ConditionDot condition={entry.condition} ring className="absolute top-1.5 left-1.5 w-2.5 h-2.5" />

                {/* Badge Vendu (haut droite) — la plus/moins-value est en tooltip au hover.
                    Une copie vendue n'est jamais empilée, donc pas de conflit avec le compteur. */}
                {entry.is_sold && (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Badge tone="accent" size="sm" className="absolute top-1.5 right-1.5 font-semibold uppercase tracking-wide cursor-default">
                        Vendu
                      </Badge>
                    </Tooltip.Trigger>
                    {gain && (
                      <Tooltip.Portal>
                        <Tooltip.Content side="top" sideOffset={4} className="tooltip-content z-50 rounded px-2 py-1 text-xs font-medium flex items-center gap-1"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: gain.isGain ? 'var(--success)' : 'var(--danger)' }}>
                          {gain.isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {gain.isGain ? '+' : '−'}{Math.abs(gain.percent)}%
                          <Tooltip.Arrow style={{ fill: 'var(--border)' }} />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    )}
                  </Tooltip.Root>
                )}

                {/* Compteur d'exemplaires identiques (haut droite) */}
                {count > 1 && (
                  <Badge tone="accent" size="sm" className="absolute top-1.5 right-1.5 font-semibold" title={`${count} exemplaires identiques`}>
                    ×{count}
                  </Badge>
                )}

                {/* Badge Édition (bas) */}
                {!isStandardEdition(entry.edition) && (
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium truncate text-center"
                    style={{ background: 'rgba(0,0,0,0.78)', color: 'var(--foreground)' }}
                    title={entry.edition!}>
                    {entry.edition}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{game?.title}</p>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {game?.platform?.abbreviation ?? game?.platform?.name} · {completionLabel(entry.completion)}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
