import { Condition } from '@/types'

/** Couleur associée à chaque état, du meilleur au pire. */
export const CONDITION_COLOR: Record<Condition, string> = {
  'Mint': '#4ade80',
  'Very Good': '#86efac',
  'Good': '#fbbf24',
  'Fair': '#fb923c',
  'Poor': '#f87171',
}
