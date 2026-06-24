import { NextRequest, NextResponse } from 'next/server'
import { igdbQuery } from '@/lib/igdb/client'
import { IgdbGame } from '@/types'
import { z } from 'zod'

const schema = z.object({ q: z.string().min(1).max(100) })

// Champs jeu réutilisés pour les deux requêtes
const GAME_FIELDS =
  'name, cover.url, platforms.name, platforms.abbreviation, platforms.id, first_release_date'

type AltNameResult = {
  id: number
  name: string
  game?: IgdbGame
}

export async function GET(req: NextRequest) {
  const result = schema.safeParse({ q: req.nextUrl.searchParams.get('q') })
  if (!result.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 })

  // On retire les guillemets pour ne pas casser la requête Apicalypse
  const q = result.data.q.replace(/"/g, '').trim()
  if (!q) return NextResponse.json([])

  // Requête 1 — search fuzzy classique (titres originaux/anglais)
  const searchQuery = igdbQuery<IgdbGame[]>(
    '/games',
    `search "${q}";
     fields ${GAME_FIELDS};
     where cover != null;
     limit 20;`
  )

  // Requête 2 — match sous-chaîne sur les titres alternatifs (titres FR/régionaux)
  // Le search d'IGDB n'indexe pas alternative_names, d'où ce contournement.
  const altQuery = igdbQuery<AltNameResult[]>(
    '/alternative_names',
    `fields name, game.${GAME_FIELDS.split(', ').join(', game.')};
     where name ~ *"${q}"*;
     limit 15;`
  )

  const [searchResults, altResults] = await Promise.all([
    searchQuery.catch(() => [] as IgdbGame[]),
    altQuery.catch(() => [] as AltNameResult[]),
  ])

  // Fusion + dédup par game.id
  const byId = new Map<number, IgdbGame>()

  for (const game of searchResults) {
    byId.set(game.id, game)
  }

  for (const alt of altResults) {
    const game = alt.game
    if (!game || !game.cover) continue // on garde la cohérence : cover obligatoire
    const existing = byId.get(game.id)
    if (existing) {
      // déjà présent via search → on enrichit juste avec le titre matché
      existing.matched_alt_name = alt.name
    } else {
      byId.set(game.id, { ...game, matched_alt_name: alt.name })
    }
  }

  // Les jeux matchés par titre FR remontent en tête
  const merged = [...byId.values()].sort((a, b) => {
    const aAlt = a.matched_alt_name ? 0 : 1
    const bAlt = b.matched_alt_name ? 0 : 1
    return aAlt - bAlt
  })

  return NextResponse.json(merged)
}
