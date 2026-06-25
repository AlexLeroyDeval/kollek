import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { COMPLETION_VALUES } from '@/lib/completion'
import { z } from 'zod'

const updateSchema = z.object({
  condition: z.enum(['Mint', 'Very Good', 'Good', 'Fair', 'Poor']).optional(),
  completion: z.enum(COMPLETION_VALUES).optional(),
  edition: z.string().nullable().optional(),
  quantity: z.number().int().min(1).optional(),
  purchase_price: z.number().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  is_sold: z.boolean().optional(),
  sale_price: z.number().nullable().optional(),
  sale_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collection')
    .update(result.data)
    .eq('id', Number(id))
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.from('collection').delete().eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
