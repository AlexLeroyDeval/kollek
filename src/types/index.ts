export type Platform = {
  id: number
  igdb_id: number
  name: string
  manufacturer: string | null
  release_year: number | null
  generation: number | null
  abbreviation: string | null
}

export type Game = {
  id: number
  igdb_id: number
  platform_id: number
  title: string
  release_year: number | null
  region: string | null
  cover_front_url: string | null
  cover_back_url: string | null
  cover_spine_url: string | null
  screenscraper_id: number | null
  platform?: Platform
}

export type Condition = 'Mint' | 'Very Good' | 'Good' | 'Fair' | 'Poor'
export type Completion =
  | 'loose'
  | 'cib'
  | 'box_game'
  | 'box_notice'
  | 'game_notice'
  | 'notice'
  | 'box'
  | 'sealed'

export type CollectionEntry = {
  id: number
  game_id: number
  condition: Condition
  completion: Completion
  edition: string | null
  purchase_price: number | null
  purchase_date: string | null
  is_sold: boolean
  sale_price: number | null
  sale_date: string | null
  notes: string | null
  added_at: string
  game?: Game
}

export type IgdbGame = {
  id: number
  name: string
  cover?: { id: number; url: string }
  platforms?: { id: number; name: string; abbreviation?: string; platform_family?: { id: number; name: string } }[]
  first_release_date?: number
  genres?: { id: number; name: string }[]
  involved_companies?: {
    id: number
    company: { id: number; name: string }
    developer: boolean
    publisher: boolean
  }[]
  /** Titre alternatif (ex: FR) qui a permis de matcher ce jeu, si applicable */
  matched_alt_name?: string
}

export type ViewMode = 'shelf' | 'grid' | 'list'

export type CollectionFilters = {
  platform_id?: number
  condition?: Condition
  completion?: Completion
  show_sold?: boolean
}

export type SortField = 'added_at' | 'title'
export type SortDirection = 'asc' | 'desc'
