import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

/** Supabase client for Client Components. Sessions live in cookies so the server sees them too. */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseKey)
}
