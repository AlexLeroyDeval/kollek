'use client'

/**
 * Pastille à bascule (filtres état/completion/édition). Active = accent,
 * inactive = fond + bordure. Rendu identique à l'ancien chip inline.
 */
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded text-xs transition-colors"
      style={active
        ? { background: 'var(--accent)', color: 'var(--on-accent)' }
        : { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
    >
      {children}
    </button>
  )
}
