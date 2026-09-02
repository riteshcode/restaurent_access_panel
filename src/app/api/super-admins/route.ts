// src/app/api/super-admins/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('super_admins')
    .select('*')
    .order('email', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admins: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, name } = body

  if (!email) {
    return NextResponse.json({ error: 'Email zaroori hai' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('super_admins')
    .insert({
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ye email pehle se allowlist mein hai' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ admin: data })
}