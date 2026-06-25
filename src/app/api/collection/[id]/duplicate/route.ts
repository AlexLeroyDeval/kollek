import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Duplique un exemplaire existant en une nouvelle ligne possédée (statut vendu remis à zéro).
// Le user_id est rempli par défaut via auth.uid() à l'insert ; la RLS sur le select
// garantit qu'on ne clone que ses propres entrées.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: src, error: readError } = await supabase
    .from('collection')
    .select('game_id, condition, completion, edition, purchase_price, purchase_date, notes')
    .eq('id', Number(id))
    .single()

  if (readError || !src) return NextResponse.json({ error: 'Exemplaire introuvable' }, { status: 404 })

  const { data: created, error: insertError } = await supabase
    .from('collection')
    .insert({ ...src, is_sold: false, sale_price: null, sale_date: null })
    .select('id')
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  return NextResponse.json({ id: created.id }, { status: 201 })
}
