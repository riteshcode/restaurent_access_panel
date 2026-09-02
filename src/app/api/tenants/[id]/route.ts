// src/app/api/tenants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('tenants')
    .select(`
      *,
      plans ( id, name, price_monthly, max_tables, max_staff, features )
    `)
    .eq('id', id)
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('tenant_id', id)
    .maybeSingle()

  const { data: paymentEvents } = await supabaseAdmin
    .from('payment_events')
    .select('*')
    .eq('tenant_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  let orderCount: number | null = null
  if (tenant.schema_name) {
    const { data, error } = await supabaseAdmin.rpc('get_tenant_order_count', {
      schema: tenant.schema_name,
    })
    if (!error) orderCount = data
  }

  return NextResponse.json({
    tenant,
    subscription: subscription ?? null,
    paymentEvents: paymentEvents ?? [],
    orderCount,
  })
}