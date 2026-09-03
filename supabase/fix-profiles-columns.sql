-- Ajoute les colonnes manquantes à profiles (si table créée sans email)
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text default 'investor';

-- Remplit email depuis auth.users pour les profils existants
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

-- Remplit name depuis les metadata si vide
update public.profiles p
set name = coalesce(
  u.raw_user_meta_data->>'name',
  split_part(u.email, '@', 1),
  'User'
)
from auth.users u
where p.id = u.id
  and (p.name is null or p.name = '');

-- Contrainte role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('investor', 'admin'));
