// src/app/api/payment-events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = 15
  const eventType = searchParams.get('event_type')
  const search = searchParams.get('search')

  let query = supabaseAdmin
    .from('payment_events')
    .select(`
      id,
      tenant_id,
      event_type,
      payload,
      processed,
      created_at,
      tenants ( id, restaurant_name, owner_email )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (eventType && eventType !== 'all') {
    query = query.eq('event_type', eventType)
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Client-side text search (restaurant name/email) — chunki join field pe direct filter tricky hai
  let filtered = data ?? []
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(
      (e: any) =>
        e.tenants?.restaurant_name?.toLowerCase().includes(s) ||
        e.tenants?.owner_email?.toLowerCase().includes(s) ||
        e.event_type?.toLowerCase().includes(s)
    )
  }

  // Distinct event types (filter dropdown ke liye)
  const { data: allEvents } = await supabaseAdmin
    .from('payment_events')
    .select('event_type')

  const eventTypes = [...new Set((allEvents ?? []).map((e) => e.event_type))]

  return NextResponse.json({
    events: filtered,
    totalCount: count ?? 0,
    eventTypes,
  })
}