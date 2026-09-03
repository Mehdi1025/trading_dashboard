-- Aligne buy_price → purchase_price (nom attendu par l'app)
-- Supabase → SQL Editor → Run

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_items'
      and column_name = 'buy_price'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_items'
      and column_name = 'purchase_price'
  ) then
    alter table public.portfolio_items rename column buy_price to purchase_price;
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_items'
      and column_name = 'buy_price'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'portfolio_items'
      and column_name = 'purchase_price'
  ) then
    update public.portfolio_items
    set purchase_price = buy_price
    where purchase_price is null and buy_price is not null;

    alter table public.portfolio_items drop column buy_price;
  end if;
end $$;

-- S'assure que purchase_price existe et est NOT NULL
alter table public.portfolio_items add column if not exists purchase_price numeric;

update public.portfolio_items
set purchase_price = 0
where purchase_price is null;

alter table public.portfolio_items alter column purchase_price set not null;

alter table public.portfolio_items drop constraint if exists portfolio_items_purchase_price_check;
alter table public.portfolio_items
  add constraint portfolio_items_purchase_price_check check (purchase_price > 0);
