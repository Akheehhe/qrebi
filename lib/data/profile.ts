import 'server-only'
import { requireUser } from '@/lib/dal'
import { localHour } from '@/lib/format'

export type Badge = { key: string; label: string; emoji: string; earned: boolean; hint: string }

export async function getProfileStats(tz: string) {
  const { supabase, userId } = await requireUser()
  const [w, wins, balance, streak, scans, created, weekly] = await Promise.all([
    supabase.from('workouts').select('id, category, duration_sec, started_at').eq('user_id', userId).eq('status', 'completed').limit(2000),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('winner_id', userId),
    supabase.rpc('my_points'),
    supabase.rpc('current_streak'),
    supabase.from('food_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('source', 'scan'),
    supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('challenger_id', userId),
    supabase.rpc('my_rank', { p_period: 'weekly' }),
  ])
  const workouts = (w.data ?? []) as { id: string; category: string; duration_sec: number | null; started_at: string }[]
  const winCount = wins.count ?? 0
  const rank = Array.isArray(weekly.data) && weekly.data[0] ? (weekly.data[0] as { rank: number | null }).rank : null
  const streakDays = Number(streak.data ?? 0)

  const badges: Badge[] = [
    { key: 'first', label: 'First session', emoji: '🎯', earned: workouts.length >= 1, hint: 'Finish one workout' },
    { key: 'ten', label: '10 workouts', emoji: '🔟', earned: workouts.length >= 10, hint: 'Finish ten workouts' },
    { key: 'thirty', label: '30 workouts', emoji: '💪', earned: workouts.length >= 30, hint: 'Finish thirty workouts' },
    { key: '5k', label: 'First 5K', emoji: '🏃', earned: workouts.some((x) => x.category === 'run' && (x.duration_sec ?? 0) >= 20 * 60), hint: 'Run for 20 minutes or more' },
    { key: 'streak7', label: 'Streak 7', emoji: '🔥', earned: streakDays >= 7, hint: 'Stay active 7 days in a row' },
    { key: 'early', label: 'Early bird', emoji: '🌅', earned: workouts.some((x) => localHour(tz, new Date(x.started_at)) < 7), hint: 'Start a workout before 7 am' },
    { key: 'challenger', label: 'Challenger', emoji: '⚔️', earned: (created.count ?? 0) >= 1, hint: 'Challenge a friend' },
    { key: 'winner', label: 'Winner', emoji: '🏆', earned: winCount >= 1, hint: 'Win a challenge' },
    { key: 'podium', label: 'Podium', emoji: '🥇', earned: rank != null && rank <= 3, hint: 'Reach the weekly top 3' },
    { key: 'scanner', label: 'Scanner', emoji: '📸', earned: (scans.count ?? 0) >= 1, hint: 'Scan a meal with the camera' },
  ]

  return {
    workouts: workouts.length,
    wins: winCount,
    balance: Number(balance.data ?? 0),
    streak: streakDays,
    weeklyRank: rank,
    badges,
  }
}
