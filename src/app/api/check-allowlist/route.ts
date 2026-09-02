// src/app/api/check-allowlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ allowed: false }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('super_admins')
    .select('email')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  return NextResponse.json({ allowed: !!data })
}