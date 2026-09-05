import 'server-only'
import { requireUser } from '@/lib/dal'
import type { MyRank } from '@/lib/types'

const emptyRank: MyRank = { rank: null, points: 0, players: 0, gap_to_top5: null }

export async function getPointsSummary() {
  const { supabase } = await requireUser()
  const [balance, weekly, monthly, streak] = await Promise.all([
    supabase.rpc('my_points'),
    supabase.rpc('my_rank', { p_period: 'weekly' }),
    supabase.rpc('my_rank', { p_period: 'monthly' }),
    supabase.rpc('current_streak'),
  ])
  const pick = (r: { data: unknown }) => (Array.isArray(r.data) && r.data[0] ? (r.data[0] as MyRank) : emptyRank)
  return {
    balance: Number(balance.data ?? 0),
    weekly: pick(weekly),
    monthly: pick(monthly),
    streak: Number(streak.data ?? 0),
  }
}
