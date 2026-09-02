// src/app/api/menu-cache/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = 15
  const search = searchParams.get('search')
  const expiryFilter = searchParams.get('expiry')

  let query = supabaseAdmin
    .from('menu_import_cache')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('image_hash', `%${search}%`)
  }

  if (expiryFilter === 'expired') {
    query = query.lt('expires_at', new Date().toISOString())
  } else if (expiryFilter === 'active') {
    query = query.gte('expires_at', new Date().toISOString())
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entries: data ?? [], totalCount: count ?? 0 })
}