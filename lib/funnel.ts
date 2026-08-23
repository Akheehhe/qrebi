// Small shared helpers for the funnel dashboard and admin.

import type { Business, Platform, PlatformKey } from '@/lib/supabase'

export const PLATFORM_LABEL: Record<PlatformKey, string> = {
  google: 'Google',
  tripadvisor: 'Tripadvisor',
  booking: 'Booking.com',
}

/** The business's configured destinations, same fixed order as the server. */
export function platformsOf(
  b: Pick<Business, 'google_review_url' | 'tripadvisor_url' | 'booking_url'>,
): Platform[] {
  const out: Platform[] = []
  if (b.google_review_url) out.push({ key: 'google', url: b.google_review_url })
  if (b.tripadvisor_url) out.push({ key: 'tripadvisor', url: b.tripadvisor_url })
  if (b.booking_url) out.push({ key: 'booking', url: b.booking_url })
  return out
}

/** Today as YYYY-MM-DD in the business's timezone — subscriptions flip at
 *  midnight in Tbilisi, matching the database's own check. */
export function tbilisiToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tbilisi' }).format(new Date())
}

/** paid_until is inclusive: active through the end of that day. */
export function isActive(paidUntil: string): boolean {
  return paidUntil >= tbilisiToday()
}

/** 2026-08-21 → 21.08.2026 */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

/** A full timestamptz, shown as the calendar day it was in Tbilisi — slicing
 *  the UTC string would date late-evening feedback a day early. */
export function fmtTimestampTbilisi(iso: string): string {
  return fmtDate(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tbilisi' }).format(new Date(iso)),
  )
}

/** Add months to an ISO date, clamping to the target month's last day
 *  (31 Jan + 1 month → 28/29 Feb, never 2/3 Mar). */
export function addMonthsClamped(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const targetMonth0 = m - 1 + months
  const ty = y + Math.floor(targetMonth0 / 12)
  const tm = ((targetMonth0 % 12) + 12) % 12
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate()
  const td = Math.min(d, lastDay)
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(td).padStart(2, '0')}`
}

// Practical (not scholarly) romanization, just to suggest a slug the admin
// can still edit by hand.
const KA: Record<string, string> = {
  ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i',
  კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's',
  ტ: 't', უ: 'u', ფ: 'f', ქ: 'k', ღ: 'gh', ყ: 'q', შ: 'sh', ჩ: 'ch',
  ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch', ხ: 'kh', ჯ: 'j', ჰ: 'h',
}

export function slugify(name: string): string {
  return name
    .split('')
    .map((c) => KA[c] ?? c)
    .join('')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '')
}
