/**
 * Normalise une saisie de quantité en entier >= 1.
 * parseInt tronque la partie décimale ("1.01" → 1) et s'arrête au premier
 * caractère non numérique ; vide ou < 1 est ramené à 1.
 */
export function parseQuantity(value: string): number {
  const n = parseInt(value, 10)
  return Number.isNaN(n) ? 1 : Math.max(1, n)
}
