-- supabase/migrations/20260902_get_total_orders_count.sql

-- Purpose: Super Admin dashboard ke liye — saare tenant schemas mein
-- loop karke total orders count karta hai (schema-per-tenant architecture)
-- Used by: /api/dashboard-stats

create or replace function public.get_total_orders_count()
returns bigint
language plpgsql
security definer
as $$
declare
  total bigint := 0;
  rec record;
  cnt bigint;
begin
  for rec in select schema_name from public.tenants where schema_name is not null loop
    begin
      execute format('select count(*) from %I.orders', rec.schema_name) into cnt;
      total := total + cnt;
    exception when others then
      continue;
    end;
  end loop;
  return total;
end;
$$;