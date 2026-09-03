-- Fix définitif : récursion infinie RLS sur profiles
-- Supabase → SQL Editor → Run

-- 1. Supprime les policies admin qui causent la récursion
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can view all portfolio items" on public.portfolio_items;

-- 2. RPC admin — bypass RLS de façon sécurisée (vérifie le rôle admin d'abord)
create or replace function public.get_investor_clients()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
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

-- 3. is_admin simplifié (plus utilisé dans les policies profiles)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter function public.is_admin() owner to postgres;
grant execute on function public.is_admin() to authenticated;
