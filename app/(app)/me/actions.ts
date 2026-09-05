'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/dal'
import { friendlyError } from '@/lib/errors'

export type ProfileState = { error?: string; ok?: boolean } | undefined
export type WeightState = { error?: string; ok?: boolean } | undefined

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

function intIn(v: unknown, min: number, max: number, fallback: number) {
  const x = Math.round(Number(v))
  return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : fallback
}

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const { supabase, userId } = await requireUser()
  const display_name = String(formData.get('display_name') ?? '').trim().slice(0, 40)
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const city = String(formData.get('city') ?? '').trim().slice(0, 60)
  const weightRaw = String(formData.get('weight_kg') ?? '').trim()
  const weight_kg = weightRaw ? Math.round(Number(weightRaw) * 10) / 10 : null

  if (!display_name) return { error: 'Your name cannot be empty.' }
  if (!USERNAME_RE.test(username)) return { error: 'Username: 3 to 20 lowercase letters, numbers or underscores.' }
  if (weight_kg != null && (!Number.isFinite(weight_kg) || weight_kg < 30 || weight_kg > 300)) return { error: 'Weight must be between 30 and 300 kg.' }

  const { data: current } = await supabase.from('profiles').select('username').eq('id', userId).single()
  if ((current as { username: string } | null)?.username !== username) {
    const { data: free } = await supabase.rpc('username_available', { p_username: username })
    if (free === false) return { error: `@${username} is taken.` }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name,
      username,
      city: city || null,
      weight_kg,
      daily_kcal_goal: intIn(formData.get('daily_kcal_goal'), 800, 8000, 2300),
      protein_goal_g: intIn(formData.get('protein_goal_g'), 0, 600, 150),
      carbs_goal_g: intIn(formData.get('carbs_goal_g'), 0, 1200, 250),
      fat_goal_g: intIn(formData.get('fat_goal_g'), 0, 400, 70),
    })
    .eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  redirect('/me')
}

export async function logWeight(_prev: WeightState, formData: FormData): Promise<WeightState> {
  const { supabase, userId } = await requireUser()
  const kg = Math.round(Number(formData.get('kg')) * 10) / 10
  const date = String(formData.get('date') ?? '')
  if (!Number.isFinite(kg) || kg < 30 || kg > 300) return { error: 'Weight must be between 30 and 300 kg.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Bad date.' }
  const [a, b] = await Promise.all([
    supabase.from('weight_logs').upsert({ user_id: userId, logged_on: date, weight_kg: kg }, { onConflict: 'user_id,logged_on' }),
    supabase.from('profiles').update({ weight_kg: kg }).eq('id', userId),
  ])
  if (a.error) return { error: a.error.message }
  if (b.error) return { error: b.error.message }
  revalidatePath('/progress')
  revalidatePath('/me')
  return { ok: true }
}

export async function requestFriend(formData: FormData) {
  const target = String(formData.get('user_id') ?? '')
  if (!target) return
  const { supabase } = await requireUser()
  const { error } = await supabase.rpc('request_friend', { p_user: target })
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath('/me/friends')
  revalidatePath('/me')
}

export async function respondFriend(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const accept = formData.get('accept') === '1'
  if (!id) return
  const { supabase, userId } = await requireUser()
  if (accept) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id).eq('addressee_id', userId)
  } else {
    await supabase.from('friendships').delete().eq('id', id).or(`addressee_id.eq.${userId},requester_id.eq.${userId}`)
  }
  revalidatePath('/me/friends')
  revalidatePath('/me')
}
