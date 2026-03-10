create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid references public.profiles (id) on delete set null,
  mode text not null default 'solo',
  round_count integer not null default 5 check (round_count between 1 and 20),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rounds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  provider text not null default 'google_street_view',
  country text not null,
  region text not null,
  clue text not null,
  answer_lat double precision not null,
  answer_lng double precision not null,
  heading double precision not null default 0,
  pitch double precision not null default 0,
  zoom integer not null default 1,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.guesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  round_slug text not null,
  guess_lat double precision not null,
  guess_lng double precision not null,
  distance_km double precision not null,
  score integer not null check (score >= 0),
  elapsed_ms integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.scores (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  total_score integer not null default 0,
  rounds_played integer not null default 0,
  best_round_score integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.rounds enable row level security;
alter table public.guesses enable row level security;
alter table public.scores enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "games_select_owner" on public.games;
create policy "games_select_owner"
on public.games
for select
to authenticated
using (host_user_id = auth.uid());

drop policy if exists "games_insert_owner" on public.games;
create policy "games_insert_owner"
on public.games
for insert
to authenticated
with check (host_user_id = auth.uid());

drop policy if exists "rounds_select_authenticated" on public.rounds;
create policy "rounds_select_authenticated"
on public.rounds
for select
to authenticated
using (true);

drop policy if exists "guesses_select_self" on public.guesses;
create policy "guesses_select_self"
on public.guesses
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "guesses_insert_self" on public.guesses;
create policy "guesses_insert_self"
on public.guesses
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "scores_select_all" on public.scores;
create policy "scores_select_all"
on public.scores
for select
to anon, authenticated
using (true);

drop policy if exists "scores_upsert_self" on public.scores;
create policy "scores_upsert_self"
on public.scores
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "scores_update_self" on public.scores;
create policy "scores_update_self"
on public.scores
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
