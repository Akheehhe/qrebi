# QRebi.ge

Two offerings, one site:

1. **NFC card** (one-time purchase) — taps open any link the business chooses.
2. **Smart review page** (10 ₾/month) — the card points at `qrebi.ge/r/<slug>`
   instead of straight at Google. The customer picks a star count; ratings at
   or above the business's threshold (default 4★) are recorded and the
   customer is carried on to the Google review form, lower ratings become a
   private message only the owner sees. Owners watch it all from `/app` —
   stat tiles with a 30-days/all-time switch, a star-distribution chart, a
   day-by-day trend, the feedback inbox with mark-as-handled ticks, and a
   downloadable print-ready QR of their link; you run subscriptions from
   `/admin`.

## One-time setup

### 1. Database (Supabase → SQL editor)

Run once, in this order:

- `supabase/schema.sql` — offer-code signups (already live).
- `supabase/funnel.sql` — businesses, reviews, RLS, and the two functions the
  public rating page uses. The bottom of the file seeds your admin email —
  edit it there if you ever change accounts.

### 2. Auth (Supabase → Authentication)

- **URL Configuration** → Site URL: `https://qrebi.ge`; Redirect URLs: add
  `https://qrebi.ge/app` (and `http://localhost:3000/app` for local dev).
- Magic-link emails use Supabase's built-in sender, which is heavily
  rate-limited. Before onboarding real businesses, set **Authentication →
  SMTP** to a real sender (Resend works and you already have an account for
  the lead emails).

### 3. Env vars (Vercel → Project → Settings → Environment Variables)

The funnel needs only the two public ones (RLS is the security boundary;
no secret key ever reaches the browser):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Operating the subscription (manual billing)

1. Business pays the first month (transfer/cash/whatever you agree).
2. You open `/admin` (sign in at `/login` with your admin email) and create
   the business: name, slug, their Google review link, the owner's email.
   `paid_until` defaults to one month out.
3. Encode their NFC cards with `https://qrebi.ge/r/<slug>`.
4. The owner signs in at `/login` with their email — no password, they get a
   link — and lands on their dashboard.
5. Every following month: they pay, you press **+1 month** on their row.
   (+1 month clamps at month ends — Jan 31 → Feb 28 → Mar 28; if the drift
   ever bothers you, set the exact date in the row's edit form instead.)
   If they stop paying, do nothing — past `paid_until` the page stops
   filtering and recording and simply forwards everyone to Google, so their
   cards never go dead.

**Platform links** — a business can have up to three (at least one), and a
happy customer either goes straight there (one platform) or picks from a
one-tap chooser (several — the hotel setup):

- **Google:** in their Google Business Profile, "Ask for reviews" gives a
  share link (`g.page/r/…/review`); the
  `search.google.com/local/writereview?placeid=…` form works too. Always
  use one of these *direct review* forms, never a plain Maps link: they
  open Google's own star picker immediately, so a 5★ customer lands with
  the stars already in front of them. (Google offers no way to pre-fill or
  auto-post the stars — no tool can; the customer confirms them on
  Google's side with one tap.)
- **Tripadvisor:** open the property's Tripadvisor page, press "Write a
  review", and copy that URL (`tripadvisor.com/UserReviewEdit-g…-d…`) —
  it opens the review form directly for anyone with a Tripadvisor account.
- **Booking.com:** use the property's page URL. Be straight with hotels
  about this one: Booking has **no public review form** — only guests who
  booked through Booking can review, from the email Booking itself sends
  after checkout. The button still helps (guests find the property and
  their invite), but Booking review volume is driven by Booking, not by
  any link.

**Per-business threshold:** `min_public_stars` (admin panel, "Goes to Google
from") decides which ratings continue to Google. Default 4★+. Setting it to
1★ sends everyone to Google — i.e. filtering off for that business.

> Note: steering only satisfied customers toward Google while diverting
> unhappy ones ("review gating") is against Google's review policies and can
> get reviews or the profile penalized if noticed. The threshold knob above
> is per business, so you can run any business as low-risk as you like.

## Development

```
npm install
npm run dev
```

`app/(site)` is the marketing landing; `app/r/[slug]` the customer rating
page; `app/app` the owner dashboard; `app/admin` the operator panel. All
Supabase access goes through `lib/supabase.ts` with the publishable key.
