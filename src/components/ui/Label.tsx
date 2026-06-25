'use client'

/** Libellé de champ de formulaire (texte muted, petit). */
export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
      {children}
    </label>
  )
}
