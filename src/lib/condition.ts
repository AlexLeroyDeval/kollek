import { Condition } from '@/types'

/** États, ordonnés du meilleur au pire (valeur = code stocké en base, label FR affiché). */
export const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'Mint', label: 'Comme neuf' },
  { value: 'Very Good', label: 'Très bon' },
  { value: 'Good', label: 'Bon' },
  { value: 'Fair', label: 'Moyen' },
  { value: 'Poor', label: 'Mauvais' },
]

/** Couleur associée à chaque état, du meilleur au pire. */
export const CONDITION_COLOR: Record<Condition, string> = {
  'Mint': '#4ade80',
  'Very Good': '#86efac',
  'Good': '#fbbf24',
  'Fair': '#fb923c',
  'Poor': '#f87171',
}

const LABEL_BY_VALUE = Object.fromEntries(CONDITIONS.map((c) => [c.value, c.label])) as Record<Condition, string>

export function conditionLabel(value: Condition | string): string {
  return LABEL_BY_VALUE[value as Condition] ?? value
}
