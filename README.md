# Podium

Train. Compete. Win. A mobile-first fitness app: log meals (photo scan, barcode or quick picks), run workouts with a live session timer, and compete with friends on weekly and monthly leaderboards for real prizes.

Built with Next.js 16 (App Router, Server Actions, Proxy), React 19, TypeScript and Supabase (Auth + Postgres + RLS). Meal photos are analysed with the Claude API; barcodes are looked up on Open Food Facts. Installable as a PWA.

## Screens

| Tab | Routes | What it does |
| --- | --- | --- |
| Today | `/today`, `/progress` | Calorie rings (eaten, burned, protein), streak, today's plan, the live head-to-head, weekly rank. Progress: weight trend, 14-day calories, workouts per week, personal records. |
| Food | `/food`, `/food/add`, `/food/scan` | Diary by meal with macro bars, quick picks, manual entry, meal photo scan, barcode scan and lookup. |
| Train | `/train`, `/train/active/[id]`, `/train/done/[id]`, `/train/log` | Plan library, live session with steppers and rest timer, completion summary with points, quick log for past sessions. |
| Compete | `/compete`, `/compete/new`, `/compete/[id]`, `/prizes` | Weekly and monthly leaderboards with podium, challenges between friends with stakes and trash talk, prize catalogue and claims. |
| Me | `/me`, `/me/friends`, `/me/settings` | Profile, achievements, friends and requests, goals and body weight. |

## Setup

1. Create a Supabase project. In the SQL editor run `supabase/schema.sql` once (idempotent). Optionally run `supabase/seed.sql` for four demo athletes so the leaderboard is alive on day one; delete them before launch as described in that file.
2. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Project Settings → API.
   - `ANTHROPIC_API_KEY` for meal photo scanning (server only). Without it, scanning shows a notice; barcodes and manual entry still work.
   - `NEXT_PUBLIC_SITE_URL` when the public origin differs from the request host (used in auth emails).
3. In Supabase Auth → URL configuration, add `<your origin>/auth/callback` to the redirect allow list. Enable Apple or Google under Providers if you want those buttons to work.
4. `npm install`, then `npm run dev`.

Deploy anywhere Next.js runs. On Vercel add the same environment variables under Project → Settings.

## How points work

All scoring happens in Postgres functions (`SECURITY DEFINER`) so a client can never write points for itself. Calories are estimated as MET × body weight × hours.

| Event | Points |
| --- | --- |
| Finish a workout of 5 minutes or more | 50 + 1 per 10 kcal, capped at 300, at most 3 rewarded sessions per day |
| First food log of the day | 5 |
| Win a challenge | 200 |
| Claim a points prize | debits the prize cost |

Leaderboards sum positive points since the start of the ISO week or calendar month. Rank-gated prizes (free gym month, champion hoodie) look at your finish in the previous completed week or month and can be claimed once per period.

## Design

Apple-style dark UI: graphite black, frosted charcoal glass cards with continuous corners, warm brushed gold for anything that is a win, electric mint for effort, ice blue for intake and the opponent. Tokens and components live in `app/globals.css`; primitives in `components/ui.tsx`; icons in `components/icons.tsx`; charts in `components/charts.tsx`.

## Project layout

```
app/(auth)/welcome      sign in / create account
app/(app)/*             the five tabs and their sub-screens
app/api/scan            Claude vision → items, calories, macros
app/api/barcode         Open Food Facts lookup
lib/supabase            server, browser and proxy clients
lib/data                server-side data access per feature
supabase/schema.sql     tables, RLS, game rules
supabase/seed.sql       optional demo data
```
