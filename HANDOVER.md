# QRebi — სრული დოკუმენტაცია / Full Handover

**ერთი ფაილი, სადაც ყველაფერი წერია.** ქვემოთ ჯერ ქართული მოკლე ნაწილია
(მფლობელისთვის), შემდეგ სრული ტექნიკური დოკუმენტაცია ინგლისურად
(დეველოპერისთვის).

Repo: `Akheehhe/qrebi` · Branch: `claude/review-management-subscription-brc5no`
· Domain: qrebi.ge · Stack: Next.js 16 + Supabase + Vercel

---

# ნაწილი 1 — მოკლედ, ქართულად

## რა დაემატა საიტს

QRebi აქამდე ყიდდა NFC ბარათებს ერთჯერადი ფასით. ახლა დაემატა **მეორე
პროდუქტი: ჭკვიანი შეფასების გვერდი — 10 ₾ თვეში, თითო ბიზნესზე.**

ბარათი ახლა შეიძლება მიუთითებდეს არა პირდაპირ Google-ზე, არამედ ჩვენს
გვერდზე: `qrebi.ge/r/ბიზნესის-სახელი`

**კლიენტის გზა:**

1. კლიენტი ეხება ბარათს → ტელეფონში იხსნება ბიზნესის გვერდი
2. ირჩევს ვარსკვლავებს (5 დიდი ვარსკვლავი, სხვა არაფერი ეკრანზე)
3. **4★ ან 5★** → მაშინვე გადადის Google-ზე / Tripadvisor-ზე / Booking-ზე
   (თუ რამდენიმე პლატფორმაა, ჯერ ერთი დაჭერით ირჩევს სად)
4. **1★–3★** → იხსნება პირადი გამოხმაურების ფორმა. **ეს Google-ზე არ
   მიდის.** მხოლოდ მფლობელი ხედავს თავის კაბინეტში.

## რა ხედავს ბიზნესი (10 ₾ ღირს)

`qrebi.ge/login` — შედის ელფოსტით, პაროლი არ სჭირდება (ბმული მოსდის
მეილზე). შემდეგ `qrebi.ge/app`:

- სულ რამდენი შეფასება, საშუალო ქულა, რამდენი გავიდა პლატფორმებზე
- ბოლო 30 დღე / სულ — გადამრთველი
- გრაფიკი: რომელი ვარსკვლავი რამდენჯერ
- გრაფიკი: ბოლო 30 დღე, დღეების მიხედვით
- პლატფორმების გაშლა: Google რამდენი, Tripadvisor რამდენი, Booking რამდენი
- **პირადი გამოხმაურებები** — უკმაყოფილო კლიენტების წერილები, სახელით და
  ტელეფონით (თუ დატოვეს), „მოგვარებულად მონიშვნის" ღილაკით
- ბარათის ბმული + QR-კოდი ჩამოსატვირთად (დასაბეჭდად)
- გამოწერის მდგომარეობა: რომელ რიცხვამდეა გადახდილი

## რა ხედავ შენ (ადმინი)

`qrebi.ge/admin` — შედი იმავე ბმულით, `bozukabozi@gmail.com`-ით.

- ახალი ბიზნესის დამატება: სახელი, slug, Google/Tripadvisor/Booking ბმულები,
  მფლობელის ელფოსტა, გადახდის ვადა
- **+1 თვე** ღილაკი — ყოველ გადახდაზე ერთი დაჭერა
- შეჩერება / რედაქტირება / წაშლა
- **„ბმულები / NFC" ღილაკი** — აქ არის ბარათების საწარმო:
  - სრული ბმული (ყველა პლატფორმა)
  - მხოლოდ Google-ის ბმული
  - მხოლოდ Tripadvisor-ის ბმული
  - მხოლოდ Booking-ის ბმული
  - თითოეულს აქვს: კოპირება, QR-ის ჩამოტვირთვა, და **„ჩაწერე NFC-ზე"**

**NFC-ზე ჩაწერა:** გახსენი `/admin` **Android-ის Chrome-ში**, დააჭირე
„ჩაწერე NFC-ზე", მიადე ცარიელი ბარათი ტელეფონს — ჩაიწერა. ცალკე აპლიკაცია
არ სჭირდება. (iPhone-ზე და კომპიუტერზე ეს არ მუშაობს — Apple არ იძლევა
საშუალებას; იქ ბმული დააკოპირე და NFC Tools აპით ჩაწერე.)

ასე შეგიძლია ცალკე გაყიდო „მხოლოდ Google" ბარათი და ცალკე სასტუმროსთვის
სამპლატფორმიანი — ერთმანეთში არ აირევა.

## რა უნდა გაკეთდეს ამოქმედებამდე

ეს დეველოპერის საქმეა, დაწვრილებით ქვემოთ (Part 2 → Setup):

1. **Supabase**: `supabase/funnel.sql`-ის გაშვება SQL editor-ში (1 წუთი)
2. **Supabase Auth**: redirect URL-ის დამატება + SMTP-ის ჩართვა, რომ შესვლის
   მეილები ნორმალურად მივიდეს
3. **Vercel**: ორი env ცვლადი (უკვე უნდა იყოს, თუ ოფერის ფორმა მუშაობს)
4. branch-ის merge `main`-ში

## სამი გულწრფელი შენიშვნა (მნიშვნელოვანია)

1. **Google-ზე ვარსკვლავების ავტომატურად ჩაწერა შეუძლებელია.** Google არ
   იძლევა ამის საშუალებას — არც ბმულით, არც API-თი, არავის. ჩვენ ვაკეთებთ
   მაქსიმუმს: კლიენტი ერთი შეხებით გადადის და Google-ის ვარსკვლავები უკვე
   ეკრანზე აქვს. ბოლო დაჭერა მაინც მას ეკუთვნის. ვინც პირიქით გპირდება,
   ან ცრუობს, ან ყალბ შეფასებებს წერს.
2. **Booking.com-ს საჯარო შეფასების ფორმა არ აქვს.** მხოლოდ ის, ვინც
   Booking-ით დაჯავშნა, წერს შეფასებას — Booking-ის საკუთარი მეილიდან,
   ჩასვლის შემდეგ. ჩვენი Booking-ის ღილაკი სასტუმროს გვერდს ხსნის. ეს
   სასტუმროებს წინასწარ უნდა ვუთხრათ, რომ მოლოდინი სწორი ჰქონდეთ.
3. **დაბალი შეფასების გაფილტვრა Google-ის წესებს ეწინააღმდეგება**
   („review gating"). პატარა ბიზნესებზე იშვიათად ამოწმებენ, მაგრამ რისკი
   არსებობს. ამიტომ თითოეულ ბიზნესს აქვს ცალკე ზღვარი ადმინში — თუ გინდა,
   კონკრეტულ ბიზნესს 1★-ზე დააყენებ და ფილტრი გამოირთვება.

---

# Part 2 — Technical documentation (English)

## 1. What this is

Two products on one site:

| | Product | Billing |
|---|---|---|
| 1 | **NFC card** — the physical card, points anywhere | one-time, unchanged |
| 2 | **Smart review page** — the funnel described below | **10 ₾ / month / business**, manual |

The smart review page sits between the NFC card and the public review
platform. A customer taps a star; ratings at or above the business's
threshold (default 4★) are recorded and the customer is carried on to
Google / Tripadvisor / Booking; lower ratings become private feedback only
the owner sees.

## 2. Stack

- **Next.js 16.3** (App Router, Turbopack, React 19.2, TypeScript 7)
- **Supabase** — Postgres + Auth (email magic link). The browser only ever
  holds the **publishable** key; **RLS + security-definer functions are the
  entire security boundary**. No secret key ships to the client.
- **Plain CSS**, one file: `app/globals.css`. No Tailwind, no CSS-in-JS.
- **Vercel** hosting, `qrebi.ge` (see `CNAME`).
- Deps: `@supabase/supabase-js`, `qrcode` (client-side QR generation). That's all.

> ⚠️ **Read `AGENTS.md` before writing code.** This Next.js version has
> breaking changes vs. older habits: `params`/`searchParams` are Promises,
> `cookies()`/`headers()` are async, `fetch` is uncached by default,
> `middleware.ts` → `proxy.ts`. The bundled docs in
> `node_modules/next/dist/docs/` are the source of truth.

## 3. Repo layout

```
app/
  (site)/            route group — the marketing landing (chrome: header,
    layout.tsx       promo bar, footer, sticky CTA)
    page.tsx         landing page incl. the new "smart page" section
  r/[slug]/          THE FUNNEL — public rating page (dynamic, noindex)
    page.tsx         server component: loads business, applies ?p= scope
    loading.tsx      instant shell (an NFC tap is a cold load)
    error.tsx        retry card
  login/page.tsx     magic-link sign-in    → LoginClient
  app/page.tsx       owner dashboard       → DashboardClient
  admin/page.tsx     operator panel        → AdminClient
  api/lead/          pre-existing: order form → Telegram + Resend
  api/subscribe/     pre-existing: offer-code signup
  layout.tsx         root: fonts + globals only
  not-found.tsx      styled 404
components/
  funnel/            everything the subscription product needs
    RatingWidget.tsx     the funnel state machine (client)
    FunnelShell.tsx      quiet shell for customer-facing pages
    DashShell.tsx        chrome for signed-in pages
    DashboardClient.tsx  owner portal
    AdminClient.tsx      operator panel + card-link/NFC bench
    LinkTools.tsx        copy + QR + Web NFC write, per link
    PlatformIcon.tsx     Google / Tripadvisor / Booking marks
    charts.tsx           star distribution + 30-day trend (hand-rolled SVG)
  icons.tsx, shared.tsx, LangToggle.tsx …  pre-existing site components
lib/
  supabase.ts        clients + all funnel types
  funnel.ts          date math (Tbilisi), slugify, platform helpers
  campaign.ts        pre-existing landing campaign config
supabase/
  schema.sql         pre-existing: offer-code signups
  funnel.sql         THE FUNNEL SCHEMA — tables, RLS, all RPCs
types/webnfc.d.ts    Web NFC typings (not in TS's DOM lib yet)
```

## 4. Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | static | marketing landing |
| `/r/[slug]` | dynamic | **the funnel** — what an NFC tap opens |
| `/r/[slug]?p=google` | dynamic | same, scoped to one platform |
| `/login` | static shell | magic-link sign-in |
| `/app` | static shell | owner dashboard (client-side auth) |
| `/admin` | static shell | operator panel (client-side auth + `is_admin()`) |
| `/api/lead`, `/api/subscribe` | dynamic | pre-existing landing forms |

All funnel pages are `robots: noindex` — they're tap targets, not search
results.

Auth is client-side (`getSession()` → redirect). There is **no proxy/
middleware gate**: it isn't the security boundary, RLS is. A user who
forces their way to `/app` sees nothing, because the database returns
nothing.

## 5. Data model

`supabase/funnel.sql` is **idempotent** — safe to re-run; it upgrades an
older install in place (adds columns, re-states constraints).

### `businesses`
| column | notes |
|---|---|
| `id` | uuid pk |
| `slug` | unique, `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$` — this is the card URL |
| `name` | shown to the customer |
| `google_review_url` | nullable, must be `https://` |
| `tripadvisor_url` | nullable, must be `https://` |
| `booking_url` | nullable, must be `https://` |
| `owner_email` | lowercase, real address — matched against the JWT |
| `paid_until` | **date, inclusive.** Active while today (Tbilisi) ≤ this |
| `min_public_stars` | default 4 — the public/private threshold |
| `created_at` | |

Constraint `businesses_platform_present`: at least one of the three URLs
must be non-null.

### `reviews`
| column | notes |
|---|---|
| `id` | uuid pk |
| `business_id` | fk → businesses, `on delete cascade` |
| `stars` | 1–5 |
| `comment`, `author_name`, `author_contact` | private feedback fields |
| `sent_to_google` | boolean — "went public". **Name predates multi-platform**; it means "sent to any platform". Left as-is to avoid a migration; rename freely if you prefer |
| `platform` | `google` \| `tripadvisor` \| `booking` \| null |
| `handled_at` | owner's "handled" tick |
| `created_at` | |

### `admins`
Single column `email`. **No RLS policies at all** — only `is_admin()`
(security definer) reads it. Seeded at the bottom of `funnel.sql` with
`bozukabozi@gmail.com`.

### `subscribers` (pre-existing, `schema.sql`)
Landing-page offer-code signups. Unrelated to the funnel.

## 6. RPC reference

Everything the browser can call. Tables themselves are unreachable to
`anon`; owners get read-only access via RLS.

| Function | Callable by | Returns |
|---|---|---|
| `review_page(p_slug)` | anon | `(name, active, min_public_stars, platforms json)` — no owner email, no paid_until |
| `submit_review(p_slug, p_stars, p_comment, p_name, p_contact, p_platform)` | anon | `{ok, review_id, to_public, platforms}` |
| `add_feedback(p_review_id, p_stars, p_comment, p_name, p_contact, p_platform)` | anon | same shape — amends a row created in the last 24h |
| `set_feedback_handled(p_review_id, p_handled)` | authenticated | void — owner-scoped |
| `is_admin()` | authenticated | boolean |
| `jwt_email()` | authenticated | text or **null** (never `''`) |
| `business_platforms(b)`, `assert_platform(b, key)` | internal | helpers |

### Write protocol (important)

The rating is written **on the star tap**, not on form submit:

1. Customer taps a star → `submit_review()` → row created, `review_id` returned.
2. Anything after — a changed pick, the comment, the platform choice —
   goes through `add_feedback(review_id, …)` and **amends the same row**.

Why: an abandoned feedback form still counts, so the owner's average isn't
biased upward by 5★ taps recording instantly while 2★ taps needed a
completed form.

All calls are serialized through a promise chain in `RatingWidget`, so a
fast double-tap can't create two rows.

### Guarantees enforced in the database (verified against Postgres 16)

- anon can read/write **nothing** directly — only through the RPCs above.
- An owner sees their own business + its reviews. Another owner sees
  nothing of it. A JWT with **no email claim** (phone/anonymous auth) sees
  nothing — `jwt_email()` returns null, so the policy can never match.
- Unknown slug and lapsed subscription raise the **same** `not-available`
  error — nothing extra to learn by probing.
- Flood guard: >120 reviews/hour for one business → refused.
- `add_feedback` only works on rows younger than 24h whose uuid you hold.
- `assert_platform` rejects a platform the business hasn't configured.
- Only admins insert/update/delete businesses.

## 7. The funnel state machine

`components/funnel/RatingWidget.tsx`. Phases:

```
pick ──5★, one platform──────────────► redirect (instant window.location)
     ├─5★, several platforms─────────► choose ──tap──► redirect
     └─1–3★──────────────────────────► feedback ──submit──► thanks
                                                  └─server says gone──► gone
```

- **`redirect` is instant.** The write rides a `keepalive: true` fetch
  (configured in `lib/supabase.ts`) so it completes *behind* the
  navigation. No spinner, no wait.
- **`gone`** = server refused permanently (lapsed subscription, unknown
  slug, flood guard). Shows plain platform links instead of a hopeless
  retry loop.
- **Repeat-visit guard**: `localStorage['qrebi-rated-<slug>']`, 6 hours.
  A returning phone sees "already sent" rather than rating twice.
- **Lapsed subscription** → the page renders plain platform buttons and
  records nothing. Cards in the field never go dead.

## 8. Card links & NFC production

Each business can produce several distinct cards from one subscription:

| Link | Behaviour |
|---|---|
| `qrebi.ge/r/<slug>` | full page — chooser if several platforms |
| `qrebi.ge/r/<slug>?p=google` | Google-only card |
| `qrebi.ge/r/<slug>?p=tripadvisor` | Tripadvisor-only card |
| `qrebi.ge/r/<slug>?p=booking` | Booking-only card |

An unknown or unconfigured `?p=` value falls back to the full set (never a
broken card). The scoped platform is stamped onto the recorded rating, so
the dashboard shows which card produced what.

**`/admin` → any business → "ბმულები / NFC"** lists every variant with:
copy · print-ready QR download · **Write to NFC**.

Write to NFC uses the **Web NFC API** (`NDEFReader`), which exists **only
in Chrome on Android** (requires HTTPS + a user gesture; both satisfied).
The button is feature-detected — other browsers simply don't see it and
get the copy+QR hint instead. Typings live in `types/webnfc.d.ts`.

## 9. Setup from zero

### 9.1 Database
Run in the Supabase SQL editor, in this order:
1. `supabase/schema.sql` — pre-existing offer codes (skip if already run)
2. `supabase/funnel.sql` — the funnel. **Idempotent**, safe to re-run.

Change the seeded admin email at the bottom of `funnel.sql` if needed.

### 9.2 Auth (Supabase → Authentication)
- **URL Configuration** → Site URL `https://qrebi.ge`; Redirect URLs must
  include `https://qrebi.ge/app` (and `http://localhost:3000/app` for dev).
  **If `/app` isn't listed, magic links silently land on the homepage.**
- **SMTP**: the built-in sender is rate-limited to a handful of mails/hour
  and will not survive real onboarding. Point it at Resend (an API key
  already exists for the lead emails) or any SMTP provider **before**
  onboarding businesses.

### 9.3 Environment variables (Vercel → Settings → Environment Variables)

Funnel (required — browser-visible by design, RLS is the boundary):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```
Pre-existing landing forms (unchanged, optional for the funnel):
```
SUPABASE_SECRET_KEY   TG_BOT_TOKEN   TG_CHAT_ID
RESEND_API_KEY        LEAD_EMAIL_TO  LEAD_EMAIL_FROM
```

### 9.4 Local development
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build + typecheck
npm run lint
```
Node 20.9+. Turbopack is the default bundler for both dev and build.

## 10. Operations runbook (for the business owner of QRebi)

**Onboarding a business**
1. They pay the first month.
2. `/admin` → fill in name, slug, the platform links they have, their
   email, `paid_until` (defaults to +1 month) → Add.
3. Open the business's "ბმულები / NFC" panel on an Android phone, write
   the appropriate link to each card.
4. Tell them to sign in at `qrebi.ge/login` with that email.

**Monthly**: they pay → press **+1 თვე**. That's it. Extending anchors on
`paid_until` (not today), so no days are lost. Month-end clamps: Jan 31 →
Feb 28 → Mar 28 (documented drift; set an exact date in the edit form if
it matters).

**Non-payment**: do nothing. Past `paid_until` the page stops filtering
and recording and simply forwards everyone to the platforms. Cards never
break; the value simply stops.

**Where to get platform links**
- *Google*: Business Profile → "Ask for reviews" → `g.page/r/…/review`, or
  `search.google.com/local/writereview?placeid=…`. **Always a direct review
  link, never a plain Maps link** — the direct one opens Google's star
  picker immediately.
- *Tripadvisor*: the property page → "Write a review" → copy that URL
  (`tripadvisor.com/UserReviewEdit-g…-d…`).
- *Booking*: the property page URL (see limitation #2 below).

## 11. Honest limitations — read before promising anything

1. **Stars cannot be pre-filled or auto-posted on Google/Tripadvisor.**
   No link parameter, no API, for anybody. The customer always confirms on
   the platform's own screen. What we optimise is everything up to that
   door: instant redirect, direct review link, star picker already visible.
2. **Booking.com has no public review form.** Only guests who booked
   through Booking can review, via Booking's post-stay email. Our Booking
   button opens the property page. Set hotel expectations accordingly.
3. **Filtering low ratings is against Google's review policy**
   ("review gating"). Enforcement against small businesses is rare, but the
   risk is real and it is the operator's to carry. Mitigation is built in:
   `min_public_stars` is per business — set it to 1 to disable filtering
   for a nervous client.
4. **Billing is manual.** Stripe doesn't serve Georgian businesses. The
   schema is a single `paid_until` date, so any gateway (Flitt/Fondy,
   BOG, TBC) can be wired later without touching the funnel — see §13.
5. **Renaming a slug breaks already-printed cards.** The admin warns
   before saving; there is no slug-history/redirect table yet.

## 12. Verification already done

No automated test suite is committed (there was no test infrastructure in
this repo to extend). Verification was done with a throwaway Playwright +
mock-Supabase harness and a real Postgres 16 instance. What was proven:

**Browser (56 checks, Chromium, mobile + desktop viewports)**
- 5★ single-platform → instant redirect, rating recorded with platform
- 5★ multi-platform → chooser → Tripadvisor → choice stamped on the row
- `?p=booking` skips the chooser; unknown `?p=` falls back safely
- 2★ → the bare tap is recorded before typing; comment/contact amend the
  same row; returning phone sees "already rated"
- lapsed subscription → plain platform links, no stars
- unknown slug → styled 404 with noindex
- login → magic link requested with `redirect_to=/app`
- signed-out `/app` and `/admin` → bounce to `/login`
- dashboard: stats, 30d/all-time switch, distribution + trend charts,
  per-platform breakdown, handled-tick (badge count updates), QR data URL,
  variant chips driving link/QR filenames
- admin: non-admin blocked, Georgian name → latin slug, insert payload,
  +1 month math (`2027-01-15` → `2027-02-15`), links panel variants
- EN/GE toggle, 320px layout (no overflow)

**Postgres (behavioural, with `auth.jwt()` + anon/authenticated stubbed)**
- anon reads 0 rows from every table; RPCs are the only surface
- owner sees own rows only; other owner sees nothing; email-less JWT sees nothing
- admin sees everything; `is_admin()` correct both ways
- constraint rejections: empty owner email, bad slug, `http://` URL, no platform
- `not-available` for unknown slug / lapsed / stale review id
- `invalid-platform` for a platform the business lacks
- flood guard trips at 120/hour
- `set_feedback_handled`: owner ✅, other owner ❌, anon ❌ (permission denied)

A six-lens adversarial review (React, SQL/security, Next 16 API use, i18n,
CSS, user journeys) produced 27 findings; all were fixed or consciously
accepted — see commit `27b466e` for the list.

## 13. Suggested next steps for the developer

Roughly in order of business value:

1. **Real SMTP for magic links** (blocking for onboarding — §9.2).
2. **Payment gateway**: Flitt (Fondy Georgia) or BOG/TBC e-commerce.
   Integration point is small: on a successful charge, set
   `paid_until = addMonthsClamped(paid_until, 1)`. Add a `payments` table
   for history; nothing in the funnel needs to change.
3. **Slug history table** so renamed slugs 301 instead of 404 (limitation #5).
4. **Rate limiting per IP** — the current guard is per business per hour.
   A Postgres function can't see the IP; do it in a Next route handler or
   Supabase Edge Function if abuse appears.
5. **Owner self-service**: let owners edit their own platform URLs
   (currently admin-only). One RLS policy + a form.
6. **Automated tests in-repo** — the harness described in §12 was
   deliberately not committed (it depends on a mock server); a Supabase
   branch + Playwright project would be the durable version.
7. **Email digests** ("3 new private complaints this week") — a Supabase
   scheduled function + Resend. Strong retention lever for the 10 ₾.

## 14. Design system notes

`app/globals.css` is the whole system, organised in commented sections.
Conventions, if you extend it:

- **90° corners everywhere.** Shadows are hard offsets with no blur
  (`--shadow-hard`, `--shadow-hard-sm`).
- Brandbook colours are fixed: Cosmic Blue `--purple`, Ink Violet `--ink`,
  Soft Lilac `--lilac`, gold `--gold`. Gold is a struck label (`<mark>`),
  never a tint.
- One typeface (Montserrat + Noto Sans Georgian), contrast via weight/size.
- Bilingual text uses `<T ge="…" en="…" />` (`components/shared.tsx`) —
  CSS shows one language via `body.lang-en`. Input placeholders use
  `data-ph-ge` / `data-ph-en`. Language choice persists in localStorage.
- Chart colours (`--chart-gold`, `--chart-purple`) are deepened brand steps
  validated for colour-blind separation and contrast; every chart value is
  also printed as text, so nothing is colour-gated.
- Focus rings: gold on dark grounds, ink/purple on light ones.

---

*Questions about intent rather than code: the commit messages on this
branch are unusually detailed and explain the "why" behind each decision.*
