'use client'

/** Select natif stylé (filtres). */
export function Select({
  value,
  onChange,
  children,
  className = '',
  'aria-label': ariaLabel,
}: {
  value: string | number
  onChange: (v: string) => void
  children: React.ReactNode
  className?: string
  'aria-label'?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={`px-2.5 py-1.5 rounded-lg text-xs outline-none cursor-pointer ${className}`}
      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
    >
      {children}
    </select>
  )
}
