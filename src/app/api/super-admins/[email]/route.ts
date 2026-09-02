// src/app/api/super-admins/[email]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const { email } = await params
  const decodedEmail = decodeURIComponent(email)

  const { error } = await supabaseAdmin
    .from('super_admins')
    .delete()
    .eq('email', decodedEmail)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}