import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env, supabaseConfigured } from '@/lib/env'

/**
 * Refreshes the Supabase session on every page request and returns the user id
 * from the verified JWT. Called from proxy.ts before any rendering happens, so
 * a refreshed token is always written to the response.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  if (!supabaseConfigured) return { response, userId: null as string | null }

  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Verifies the JWT (and refreshes it when expired). Must run before any response is produced.
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub ?? null

  return { response, userId }
}
