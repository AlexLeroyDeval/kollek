'use client'

import { forwardRef } from 'react'

export type BadgeTone = 'accent' | 'success' | 'muted' | 'edition' | 'overlay'
export type BadgeSize = 'sm' | 'md'

const TONE: Record<BadgeTone, React.CSSProperties> = {
  accent: { background: 'var(--accent)', color: 'var(--on-accent)' },
  success: { background: 'var(--success-soft)', color: 'var(--success)' },
  muted: { background: 'var(--surface)', color: 'var(--muted)' },
  edition: { background: 'var(--surface-hover)', color: 'var(--accent)' },
  overlay: { background: 'rgba(0, 0, 0, 0.78)', color: 'var(--foreground)' },
}

const SIZE: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
  size?: BadgeSize
}

/** Pastille d'information (statut, édition, compteur…). forwardRef pour servir
 *  de déclencheur Radix (ex. Tooltip.Trigger asChild). Position et modificateurs
 *  (font-weight, uppercase, truncate) passent par className. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'muted', size = 'sm', className = '', style, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded font-medium ${SIZE[size]} ${className}`}
      style={{ ...TONE[tone], ...style }}
      {...props}
    >
      {children}
    </span>
  )
})
