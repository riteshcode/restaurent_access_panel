// src/app/api/tenants/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slug, restaurant_name, owner_name, owner_email, owner_phone, city, plan_id } = body

  if (!slug || !restaurant_name || !owner_name || !owner_email) {
    return NextResponse.json(
      { error: 'slug, restaurant_name, owner_name aur owner_email required hain' },
      { status: 400 }
    )
  }

  // Step 1: basic tenant row insert karo
  const { data: tenant, error: insertError } = await supabaseAdmin
    .from('tenants')
    .insert({
      slug: slug.trim().toLowerCase(),
      restaurant_name: restaurant_name.trim(),
      owner_name: owner_name.trim(),
      owner_email: owner_email.trim().toLowerCase(),
      owner_phone: owner_phone?.trim() || null,
      city: city?.trim() || null,
      plan_id: plan_id || 'basic',
    })
    .select()
    .single()

  if (insertError || !tenant) {
    return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 })
  }

  // Step 2: schema provision karo
  const { data: schemaName, error: provisionError } = await supabaseAdmin.rpc(
    'provision_tenant',
    { p_tenant_id: tenant.id }
  )

  if (provisionError) {
    // Rollback: agar provisioning fail ho, toh adhura tenant row hata do
    await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)
    return NextResponse.json(
      { error: `Provisioning failed: ${provisionError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, tenantId: tenant.id, schemaName })
}