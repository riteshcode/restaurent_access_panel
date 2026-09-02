// src/app/api/email-queue/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const pageSize = 15
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  let query = supabaseAdmin
    .from('email_queue')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(`to_email.ilike.%${search}%,subject.ilike.%${search}%`)
  }

  const { data, error, count } = await query.range(
    (page - 1) * pageSize,
    page * pageSize - 1
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ emails: data ?? [], totalCount: count ?? 0 })
}