// src/app/api/tenants/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select(`
      id,
      slug,
      restaurant_name,
      owner_name,
      owner_email,
      owner_phone,
      city,
      plan_id,
      schema_name,
      status,
      trial_ends_at,
      created_at,
      is_suspended,
      plans ( name, price_monthly )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Tenants fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tenants: data })
}