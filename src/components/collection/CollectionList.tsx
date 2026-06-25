'use client'

import { useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { CollectionEntry } from '@/types'
import { completionLabel } from '@/lib/completion'
import { CONDITION_COLOR, conditionLabel } from '@/lib/condition'
import { isStandardEdition } from '@/lib/editions'
import { saleGainLoss } from '@/lib/pricing'

export function CollectionList({ data, onSelect, activeId }: { data: CollectionEntry[]; onSelect: (e: CollectionEntry) => void; activeId?: number | null }) {
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map())

  // Quand l'exemplaire actif change (navigation depuis la modale), scrolle sa ligne en vue.
  useEffect(() => {
    if (activeId == null) return
    rowRefs.current.get(activeId)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeId])

  if (data.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Ta collection est vide. Ajoute ton premier jeu !</p>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
            {['Jeu', 'Plateforme', 'État', 'Completion', 'Prix achat', 'Date achat', 'Statut'].map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--muted)' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const gain = saleGainLoss(entry)
            const active = entry.id === activeId
            return (
            <tr key={entry.id}
              ref={(el) => { if (el) rowRefs.current.set(entry.id, el); else rowRefs.current.delete(entry.id) }}
              onClick={() => onSelect(entry)} className="transition-colors hover:opacity-80 cursor-pointer"
              style={{
                borderBottom: '1px solid var(--border)',
                background: active ? 'var(--surface-hover)' : undefined,
                boxShadow: active ? 'inset 2px 0 0 var(--accent)' : undefined,
              }}>
              <td className="px-4 py-3 font-medium max-w-[280px]">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{entry.game?.title ?? '—'}</span>
                  {!isStandardEdition(entry.edition) && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: 'var(--surface-hover)', color: 'var(--accent)' }}>
                      {entry.edition}
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                {entry.game?.platform?.abbreviation ?? entry.game?.platform?.name ?? '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: CONDITION_COLOR[entry.condition] ?? 'var(--muted)' }} />
                  {conditionLabel(entry.condition)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>{completionLabel(entry.completion)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {entry.purchase_price != null ? `${entry.purchase_price} €` : <span style={{ color: 'var(--muted)' }}>—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                {entry.purchase_date ? new Date(entry.purchase_date).toLocaleDateString('fr-FR') : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {entry.is_sold ? (
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'var(--surface)', color: 'var(--muted)' }}>Vendu</span>
                    {entry.sale_price != null && (
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{entry.sale_price} €</span>
                    )}
                    {gain && (
                      <span className="flex items-center gap-0.5 text-xs font-medium"
                        style={{ color: gain.isGain ? '#4ade80' : '#f87171' }}
                        title="Plus/moins-value par rapport au prix d'achat">
                        {gain.isGain ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {gain.isGain ? '+' : '−'}{Math.abs(gain.percent)}%
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>En collection</span>
                )}
              </td>
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
