'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/dal'
import { friendlyError } from '@/lib/errors'
import { CATEGORIES, CUSTOM_TEMPLATE, findTemplate } from '@/lib/workouts'
import type { WorkoutCategory } from '@/lib/types'

export type SetInput = {
  exercise: string
  set_index: number
  weight_kg: number | null
  reps: number | null
  duration_sec: number | null
}

/** Starts a session from a template (or resumes the one already running). */
export async function startWorkout(formData: FormData) {
  const slug = String(formData.get('slug') ?? 'custom')
  const template = findTemplate(slug) ?? CUSTOM_TEMPLATE
  const { supabase, userId } = await requireUser()

  const { data: existing } = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
  if (existing) redirect(`/train/active/${(existing as { id: string }).id}`)

  const { data, error } = await supabase
    .from('workouts')
    .insert({ user_id: userId, title: template.title, category: template.category, status: 'active' })
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Could not start the workout')
  redirect(`/train/active/${(data as { id: string }).id}`)
}

export async function logSet(workoutId: string, set: SetInput): Promise<{ ok: boolean; error?: string }> {
  const { supabase, userId } = await requireUser()
  const exercise = set.exercise.trim().slice(0, 80)
  if (!exercise) return { ok: false, error: 'Exercise name missing.' }
  const clean = {
    workout_id: workoutId,
    user_id: userId,
    exercise,
    set_index: Math.min(50, Math.max(1, Math.round(set.set_index))),
    weight_kg: set.weight_kg == null ? null : Math.min(600, Math.max(0, Math.round(set.weight_kg * 2) / 2)),
    reps: set.reps == null ? null : Math.min(500, Math.max(0, Math.round(set.reps))),
    duration_sec: set.duration_sec == null ? null : Math.min(7200, Math.max(0, Math.round(set.duration_sec))),
    completed: true,
  }
  const { error } = await supabase.from('workout_sets').insert(clean)
  return error ? { ok: false, error: error.message } : { ok: true }
}

export async function finishWorkout(workoutId: string, notes: string | null) {
  const { supabase } = await requireUser()
  const { error } = await supabase.rpc('complete_workout', { p_workout_id: workoutId, p_notes: notes })
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/today')
  revalidatePath('/train')
  redirect(`/train/done/${workoutId}`)
}

export async function discardWorkout(workoutId: string) {
  const { supabase, userId } = await requireUser()
  await supabase.from('workouts').update({ status: 'discarded' }).eq('id', workoutId).eq('user_id', userId).eq('status', 'active')
  revalidatePath('/train')
  redirect('/train')
}

export type QuickLogState = { error?: string } | undefined

/** Records a session that already happened, without the live timer. */
export async function quickLog(_prev: QuickLogState, formData: FormData): Promise<QuickLogState> {
  const title = String(formData.get('title') ?? '').trim().slice(0, 80)
  const category = String(formData.get('category') ?? '') as WorkoutCategory
  const minutes = Number(formData.get('minutes'))
  const when = String(formData.get('when') ?? 'now')
  if (!title) return { error: 'Give the session a name.' }
  if (!CATEGORIES.includes(category) && category !== 'other') return { error: 'Pick a type.' }
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 360) return { error: 'Duration must be between 1 and 360 minutes.' }

  const startedAt =
    when === 'yesterday'
      ? new Date(Date.now() - 24 * 3600 * 1000 - minutes * 60 * 1000).toISOString()
      : when === 'morning'
        ? new Date(Date.now() - 6 * 3600 * 1000).toISOString()
        : null

  const { supabase } = await requireUser()
  const { data, error } = await supabase.rpc('log_workout', {
    p_title: title,
    p_category: category,
    p_duration_min: Math.round(minutes),
    p_started_at: startedAt,
  })
  if (error) return { error: friendlyError(error.message) }
  const row = Array.isArray(data) ? (data[0] as { workout_id: string } | undefined) : null
  if (!row) return { error: 'Could not save the session.' }
  revalidatePath('/today')
  revalidatePath('/train')
  redirect(`/train/done/${row.workout_id}`)
}
