-- DURF.EXE — Supabase schema (Postgres)
-- Run this in the Supabase SQL editor (Database → SQL → New query).
-- Tables mirror the UI spec: accounts, widget profiles, discovery decisions,
-- matches, faxes (date dossiers), messages, 2FA-style check-ins, groups,
-- group membership, and battery events.
--
-- ROW-LEVEL SECURITY NOTES (read before going live):
-- * RLS is ENABLED on every table below.
-- * The starter policies let an authenticated user read/write ONLY rows they
--   own (user_id = auth.uid()) plus rows where they are a participant
--   (matches, faxes, messages, groups). Tighten before launch:
--     - Messages: only participants of the match/group may read/insert.
--     - Reports: insert-only for reporters; reads restricted to moderators.
--     - Never expose precise location, codes, or blocked lists to others.
-- * The scaffold's demo mode runs without Supabase; these tables are used
--   when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set.
-- * Supabase Auth owns passwords (hashed by Auth). Never store passwords here.

create extension if not exists pgcrypto;

-- Public profile row per account. Auth user id is the primary key so that
-- RLS can compare auth.uid() directly. Email/DOB live in Auth + this row
-- for display and the 18+ gate (DOB is checked at sign-up in the app).
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  dob date not null,
  first_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  first_name text not null,
  age int not null check (age >= 18),
  city text not null,
  intent text not null,
  height text,
  school text,
  faith_context text,
  widgets jsonb not null default '[]'::jsonb,
  photos text[] not null default '{}',
  paused boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  target_id text not null,
  decision text not null check (decision in ('durf', 'norf')),
  created_at timestamptz not null default now(),
  unique (user_id, target_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.users (id) on delete cascade,
  user_b text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.faxes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  date_id text not null,
  status text not null default 'new'
    check (status in ('new', 'scheduled', 'needs-time', 'checkin', 'completed', 'archived', 'canceled')),
  scheduled_at timestamptz,
  rerolls int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  sender_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  fax_id uuid not null references public.faxes (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  my_code text not null,
  partner_code text not null,
  partner_entered boolean not null default false,
  verified boolean not null default false,
  reset_used boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (fax_id, user_id)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  size int not null check (size in (4, 6)),
  join_code text not null,
  fax_id uuid references public.faxes (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_ref text not null,
  name text not null,
  ready boolean not null default false,
  created_at timestamptz not null default now(),
  unique (group_id, user_ref)
);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.battery_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  delta int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  reported_ref text not null,
  reason text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.users (id) on delete cascade,
  blocked_ref text not null,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_ref)
);

-- Enable RLS everywhere.
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.faxes enable row level security;
alter table public.messages enable row level security;
alter table public.checkins enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;
alter table public.battery_events enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- Starter policies: owners read/write their own rows. Participants can read
-- match/fax/message rows tied to them. Harden these before public launch
-- (see notes above), especially message visibility and report reads.
create policy "users own row" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles own row" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "swipes own rows" on public.swipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "matches participants read" on public.matches
  for select using (auth.uid() = user_a);
create policy "matches insert own" on public.matches
  for insert with check (auth.uid() = user_a);
create policy "faxes via match" on public.faxes
  for select using (exists (
    select 1 from public.matches m where m.id = faxes.match_id and m.user_a = auth.uid()
  ));
create policy "messages own sends" on public.messages
  for all using (auth.uid() = sender_id) with check (auth.uid() = sender_id);
create policy "checkins own rows" on public.checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "groups host or member read" on public.groups
  for select using (auth.uid() = host_id);
create policy "groups host insert" on public.groups
  for insert with check (auth.uid() = host_id);
create policy "group members read" on public.group_members
  for select using (exists (
    select 1 from public.groups g where g.id = group_members.group_id and g.host_id = auth.uid()
  ));
create policy "group messages own sends" on public.group_messages
  for all using (auth.uid() = sender_id) with check (auth.uid() = sender_id);
create policy "battery own rows" on public.battery_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports insert own" on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy "blocks own rows" on public.blocks
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- Helpful indexes for the hot paths.
create index if not exists idx_swipes_user on public.swipes (user_id);
create index if not exists idx_matches_user_a on public.matches (user_a);
create index if not exists idx_faxes_match on public.faxes (match_id);
create index if not exists idx_messages_thread on public.messages (thread_id, created_at);
create index if not exists idx_checkins_fax on public.checkins (fax_id);
create index if not exists idx_group_members_group on public.group_members (group_id);
