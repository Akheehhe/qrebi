'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Tells the server which calendar day it is for this person. The server
 * renders "today" in this zone; without it, dates would follow the server.
 */
export default function TimezoneSync() {
  const router = useRouter()
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (!tz) return
      const current = document.cookie
        .split('; ')
        .find((c) => c.startsWith('tz='))
        ?.slice(3)
      if (decodeURIComponent(current ?? '') !== tz) {
        document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`
        router.refresh()
      }
    } catch {
      // Intl unavailable: the server default applies.
    }
  }, [router])
  return null
}
