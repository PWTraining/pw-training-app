-- 0001_profiles.sql
-- One row per authenticated user (coach or client). Created automatically
-- on signup via trigger below; role defaults to 'client' and Paul promotes
-- himself to 'coach' once, by hand, after his own first login.

create type public.user_role as enum ('coach', 'client');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'client',
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer + stable: bypasses RLS internally so this can be safely
-- referenced FROM a profiles policy without the recursive-policy trap you'd
-- hit querying public.profiles directly inside its own policy.
create function public.is_coach()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'coach'
  );
$$;

-- Everyone can read their own profile row.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Coaches can read every profile (needed for the CRM/member list).
create policy "profiles_select_coach"
  on public.profiles for select
  using (public.is_coach());

-- Users can update their own name, never their own role.
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row the moment someone confirms an OTP signup.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
