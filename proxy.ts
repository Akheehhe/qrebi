import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const PUBLIC_PATHS = new Set(['/welcome', '/setup'])

function isPublic(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || pathname.startsWith('/auth/')
}

/** Carries refreshed auth cookies over to a redirect response. */
function redirectWithCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  const redirect = NextResponse.redirect(url)
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  redirect.headers.set('Cache-Control', 'private, no-store')
  return redirect
}

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (!userId && !isPublic(pathname)) {
    return redirectWithCookies(request, response, '/welcome')
  }
  if (userId && (pathname === '/welcome' || pathname === '/')) {
    return redirectWithCookies(request, response, '/today')
  }

  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, metadata files and static assets.
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|icon-192.png|icon-512.png|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml)$).*)',
  ],
}
