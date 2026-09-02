// src/app/api/plans/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plans: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, name, price_monthly, max_tables, max_staff, features } = body

  if (!id || !name || price_monthly == null) {
    return NextResponse.json(
      { error: 'id, name aur price_monthly zaroori hain' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('plans')
    .insert({
      id: id.trim().toLowerCase(),
      name: name.trim(),
      price_monthly,
      max_tables: max_tables ?? 10,
      max_staff: max_staff ?? 2,
      features: features ?? [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ plan: data })
}