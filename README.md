# DURF.EXE — deployable web app scaffold

A free-date dating app for Latter-day Saint singles, styled as a Windows 1.0
satire: a full fake operating system where the desktop IS the menu. Built to
the 20-page Durf UI spec (v1.0): discover → match → free date by fax → go on
the date → exchange 2FA-style codes → unlock more discovery.

**Stack:** Vite + React + TypeScript, Supabase (Auth + Postgres) when
configured, graceful local demo mode when it is not.

## What is implemented in this pass

- **Desktop OS shell:** teal desktop, gray beveled windows, navy title bars,
  VT323 pixel-style font, taskbar (mode + battery + clock), 12 desktop icons
  in spec order (Discover, My Profile, Modes, Fax, Chat, Group Date, Safety,
  Notices, Help, Settings, Install, Power) plus a log-out row, and a labeled,
  dismissible sponsored widget (never a fullscreen ad).
- **Auth:** boot splash, 3-panel tutorial, eligibility (18+ date-of-birth
  gate), sign-up/sign-in. Supabase Auth (email + password) when env vars are
  set; clearly labeled local demo mode otherwise (accounts live on-device).
- **Core loop:** Discover with NORF/DURF decisions, battery (10 cap, −1 per
  DURF, +5 rewarded-video placeholder, daily refill), one undo per session,
  match → fullscreen INCOMING FAX moment (Open now / Save to Fax), date
  dossiers with $0.00 cost proof, steps, accessibility + indoor-swap notes,
  scheduling, one free reroll, retro chat, and 2FA-style check-in with
  reciprocal 6-digit codes (own code rejected, 24h expiry, one reset).
- **Modes:** Dating (full profiles), Blind Date (photos hidden until match),
  Couples (6-character invite code, shared faxes).
- **Group dates:** 4-person double dates and 6-person triple dates with
  lobbies, readiness toggles, pairings, group fax (once everyone is ready),
  and group chat.
- **Profiles:** widget-based, exactly 3–5 widgets from the spec library
  (Current quest, Low-stakes take, Ideal $0 date, Three tiny joys, Sunday
  snapshot, Skill file, Ask me about), up to 4 photo tiles.
- **Install:** INSTALL_ME.TXT auto-opens after first sign-in with iPhone
  (Safari → Share → Add to Home Screen) and Android (Install app) steps, plus
  a real PWA manifest (`public/manifest.webmanifest`) and icon.
- **Safety:** Safety Center with report flow (reason + context), block list,
  date-plan sharing guidance, and plain-language emergency guidance.
- **Seed data:** a small starter catalog of demo profiles for Discover until
  real users join — labeled as seed data in code comments, never presented
  as real users.

## Run it locally

```bash
npm install
npm run dev        # demo mode (no Supabase needed)
npm run build      # type-check + production build
npm run preview    # serve the production build locally
```

Open http://localhost:5173 (dev) and sign up with any email. In demo mode,
accounts and progress live in your browser's local storage.

## Deploy it for real (step by step)

No accounts have been created and nothing has been deployed — do these steps
with Isaiah when he is ready. All three services have free tiers.

### 1. Create a free Supabase project

1. Go to https://supabase.com and sign up (free tier).
2. Create a new project (pick the closest region). Wait for provisioning.
3. In Supabase: **SQL Editor → New query**. Paste the entire contents of
   `supabase/schema.sql` and run it. This creates all tables, enables
   row-level security, and adds starter policies.
4. In Supabase: **Project Settings → API**. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
   - **Never use the `service_role` key in the frontend.**
5. In Supabase: **Authentication → Providers → Email** — make sure Email is
   enabled. (Confirmations: for the smoothest first test, turn email
   confirmations OFF while testing, then back ON before public launch.)

### 2. Deploy the frontend (Netlify or Vercel, free tier)

**Netlify:**
1. Push this folder to a GitHub repo (or drag the folder into Netlify Drop
   for a first test — but use Git for real updates).
2. Netlify → Add new site → Import from Git → pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Site settings → Environment variables, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Deploy. Your site gets a `*.netlify.app` URL.

**Vercel:**
1. Push this folder to a GitHub repo.
2. Vercel → Add New → Project → import the repo. Framework preset: Vite.
3. Build command: `npm run build`. Output directory: `dist`.
4. Environment variables: add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (same values as above).
5. Deploy. Your site gets a `*.vercel.app` URL.

### 3. Point Supabase at the live site

1. In Supabase: **Authentication → URL Configuration**.
2. Set **Site URL** to your Netlify/Vercel URL.
3. Add the same URL under **Redirect URLs** (needed for auth emails).
4. Redeploy the frontend once (env vars only apply at build time).

### 4. Verify the live app

1. Open the live URL on a phone.
2. Sign up (18+ gate), complete a profile (3–5 widgets).
3. Discover → DURF someone → confirm the FAX moment opens.
4. Open the fax, schedule it, start check-in, enter the partner code.
5. Check Supabase → Table Editor: a row should exist in `users`, `swipes`,
   `matches`, and `faxes`.
6. Install test: iPhone → Safari → Share → Add to Home Screen; Android →
   Install app. The app should open full-screen from the home screen.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | For real accounts | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For real accounts | Supabase anon/public key |

Absent either variable, the app runs in **demo mode** (banner shown in the
app) with local-only accounts. Demo mode never touches a server.

## What remains for a later pass

- **Real photo uploads** (Supabase Storage bucket + policies); the scaffold
  uses initial tiles.
- **Mutual matching with real users:** in this scaffold a DURF immediately
  creates a match (so the loop is testable with the seed catalog). With real
  users, a match must require both sides to Durf; seed profiles are then
  removed.
- **Server-side battery enforcement** (battery events table exists; the UI
  enforces the cap client-side for now).
- **Real AdMob:** the sponsored widget is a labeled placeholder; real ad
  network integration comes after public launch.
- **Push notifications, moderation tooling, and RLS hardening** (see the
  notes at the top of `supabase/schema.sql`) before public launch.
- **High-contrast visual variant and Dynamic Type scaling** beyond the
  stored preferences.
- **Native iOS app (App Store):** this is the web app first, per the
  2026-11-01 pivot. The App Store build (SwiftUI or a wrapped PWA) is a
  separate later step, and Apple's June 2026 dating-app rules still require
  the "meaningfully different" case the free-date mechanic provides.
