'use client'

import Image from 'next/image'
import { CollectionEntry } from '@/types'
import { completionLabel } from '@/lib/completion'

export function CollectionGrid({ data, onSelect }: { data: CollectionEntry[]; onSelect: (e: CollectionEntry) => void }) {
  if (data.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Ta collection est vide. Ajoute ton premier jeu !</p>
    </div>
  )

  return (
    <div className="p-6 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
      {data.map((entry) => {
        const game = entry.game
        const coverUrl = game?.cover_front_url ?? null

        return (
          <div key={entry.id} onClick={() => onSelect(entry)} className="flex flex-col gap-2 group cursor-pointer">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden"
              style={{ background: 'var(--surface)' }}>
              {coverUrl ? (
                <Image src={coverUrl} alt={game?.title ?? ''} fill className="object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-center p-2"
                  style={{ color: 'var(--muted)' }}>
                  {game?.title}
                </div>
              )}
              {entry.is_sold && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ background: 'rgba(0,0,0,0.75)', color: 'var(--muted)' }}>
                  Vendu
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{game?.title}</p>
              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {game?.platform?.abbreviation ?? game?.platform?.name} · {completionLabel(entry.completion)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
