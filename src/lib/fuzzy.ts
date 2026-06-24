/** Normalise pour comparaison : minuscules, sans accents, espaces compactés. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritiques
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(s: string): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) {
    const bg = s.slice(i, i + 2)
    map.set(bg, (map.get(bg) ?? 0) + 1)
  }
  return map
}

/** Coefficient de Sørensen–Dice sur bigrammes — 0 (rien) à 1 (identique). */
export function dice(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) {
    return a.includes(b) || b.includes(a) ? 0.9 : 0
  }
  const A = bigrams(a)
  const B = bigrams(b)
  let inter = 0
  for (const [bg, countA] of A) {
    const countB = B.get(bg)
    if (countB) inter += Math.min(countA, countB)
  }
  return (2 * inter) / (a.length - 1 + (b.length - 1))
}

/** Similarité d'une requête à un jeu (meilleur score entre titre et titre alternatif). */
export function similarity(query: string, name: string, altName?: string): number {
  const q = normalize(query)
  const n = normalize(name)
  let best = dice(q, n)
  if (n.includes(q)) best = Math.max(best, 0.85) // bonus sous-chaîne exacte
  if (altName) {
    const alt = normalize(altName)
    best = Math.max(best, dice(q, alt))
    if (alt.includes(q)) best = Math.max(best, 0.85)
  }
  return best
}
