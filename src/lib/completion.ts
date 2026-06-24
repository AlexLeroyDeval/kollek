import { Completion } from '@/types'

/** Valeurs de complétude, ordonnées pour l'affichage (codes stables + labels FR). */
export const COMPLETIONS: { value: Completion; label: string }[] = [
  { value: 'loose', label: 'Vrac' },
  { value: 'cib', label: 'Complet en boîte' },
  { value: 'box_game', label: 'Boîte + Jeu' },
  { value: 'box_notice', label: 'Boîte + Notice' },
  { value: 'game_notice', label: 'Jeu + Notice' },
  { value: 'notice', label: 'Notice seule' },
  { value: 'box', label: 'Boîte seule' },
  { value: 'sealed', label: 'Neuf sous blister' },
]

export const COMPLETION_VALUES = COMPLETIONS.map((c) => c.value) as [Completion, ...Completion[]]

const LABEL_BY_VALUE = Object.fromEntries(COMPLETIONS.map((c) => [c.value, c.label])) as Record<Completion, string>

export function completionLabel(value: Completion | string): string {
  return LABEL_BY_VALUE[value as Completion] ?? value
}
