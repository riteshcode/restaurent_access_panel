-- supabase/migrations/20260902_super_admins_rls_policy.sql

-- Purpose: super_admins table pe RLS enable karke ek policy add ki
-- taaki authenticated user apna khud ka allowlist record check kar sake
-- (middleware ke allowlist check ke liye zaroori)

alter table super_admins enable row level security;

create policy "Users can check their own allowlist status"
on super_admins
for select
to authenticated
using (email = auth.jwt() ->> 'email');