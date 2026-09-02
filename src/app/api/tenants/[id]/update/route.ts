// src/app/api/tenants/[id]/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const {
    restaurant_name,
    owner_name,
    owner_email,
    owner_phone,
    city,
    plan_id,
    status,
    trial_ends_at,
  } = body

  const { error } = await supabaseAdmin
    .from('tenants')
    .update({
      restaurant_name,
      owner_name,
      owner_email,
      owner_phone,
      city,
      plan_id,
      status,
      trial_ends_at: trial_ends_at || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}