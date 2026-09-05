// Public configuration. NEXT_PUBLIC_ values are inlined into the client bundle
// by Next.js, so they must be referenced literally here.
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    '',
}

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseKey)
