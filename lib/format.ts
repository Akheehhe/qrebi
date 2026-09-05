const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const oneDp = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** 1,234 */
export function n(value: number | null | undefined) {
  return intFmt.format(Math.round(value ?? 0))
}

/** 82.4 */
export function n1(value: number | null | undefined) {
  return oneDp.format(value ?? 0)
}

/** Local calendar date (YYYY-MM-DD) in a time zone. */
export function localDate(timeZone: string, date: Date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function localHour(timeZone: string, date: Date = new Date()) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(date))
}

/** Shift a YYYY-MM-DD string by whole days. */
export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000)
}

export function weekdayShort(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

export function dayOfMonth(iso: string) {
  return Number(iso.slice(8, 10))
}

export function monthShort(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
}

export function relativeDay(iso: string, today: string) {
  if (iso === today) return 'Today'
  if (iso === addDays(today, -1)) return 'Yesterday'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

/** 24:31 or 1:04:09 */
export function clock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = h ? String(m).padStart(2, '0') : String(m)
  return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`
}

/** 45 min or 1 h 20 min */
export function minutes(totalSeconds: number | null | undefined) {
  const m = Math.round((totalSeconds ?? 0) / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}

export function timeLeft(endsAt: string, now: number = Date.now()) {
  const ms = Date.parse(endsAt) - now
  if (ms <= 0) return 'Ended'
  const hours = Math.floor(ms / 3_600_000)
  if (hours < 1) return `${Math.max(1, Math.floor(ms / 60_000))} min left`
  if (hours < 48) return `${hours} h left`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} left`
}

export function greeting(hour: number) {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? '?'
  const second = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + second).toUpperCase()
}

export function timeAgo(iso: string, now: number = Date.now()) {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return `${d}d ago`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
