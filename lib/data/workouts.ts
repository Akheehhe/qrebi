import 'server-only'
import { requireUser } from '@/lib/dal'
import type { Workout, WorkoutSet } from '@/lib/types'

/** UTC instant of local midnight for a YYYY-MM-DD in a time zone. */
export function dayStartUTC(date: string, tz: string) {
  const guess = new Date(`${date}T00:00:00Z`)
  const name = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' })
    .formatToParts(guess)
    .find((p) => p.type === 'timeZoneName')?.value
  const m = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name ?? '')
  const offsetMin = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0
  return new Date(guess.getTime() - offsetMin * 60_000)
}

export async function getActiveWorkout() {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as Workout | null) ?? null
}

export async function getWorkout(id: string) {
  const { supabase, userId } = await requireUser()
  const [w, s] = await Promise.all([
    supabase.from('workouts').select('*').eq('id', id).eq('user_id', userId).maybeSingle(),
    supabase.from('workout_sets').select('*').eq('workout_id', id).order('created_at', { ascending: true }),
  ])
  if (w.error) throw new Error(w.error.message)
  if (s.error) throw new Error(s.error.message)
  return { workout: (w.data as Workout | null) ?? null, sets: (s.data ?? []) as WorkoutSet[] }
}

export async function getRecentWorkouts(limit = 6) {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('ended_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return (data ?? []) as Workout[]
}

/** Completed sessions between two instants (for "today" in the viewer's zone). */
export async function getBurn(fromUTC: Date, toUTC: Date) {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('workouts')
    .select('id, title, kcal_burned, duration_sec, ended_at, category')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('ended_at', fromUTC.toISOString())
    .lt('ended_at', toUTC.toISOString())
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as Pick<Workout, 'id' | 'title' | 'kcal_burned' | 'duration_sec' | 'ended_at' | 'category'>[]
  return { rows, kcal: rows.reduce((a, r) => a + r.kcal_burned, 0), count: rows.length }
}

export async function getWorkoutPoints(workoutId: string) {
  const { supabase, userId } = await requireUser()
  const { data } = await supabase.from('points_ledger').select('points').eq('user_id', userId).eq('ref_id', workoutId).eq('reason', 'workout').maybeSingle()
  return (data as { points: number } | null)?.points ?? 0
}
