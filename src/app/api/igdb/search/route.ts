import { NextRequest, NextResponse } from 'next/server'
import { igdbQuery } from '@/lib/igdb/client'
import { similarity } from '@/lib/fuzzy'
import { createClient } from '@/lib/supabase/server'
import { IgdbGame } from '@/types'
import { z } from 'zod'

const schema = z.object({ q: z.string().min(1).max(100) })

// En-dessous de ce nombre de résultats, on déclenche le repli fuzzy
const SPARSE_THRESHOLD = 3
// On en remonte beaucoup : les portages d'un même titre sont des fiches IGDB
// distinctes, regroupées par jeu côté client. Sans marge, l'entrée d'une
// plateforme donnée (ex. Game Boy) peut tomber sous le seuil et disparaître.
const MAX_RESULTS = 50

// Champs jeu réutilisés pour les deux requêtes
const GAME_FIELDS =
  'name, cover.url, platforms.name, platforms.abbreviation, platforms.id, platforms.platform_family.name, first_release_date'

type AltNameResult = {
  id: number
  name: string
  game?: IgdbGame
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const result = schema.safeParse({ q: req.nextUrl.searchParams.get('q') })
  if (!result.success) return NextResponse.json({ error: 'Invalid query' }, { status: 400 })

  // Normalisation : guillemets retirés, espaces compactés, trim
  const q = result.data.q.replace(/"/g, '').replace(/\s+/g, ' ').trim()
  if (!q) return NextResponse.json([])

  // Requête 1 — search fuzzy classique (titres originaux/anglais)
  const searchQuery = igdbQuery<IgdbGame[]>(
    '/games',
    `search "${q}";
     fields ${GAME_FIELDS};
     where cover != null;
     limit 50;`
  )

  // Requête 2 — match sous-chaîne sur les titres alternatifs (titres FR/régionaux)
  // Le search d'IGDB n'indexe pas alternative_names, d'où ce contournement.
  const altQuery = igdbQuery<AltNameResult[]>(
    '/alternative_names',
    `fields name, game.${GAME_FIELDS.split(', ').join(', game.')};
     where name ~ *"${q}"*;
     limit 25;`
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
    // Si le jeu est déjà trouvé par son nom, on garde son titre canonique.
    // matched_alt_name n'est posé que pour les jeux trouvés UNIQUEMENT via titre alternatif.
    if (!byId.has(game.id)) {
      byId.set(game.id, { ...game, matched_alt_name: alt.name })
    }
  }

  // Cas nominal : assez de résultats → on préserve l'ordre de pertinence IGDB,
  // et on ajoute les trouvailles par titre FR (absentes du search) à la fin.
  if (byId.size >= SPARSE_THRESHOLD) {
    const searchIds = new Set(searchResults.map((g) => g.id))
    const ordered = [
      ...searchResults, // ordre IGDB (enrichis de matched_alt_name si applicable)
      ...[...byId.values()].filter((g) => !searchIds.has(g.id)), // alt-only
    ]
    return NextResponse.json(ordered.slice(0, MAX_RESULTS))
  }

  // Repli fuzzy : résultats trop maigres (faute de frappe probable).
  // On élargit le pool via une sous-chaîne robuste (début du mot le plus long,
  // là où les fautes sont rares), puis on re-classe par similarité.
  const longestToken = q.split(' ').sort((a, b) => b.length - a.length)[0] ?? q
  const seed = longestToken.slice(0, 4)

  if (seed.length >= 2) {
    // Pool noms de jeux + pool titres alternatifs (FR/régionaux), via le même seed
    const [namePool, altPool] = await Promise.all([
      igdbQuery<IgdbGame[]>(
        '/games',
        `fields ${GAME_FIELDS};
         where name ~ *"${seed}"* & cover != null;
         limit 50;`
      ).catch(() => [] as IgdbGame[]),
      igdbQuery<AltNameResult[]>(
        '/alternative_names',
        `fields name, game.${GAME_FIELDS.split(', ').join(', game.')};
         where name ~ *"${seed}"*;
         limit 50;`
      ).catch(() => [] as AltNameResult[]),
    ])

    for (const game of namePool) {
      if (!byId.has(game.id)) byId.set(game.id, game)
    }
    for (const alt of altPool) {
      const game = alt.game
      if (!game || !game.cover) continue
      if (!byId.has(game.id)) byId.set(game.id, { ...game, matched_alt_name: alt.name })
    }
  }

  // Classement par similarité au texte saisi
  const ranked = [...byId.values()]
    .map((game) => ({ game, score: similarity(q, game.name, game.matched_alt_name) }))
    .filter((r) => r.score >= 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((r) => r.game)

  return NextResponse.json(ranked)
}
