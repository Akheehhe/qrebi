import 'server-only'
import { requireUser } from '@/lib/dal'
import { addDays, localDate } from '@/lib/format'
import { dayStartUTC } from '@/lib/data/workouts'
import type { WorkoutCategory } from '@/lib/types'

export type Range = 'week' | 'month' | 'year'
const DAYS: Record<Range, number> = { week: 7, month: 30, year: 365 }

type WorkoutLite = { id: string; title: string; category: WorkoutCategory; ended_at: string; duration_sec: number | null; kcal_burned: number }
type SetLite = { exercise: string; weight_kg: number | null; reps: number | null; created_at: string }

export async function getProgress(tz: string, today: string, range: Range) {
  const { supabase, userId } = await requireUser()
  const days = DAYS[range]
  const from = addDays(today, -(days - 1))
  const from14 = addDays(today, -13)

  const [w, wt, f, s] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, title, category, ended_at, duration_sec, kcal_burned')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('ended_at', dayStartUTC(addDays(today, -364), tz).toISOString())
      .order('ended_at', { ascending: true })
      .limit(2000),
    supabase.from('weight_logs').select('logged_on, weight_kg').eq('user_id', userId).gte('logged_on', from).lte('logged_on', today).order('logged_on', { ascending: true }),
    supabase.from('food_logs').select('logged_on, kcal').eq('user_id', userId).gte('logged_on', from14).lte('logged_on', today),
    supabase.from('workout_sets').select('exercise, weight_kg, reps, created_at').eq('user_id', userId).not('weight_kg', 'is', null).gt('weight_kg', 0).order('weight_kg', { ascending: false }).limit(400),
  ])
  for (const r of [w, wt, f, s]) if (r.error) throw new Error(r.error.message)

  const workouts = (w.data ?? []) as WorkoutLite[]
  const weights = ((wt.data ?? []) as { logged_on: string; weight_kg: number }[]).map((x) => ({ date: x.logged_on, kg: Number(x.weight_kg) }))
  const foods = (f.data ?? []) as { logged_on: string; kcal: number }[]
  const sets = (s.data ?? []) as SetLite[]

  const localDay = (iso: string) => localDate(tz, new Date(iso))
  const inRange = workouts.filter((x) => localDay(x.ended_at) >= from)

  // burned vs eaten, last 14 days
  const burned = new Map<string, number>()
  for (const x of workouts) burned.set(localDay(x.ended_at), (burned.get(localDay(x.ended_at)) ?? 0) + x.kcal_burned)
  const eaten = new Map<string, number>()
  for (const x of foods) eaten.set(x.logged_on, (eaten.get(x.logged_on) ?? 0) + x.kcal)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(from14, i)
    return { date, burned: burned.get(date) ?? 0, eaten: eaten.get(date) ?? 0 }
  })
  const eatenDays = last14.filter((d) => d.eaten > 0)
  const avgEaten = eatenDays.length ? Math.round(eatenDays.reduce((a, d) => a + d.eaten, 0) / eatenDays.length) : 0

  // workouts per week, last 8 weeks (Monday start)
  const weekStart = (date: string) => {
    const d = new Date(`${date}T00:00:00Z`)
    const dow = (d.getUTCDay() + 6) % 7
    return addDays(date, -dow)
  }
  const thisWeek = weekStart(today)
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, -7 * (7 - i)))
  const perWeek = weeks.map((start) => {
    const end = addDays(start, 7)
    const list = workouts.filter((x) => localDay(x.ended_at) >= start && localDay(x.ended_at) < end)
    return { start, count: list.length, kcal: list.reduce((a, x) => a + x.kcal_burned, 0) }
  })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(thisWeek, i)
    return { date, trained: (burned.get(date) ?? 0) > 0 || workouts.some((x) => localDay(x.ended_at) === date) }
  })

  // personal records: heaviest set per exercise
  const prMap = new Map<string, { weight: number; reps: number; date: string }>()
  for (const x of sets) {
    const cur = prMap.get(x.exercise)
    const kg = Number(x.weight_kg)
    if (!cur || kg > cur.weight) prMap.set(x.exercise, { weight: kg, reps: x.reps ?? 0, date: localDay(x.created_at) })
  }
  const prs = Array.from(prMap.entries())
    .map(([exercise, v]) => ({ exercise, ...v }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return {
    range,
    from,
    weights,
    weightDelta: weights.length >= 2 ? weights[weights.length - 1].kg - weights[0].kg : null,
    last14,
    avgEaten,
    perWeek,
    weekDays,
    prs,
    totals: {
      workouts: inRange.length,
      kcal: inRange.reduce((a, x) => a + x.kcal_burned, 0),
      minutes: Math.round(inRange.reduce((a, x) => a + (x.duration_sec ?? 0), 0) / 60),
    },
  }
}
