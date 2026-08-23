// Supabase, two ways in — both with the publishable key only. RLS and the
// security-definer functions in supabase/funnel.sql are the entire security
// boundary; nothing in this app ever holds the secret key in the browser.
//
// Env vars (same ones api/subscribe already documents):
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigured = Boolean(url && key)

let browserClient: SupabaseClient | undefined

/** Browser client with a persisted session — /login, /app, /admin, and the
 *  rating widget. detectSessionInUrl picks the session out of the magic-link
 *  redirect. keepalive lets the 5★ submit_review call finish even though the
 *  page navigates to Google right behind it (every payload here is tiny). */
export function supabaseBrowser(): SupabaseClient {
  if (!url || !key) throw new Error('supabase-not-configured')
  browserClient ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, keepalive: true }),
    },
  })
  return browserClient
}

/** Sessionless client for server components and route handlers — /r/[slug]
 *  reads the rating page through review_page() with this. */
export function supabaseAnon(): SupabaseClient {
  if (!url || !key) throw new Error('supabase-not-configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

// The shapes the funnel RPCs answer with (see supabase/funnel.sql).
export type PlatformKey = 'google' | 'tripadvisor' | 'booking'

export type Platform = { key: PlatformKey; url: string }

export type ReviewPage = {
  name: string
  active: boolean
  min_public_stars: number
  platforms: Platform[]
}

export type SubmitReviewResult = {
  ok: boolean
  review_id: string | null
  to_public: boolean
  platforms: Platform[] | null
}

export type Business = {
  id: string
  slug: string
  name: string
  google_review_url: string | null
  tripadvisor_url: string | null
  booking_url: string | null
  owner_email: string
  paid_until: string
  min_public_stars: number
  created_at: string
}

export type Review = {
  id: string
  business_id: string
  stars: number
  comment: string | null
  author_name: string | null
  author_contact: string | null
  sent_to_google: boolean
  platform: PlatformKey | null
  handled_at: string | null
  created_at: string
}
