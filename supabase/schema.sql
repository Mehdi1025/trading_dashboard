-- ============================================================
-- TRDNG — Migration Supabase complète
-- Coller dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. TABLE profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'investor' check (role in ('investor', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. TABLE portfolio_items
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  symbol text not null,
  quantity numeric not null check (quantity > 0),
  purchase_price numeric not null check (purchase_price > 0),
  created_at timestamptz not null default now()
);

create index if not exists portfolio_items_user_id_idx
  on public.portfolio_items (user_id);

-- 3. TRIGGER — crée le profil à l'inscription (name depuis options.data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'investor'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 4. HELPER — vérifie si l'utilisateur connecté est admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  perform set_config('row_security', 'off', true);

  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
end;
$$;

alter function public.is_admin() owner to postgres;
grant execute on function public.is_admin() to authenticated;

-- RPC admin (évite récursion RLS)
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

-- 5. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.portfolio_items enable row level security;

-- --- profiles ---
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --- portfolio_items ---
drop policy if exists "Users can view own portfolio items" on public.portfolio_items;
create policy "Users can view own portfolio items"
  on public.portfolio_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all portfolio items" on public.portfolio_items;

drop policy if exists "Users can insert own portfolio items" on public.portfolio_items;
create policy "Users can insert own portfolio items"
  on public.portfolio_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own portfolio items" on public.portfolio_items;
create policy "Users can update own portfolio items"
  on public.portfolio_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own portfolio items" on public.portfolio_items;
create policy "Users can delete own portfolio items"
  on public.portfolio_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 6. PERMISSIONS
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.portfolio_items to authenticated;

-- Permissions trigger auth (Supabase)
grant usage on schema public to supabase_auth_admin;
grant all on table public.profiles to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

-- ============================================================
-- 7. APRÈS INSCRIPTION — promouvoir un compte en ADMIN
-- Remplace l'email par le tien, puis exécute cette ligne seule :
--
--   update public.profiles
--   set role = 'admin'
--   where email = 'ton@email.com';
-- ============================================================
