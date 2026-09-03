-- Fix : permissions du trigger d'inscription Supabase Auth
-- Coller dans Supabase → SQL Editor → Run (si le seed échoue)

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

grant usage on schema public to supabase_auth_admin;
grant all on table public.profiles to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;
