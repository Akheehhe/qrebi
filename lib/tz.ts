import 'server-only'
import { cookies } from 'next/headers'
import { localDate, localHour } from '@/lib/format'

export const DEFAULT_TZ = 'Asia/Tbilisi'

/** The viewer's IANA time zone, set by <TimezoneSync /> on the client. */
export async function getTimeZone() {
  const store = await cookies()
  const tz = store.get('tz')?.value
  if (!tz) return DEFAULT_TZ
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return tz
  } catch {
    return DEFAULT_TZ
  }
}

export async function getToday() {
  const tz = await getTimeZone()
  return { tz, today: localDate(tz), hour: localHour(tz) }
}
