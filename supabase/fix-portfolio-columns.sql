-- Fix colonnes manquantes sur portfolio_items
-- Supabase → SQL Editor → Run

-- Crée la table si elle n'existe pas du tout
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  symbol text not null,
  quantity numeric not null default 0,
  purchase_price numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Ajoute les colonnes manquantes si la table existait déjà sans elles
alter table public.portfolio_items add column if not exists user_id uuid references public.profiles (id) on delete cascade;
alter table public.portfolio_items add column if not exists symbol text;
alter table public.portfolio_items add column if not exists quantity numeric default 0;
alter table public.portfolio_items add column if not exists purchase_price numeric default 0;
alter table public.portfolio_items add column if not exists created_at timestamptz default now();

-- Contraintes
alter table public.portfolio_items drop constraint if exists portfolio_items_quantity_check;
alter table public.portfolio_items
  add constraint portfolio_items_quantity_check check (quantity > 0);

alter table public.portfolio_items drop constraint if exists portfolio_items_purchase_price_check;
alter table public.portfolio_items
  add constraint portfolio_items_purchase_price_check check (purchase_price > 0);

create index if not exists portfolio_items_user_id_idx
  on public.portfolio_items (user_id);

-- RLS (si pas encore activé)
alter table public.portfolio_items enable row level security;

drop policy if exists "Users can view own portfolio items" on public.portfolio_items;
create policy "Users can view own portfolio items"
  on public.portfolio_items for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Admins can view all portfolio items" on public.portfolio_items;

drop policy if exists "Users can insert own portfolio items" on public.portfolio_items;
create policy "Users can insert own portfolio items"
  on public.portfolio_items for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own portfolio items" on public.portfolio_items;
create policy "Users can update own portfolio items"
  on public.portfolio_items for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own portfolio items" on public.portfolio_items;
create policy "Users can delete own portfolio items"
  on public.portfolio_items for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.portfolio_items to authenticated;
