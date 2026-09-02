-- supabase/migrations/20260902_get_tenant_order_count.sql

-- Purpose: Super Admin ke tenant detail page ke liye — ek specific
-- tenant ke schema se uske orders ka count nikalta hai
-- Used by: /api/tenants/[id]

create or replace function public.get_tenant_order_count(schema text)
returns bigint
language plpgsql
security definer
as $$
declare
  cnt bigint;
begin
  begin
    execute format('select count(*) from %I.orders', schema) into cnt;
  exception when others then
    cnt := 0;
  end;
  return cnt;
end;
$$;