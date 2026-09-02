// src/app/api/dashboard-stats/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    // Total tenants
    const { count: totalTenants } = await supabaseAdmin
      .from('tenants')
      .select('*', { count: 'exact', head: true })

    // Active subscriptions
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Trial tenants
    const { count: trialTenants } = await supabaseAdmin
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Suspended tenants
    const { count: suspendedTenants } = await supabaseAdmin
      .from('tenants')
      .select('*', { count: 'exact', head: true })
      .eq('is_suspended', true)

    // MRR estimate — active subscriptions joined with plan price
    const { data: activeSubsWithPlans } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_id, plans(price_monthly)')
      .eq('status', 'active')

    const mrr = (activeSubsWithPlans ?? []).reduce((sum, row: any) => {
      return sum + (row.plans?.price_monthly ?? 0)
    }, 0) / 100

    // Total orders across all tenant schemas
    const { data: totalOrders, error: ordersError } = await supabaseAdmin.rpc(
      'get_total_orders_count'
    )

    return NextResponse.json({
      totalTenants: totalTenants ?? 0,
      activeSubscriptions: activeSubscriptions ?? 0,
      trialTenants: trialTenants ?? 0,
      suspendedTenants: suspendedTenants ?? 0,
      mrr,
      totalOrders: ordersError ? null : totalOrders,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}