// Offer signups -> Supabase.
//
// Env vars (Vercel -> Project -> Settings -> Environment Variables):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SECRET_KEY            – server only, never NEXT_PUBLIC_
//   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  – fallback if the secret is absent
//
// Writes go through claim_offer_code(), a security-definer function, and the
// table itself carries no RLS policies. So even if only the publishable key
// were present the email list could not be read back through the API; the
// secret key simply removes the dependence on the function's grants.
// See supabase/schema.sql.

import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Only used to answer bots; real codes are minted inside the database. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function decoyCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'QR-' + [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('')
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 200)
  const business = String(body.business ?? '').trim().slice(0, 200)
  const website = String(body.website ?? '') // honeypot

  // bots get a plausible answer so they stop retrying, and write nothing
  if (website) return Response.json({ ok: true, code: decoyCode() })

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: 'invalid-email' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    return Response.json({ ok: false, error: 'not-configured' }, { status: 503 })
  }

  const db = createClient(url, key, { auth: { persistSession: false } })

  const { data, error } = await db.rpc('claim_offer_code', {
    p_email: email,
    p_business: business || null,
  })

  if (error) {
    if (error.message?.includes('invalid-email')) {
      return Response.json({ ok: false, error: 'invalid-email' }, { status: 400 })
    }
    console.error('claim_offer_code failed:', error.message)
    return Response.json({ ok: false, error: 'store-failed' }, { status: 502 })
  }

  return Response.json({ ok: true, code: data })
}
