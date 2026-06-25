'use client'

import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'ghostDanger' | 'dangerSolid'
export type ButtonSize = 'xs' | 'sm' | 'md'

const SIZE_CLASS: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
}

const VARIANT_STYLE: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 500 },
  secondary: { background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' },
  ghost: { color: 'var(--muted)' },
  ghostDanger: { color: 'var(--danger)' },
  dangerSolid: { background: 'var(--danger)', color: 'var(--on-accent)', fontWeight: 500 },
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Affiche un spinner et désactive le bouton. */
  loading?: boolean
  /** Icône en tête (remplacée par le spinner quand loading). */
  icon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, className = '', style, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:opacity-50 ${SIZE_CLASS[size]} ${className}`}
      style={{ ...VARIANT_STYLE[variant], ...style }}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
    </button>
  )
})
