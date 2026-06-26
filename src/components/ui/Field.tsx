'use client'

/** Affichage lecture seule : libellé + valeur. `accent` met la valeur en couleur d'accent. */
export function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-sm" style={accent ? { color: 'var(--accent)' } : undefined}>{value}</p>
    </div>
  )
}
