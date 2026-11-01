-- DURF.EXE migration 001 — let signed-in users discover each other.
-- Run ONCE in the Supabase SQL editor (Database → SQL → New query).
-- Additive: it does not change or remove any existing policy.
--
-- 1. Profiles must be readable by any signed-in user. The starter schema
--    only let a user read their OWN row, so Discover could never show real
--    people. Inserts/updates/deletes stay own-row-only via the existing
--    "profiles own row" policy.
create policy "profiles readable by signed-in users" on public.profiles
  for select using (auth.role() = 'authenticated');
--
-- 2. Faxes must be insertable by the owner of the match they belong to.
--    The starter schema had no insert policy on faxes, so the app could
--    create a match but never record its fax.
create policy "faxes insert via own match" on public.faxes
  for insert with check (exists (
    select 1 from public.matches m where m.id = faxes.match_id and m.user_a = auth.uid()
  ));
