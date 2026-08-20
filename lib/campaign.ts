/**
 * The campaign, in one place.
 *
 * `endsAt` is a real, fixed deadline — not a per-visitor countdown that resets
 * on every load. When it passes, the site stops claiming a discount and shows
 * the regular prices again; nothing has to be edited for that to happen.
 *
 * `was` is the genuine regular price. Showing a struck-through figure that was
 * never charged is a fabricated reference price, which the EU Omnibus
 * directive and Georgian consumer law both treat as misleading.
 */
export const CAMPAIGN = {
  endsAt: '2026-08-31T23:59:59+04:00', // Georgia is UTC+4
  discountPct: 40,
}

export const campaignEndMs = () => new Date(CAMPAIGN.endsAt).getTime()
export const campaignLive = (now: number = Date.now()) => now < campaignEndMs()

export type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

export function remaining(now: number = Date.now()): Remaining {
  const ms = campaignEndMs() - now
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  }
}
