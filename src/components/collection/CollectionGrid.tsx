'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { CollectionEntry } from '@/types'
import { completionLabel } from '@/lib/completion'
import { CONDITION_COLOR, conditionLabel } from '@/lib/condition'
import { isStandardEdition } from '@/lib/editions'

export function CollectionGrid({ data, onSelect }: { data: CollectionEntry[]; onSelect: (e: CollectionEntry) => void }) {
  if (data.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Ta collection est vide. Ajoute ton premier jeu !</p>
    </div>
  )

  return (
    <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
      {data.map((entry, i) => {
        const game = entry.game
        const rawCover = game?.cover_front_url ?? null
        const coverUrl = rawCover?.startsWith('//') ? `https:${rawCover}` : rawCover

        return (
          <motion.div key={entry.id} onClick={() => onSelect(entry)}
            className="flex flex-col gap-2 group cursor-pointer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(i, 24) * 0.025, ease: [0.16, 1, 0.3, 1], y: { duration: 0.12, ease: 'easeOut' } }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.97 }}>
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
              <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full ring-2"
                style={{ background: CONDITION_COLOR[entry.condition], '--tw-ring-color': 'rgba(0,0,0,0.4)' } as React.CSSProperties}
                title={conditionLabel(entry.condition)} />

              {/* Badge Vendu (haut droite) */}
              {entry.is_sold && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: 'var(--accent)', color: '#0A0A0A' }}>
                  Vendu
                </div>
              )}

              {/* Badge nombre d'exemplaires (haut droite, sous le badge Vendu si présent) */}
              {entry.quantity > 1 && (
                <div className="absolute right-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  style={{ top: entry.is_sold ? '1.75rem' : '0.375rem', background: 'rgba(0,0,0,0.78)', color: 'var(--foreground)' }}>
                  ×{entry.quantity}
                </div>
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
