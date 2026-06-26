'use client'

import { Condition } from '@/types'
import { CONDITION_COLOR, conditionLabel } from '@/lib/condition'

/**
 * Badge d'état : fond légèrement teinté de la couleur de notation + libellé de
 * cette couleur. L'échelle (vert → rouge) est définie dans condition.ts, source
 * unique. Sur la jaquette (grille) on garde un simple dot pour ne pas la charger.
 */
export function ConditionBadge({ condition }: { condition: Condition }) {
  const color = CONDITION_COLOR[condition] ?? 'var(--muted)'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
      style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
    >
      {conditionLabel(condition)}
    </span>
  )
}
