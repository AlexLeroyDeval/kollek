/** Éditions proposées en choix rapides. `families` = constructeurs concernés
 *  (noms IGDB platform_family) ; absent = universel (toutes plateformes). */
export type EditionOption = { label: string; families?: string[] }

export const EDITIONS: EditionOption[] = [
  { label: 'Standard' },
  { label: 'Platinum', families: ['PlayStation'] },
  { label: 'Greatest Hits', families: ['PlayStation'] },
  { label: 'Essentials', families: ['PlayStation'] },
  { label: "Player's Choice", families: ['Nintendo'] },
  { label: 'Nintendo Selects', families: ['Nintendo'] },
  { label: 'Classics', families: ['Xbox'] },
  { label: 'Platinum Hits', families: ['Xbox'] },
  { label: 'Game of the Year' },
  { label: 'Édition limitée' },
  { label: 'Édition collector' },
]

/** Éditions pertinentes pour une famille de plateforme.
 *  Famille inconnue/null → on renvoie tout (pas de sur-filtrage). */
export function editionsForFamily(family?: string | null): string[] {
  return EDITIONS.filter((e) => !e.families || !family || e.families.includes(family)).map((e) => e.label)
}

/** Une édition vide ou « Standard » n'est pas affichée comme badge. */
export function isStandardEdition(edition: string | null | undefined): boolean {
  const e = edition?.trim().toLowerCase()
  return !e || e === 'standard'
}
