import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/lib/env'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * A new client per request: it reads the session from the request cookies and
 * writes refreshed tokens back when the caller can set cookies (actions and
 * route handlers). Server Components cannot set cookies, so the proxy keeps
 * sessions fresh for them.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Rendering a Server Component: cookies are read-only here and the
          // proxy has already refreshed the session for this request.
        }
      },
    },
  })
}
