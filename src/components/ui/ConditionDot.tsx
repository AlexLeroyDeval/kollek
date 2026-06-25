'use client'

import { Condition } from '@/types'
import { CONDITION_COLOR, conditionLabel } from '@/lib/condition'

/**
 * Forme compacte de l'indicateur d'état : un point coloré, pour les contextes
 * denses (jaquette en grille) où l'on ne veut pas du label. Même palette que
 * [ConditionBadge], source unique condition.ts. `ring` ajoute un liseré sombre
 * pour le contraste quand le dot est posé sur une image.
 */
export function ConditionDot({
  condition,
  ring = false,
  className = 'w-2.5 h-2.5',
}: {
  condition: Condition
  ring?: boolean
  className?: string
}) {
  const color = CONDITION_COLOR[condition] ?? 'var(--muted)'
  const label = conditionLabel(condition)
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-block rounded-full flex-shrink-0 ${ring ? 'ring-2' : ''} ${className}`}
      style={{ background: color, ...(ring ? ({ '--tw-ring-color': 'rgba(0,0,0,0.4)' } as React.CSSProperties) : {}) }}
    />
  )
}
