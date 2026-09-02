// src/app/api/subscriptions/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select(`
      id,
      tenant_id,
      plan_id,
      razorpay_sub_id,
      razorpay_customer_id,
      status,
      current_period_start,
      current_period_end,
      created_at,
      tenants ( id, restaurant_name, slug, owner_email ),
      plans ( name, price_monthly )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ subscriptions: data })
}