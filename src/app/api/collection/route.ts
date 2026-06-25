import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { igdbQuery } from '@/lib/igdb/client'
import { COMPLETION_VALUES } from '@/lib/completion'
import { z } from 'zod'

// IGDB region id pour l'Europe (parapluie PAL)
const REGION_EU = 4

/** Cherche la cover EU/PAL d'un jeu ; retourne null si absente. */
async function getEuCoverUrl(igdbId: number): Promise<string | null> {
  try {
    const localizations = await igdbQuery<{ cover?: { url: string } }[]>(
      '/game_localizations',
      `fields cover.url; where game = ${igdbId} & region = ${REGION_EU} & cover != null; limit 1;`
    )
    return localizations[0]?.cover?.url ?? null
  } catch {
    return null
  }
}

const addSchema = z.object({
  igdb_id: z.number(),
  platform_igdb_id: z.number(),
  platform_name: z.string(),
  platform_abbreviation: z.string().optional(),
  platform_family: z.string().optional(),
  title: z.string(),
  release_year: z.number().optional(),
  cover_front_url: z.string().optional(),
  condition: z.enum(['Mint', 'Very Good', 'Good', 'Fair', 'Poor']),
  completion: z.enum(COMPLETION_VALUES),
  edition: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  purchase_price: z.number().optional(),
  purchase_date: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = addSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const data = result.data
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // 1. Upsert platform
  const { data: platform, error: platformError } = await supabase
    .from('platform')
    .upsert({ igdb_id: data.platform_igdb_id, name: data.platform_name, abbreviation: data.platform_abbreviation ?? null, manufacturer: data.platform_family ?? null }, { onConflict: 'igdb_id' })
    .select('id')
    .single()

  if (platformError) return NextResponse.json({ error: platformError.message }, { status: 500 })

  // 2. Préfère la cover EU/PAL si disponible, sinon la cover par défaut
  const euCover = await getEuCoverUrl(data.igdb_id)
  const sourceCover = euCover ?? data.cover_front_url ?? null

  // 3. Copy cover to Supabase Storage
  // URL IGDB absolue (jamais protocole-relative) + grande taille — sert aussi de fallback
  let cover_front_url: string | null = null
  if (sourceCover) {
    const igdbUrl = (sourceCover.startsWith('//')
      ? `https:${sourceCover}`
      : sourceCover
    ).replace('t_thumb', 't_cover_big')
    cover_front_url = igdbUrl // fallback absolu si l'upload échoue

    try {
      const imgRes = await fetch(igdbUrl)
      const blob = await imgRes.arrayBuffer()
      const ext = igdbUrl.split('.').pop() ?? 'jpg'
      const path = `igdb/${data.igdb_id}_${data.platform_igdb_id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(path, blob, { contentType: `image/${ext}`, upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path)
        cover_front_url = urlData.publicUrl
      }
    } catch {
      // Keep IGDB URL as fallback
    }
  }

  // 4. Upsert game
  const { data: game, error: gameError } = await supabase
    .from('game')
    .upsert(
      { igdb_id: data.igdb_id, platform_id: platform.id, title: data.title, release_year: data.release_year ?? null, cover_front_url },
      { onConflict: 'igdb_id,platform_id' }
    )
    .select('id')
    .single()

  if (gameError) return NextResponse.json({ error: gameError.message }, { status: 500 })

  // 5. Insert collection entry
  const { data: entry, error: collectionError } = await supabase
    .from('collection')
    .insert({
      game_id: game.id,
      condition: data.condition,
      completion: data.completion,
      edition: data.edition?.trim() || null,
      quantity: data.quantity,
      purchase_price: data.purchase_price ?? null,
      purchase_date: data.purchase_date ?? null,
      notes: data.notes ?? null,
    })
    .select('id')
    .single()

  if (collectionError) return NextResponse.json({ error: collectionError.message }, { status: 500 })

  return NextResponse.json({ id: entry.id }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data, error } = await supabase
    .from('collection')
    .select(`
      *,
      game (
        *,
        platform (*)
      )
    `)
    .order('added_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
