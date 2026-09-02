// src/app/api/plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  // Kitne tenants is plan pe hain — UI mein warning dikhane ke liye
  const { count: tenantCount } = await supabaseAdmin
    .from('tenants')
    .select('*', { count: 'exact', head: true })
    .eq('plan_id', id)

  return NextResponse.json({ plan: data, tenantCount: tenantCount ?? 0 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { name, price_monthly, max_tables, max_staff, features, is_active } = body

  const { error } = await supabaseAdmin
    .from('plans')
    .update({ name, price_monthly, max_tables, max_staff, features, is_active })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}