-- RESET COMPLET RLS — Supabase → SQL Editor → Run
-- Corrige définitivement la récursion infinie sur profiles

-- 1. Supprime TOUTES les policies existantes sur profiles
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', pol.policyname);
  end loop;
end $$;

-- 2. Supprime TOUTES les policies existantes sur portfolio_items
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'portfolio_items'
  loop
    execute format('drop policy if exists %I on public.portfolio_items', pol.policyname);
  end loop;
end $$;

-- 3. Recrée uniquement des policies simples (sans is_admin, sans sous-requête profiles)
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "portfolio_select_own"
  on public.portfolio_items for select to authenticated
  using (auth.uid() = user_id);

create policy "portfolio_insert_own"
  on public.portfolio_items for insert to authenticated
  with check (auth.uid() = user_id);

create policy "portfolio_update_own"
  on public.portfolio_items for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "portfolio_delete_own"
  on public.portfolio_items for delete to authenticated
  using (auth.uid() = user_id);

-- 4. RPC dashboard — bypass RLS proprement
create or replace function public.get_my_portfolio_items()
returns setof public.portfolio_items
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.portfolio_items
  where user_id = auth.uid()
  order by created_at desc;
$$;

alter function public.get_my_portfolio_items() owner to postgres;
grant execute on function public.get_my_portfolio_items() to authenticated;

-- 5. RPC rôle — pour middleware / admin check
create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

alter function public.get_my_role() owner to postgres;
grant execute on function public.get_my_role() to authenticated;

-- 6. RPC admin clients
create or replace function public.get_investor_clients()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if (select role from public.profiles where id = auth.uid() limit 1) is distinct from 'admin' then
    raise exception 'Forbidden';
  end if;

  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  into result
  from (
    select
      p.id,
      p.name,
      p.email,
      p.role,
      p.created_at,
      coalesce(
        (
          select json_agg(pi order by pi.created_at desc)
          from public.portfolio_items pi
          where pi.user_id = p.id
        ),
        '[]'::json
      ) as portfolio_items
    from public.profiles p
    where p.role = 'investor'
    order by p.name
  ) t;

  return result;
end;
$$;

alter function public.get_investor_clients() owner to postgres;
grant execute on function public.get_investor_clients() to authenticated;
