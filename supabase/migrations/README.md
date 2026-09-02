<!-- supabase/migrations/README.md -->
# Migrations Log — Rasoi Menu Super Admin

Ye folder Super Admin panel ke liye kiye gaye saare Supabase SQL changes
(functions, policies, table alterations) ko track karta hai.

Naye migration ka naam: `YYYYMMDD_short_description.sql`

Har naye SQL change ke liye:
1. Yahan ek nayi file banao
2. Supabase SQL Editor mein run karo
3. Is README mein niche entry add karo

## Applied Migrations

| Date | File | Purpose |
|---|---|---|
| 2026-09-02 | `20260902_get_total_orders_count.sql` | Dashboard — total orders across all tenant schemas |
| 2026-09-02 | `20260902_get_tenant_order_count.sql` | Tenant detail — single tenant's order count |
| 2026-09-02 | `20260902_super_admins_rls_policy.sql` | RLS policy for allowlist check via middleware |