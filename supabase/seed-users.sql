-- ============================================================
-- TRDNG — Création des comptes test (SQL Editor → Run)
-- admin@trading.com / client@trading.com → password
-- ============================================================

create extension if not exists pgcrypto;

-- 1. Colonnes manquantes sur profiles
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'investor';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('investor', 'admin'));

-- 2. Désactive le trigger le temps du seed
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Supprime les comptes existants (via auth.users, pas email sur profiles)
delete from auth.identities where user_id in (
  select id from auth.users where email in ('admin@trading.com', 'client@trading.com')
);
delete from public.profiles where id in (
  select id from auth.users where email in ('admin@trading.com', 'client@trading.com')
);
delete from auth.users where email in ('admin@trading.com', 'client@trading.com');

-- ── ADMIN ──────────────────────────────────────────────────
do $$
declare
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@trading.com',
    crypt('password', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', 'admin@trading.com', 'email_verified', true),
    'email', now(), now(), now()
  );

  insert into public.profiles (id, name, email, role)
  values (uid, 'Admin', 'admin@trading.com', 'admin');
end $$;

-- ── CLIENT ─────────────────────────────────────────────────
do $$
declare
  uid uuid := gen_random_uuid();
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'client@trading.com',
    crypt('password', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Client"}'::jsonb,
    now(), now(),
    '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', 'client@trading.com', 'email_verified', true),
    'email', now(), now(), now()
  );

  insert into public.profiles (id, name, email, role)
  values (uid, 'Client', 'client@trading.com', 'investor');
end $$;

-- 4. Réactive le trigger
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

grant usage on schema public to supabase_auth_admin;
grant all on table public.profiles to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
