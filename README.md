# Eid Chanda — The Digital Eid Experience
# Full project totally amare Depression e falaiya disilo! Hajaro Bug ar error er sathe lorai korlam.

**Today: Eid focused. Tomorrow: Every occasion.**

A dashboard-based web app to create Salami Request Cards, send Digital Khām (letter + salami), schedule delivery, and save memories in an Eid Archive.

## Features (MVP)

- **Google Login** — No password, no OTP
- **Request Card** — Profile link like `yoursite.com/najmul` with name, photo, phone, payment icons (bKash, Nagad, Rocket, Upay), copy number, download JPG/PDF, share
- **Send Khām** — Receiver name, amount, letter, anonymous toggle, location, instant or scheduled delivery
- **Receiver experience** — Animated envelope → countdown (if scheduled) → Open → letter + amount reveal → Save to Archive
- **Archive** — Grouped by year (Eid 2026, 2027…), view / download JPG or PDF
- **Dashboard** — My Profile, My Request Card, Send Khām, Sent, Received, Archive, Logout

## Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Hind Siliguri (Bangla) + Poppins (English)
- **Auth:** Supabase (Google only)
- **Database:** Supabase (Postgres) — run `supabase/schema.sql` in SQL Editor
- **Hosting:** Vercel

## Setup

1. **Clone and install**
   ```bash
   cd "Eid Chanda"
   npm install
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - In **Authentication → Providers**, enable **Google** and add your OAuth client ID/secret.
   - In **SQL Editor**, run the contents of `supabase/schema.sql`.
   - In **Settings → API**, copy the project URL and anon key.

3. **Environment**
   - Copy `.env.example` to `.env.local`.
   - Set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Optional: `NEXT_PUBLIC_APP_URL` (e.g. `https://digitalkham.vercel.app`) for share links.

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel)

- Connect the repo to Vercel and add the same env vars.
- After first deploy, add your Vercel URL to Supabase Auth **Redirect URLs** (e.g. `https://your-app.vercel.app/auth/callback`).

## File structure (main)

- `src/app/` — App Router: `page.tsx`, `login/`, `auth/callback/`, `dashboard/`, `[username]/`, `k/[slug]/`
- `src/components/` — `dashboard/`, `card/`, `kham/`, `archive/`
- `src/lib/supabase/` — client, server, middleware helpers
- `supabase/schema.sql` — profiles, khams, archive tables + RLS + trigger

---

*Eid Chanda — Digital nostalgia. Emotion-based micro-fintech. Occasion-based message platform.*
