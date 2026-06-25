import { CollectionEntry } from '@/types'

export type GainLoss = {
  /** Pourcentage signé par rapport au prix d'achat (positif = plus-value). */
  percent: number
  isGain: boolean
}

/**
 * Plus/moins-value en pourcentage du prix d'achat, pour un item vendu.
 * Retourne null si l'item n'est pas vendu, si un prix manque, si le prix
 * d'achat est nul (division impossible), ou si le résultat est neutre.
 */
export function saleGainLoss(entry: Pick<CollectionEntry, 'is_sold' | 'purchase_price' | 'sale_price'>): GainLoss | null {
  const { is_sold, purchase_price, sale_price } = entry
  if (!is_sold || purchase_price == null || sale_price == null || purchase_price === 0) {
    return null
  }
  const delta = sale_price - purchase_price
  // Arrondi à 1 décimale pour éviter les artefacts flottants.
  const percent = Math.round((delta / purchase_price) * 1000) / 10
  if (percent === 0) return null
  return { percent, isGain: percent > 0 }
}
