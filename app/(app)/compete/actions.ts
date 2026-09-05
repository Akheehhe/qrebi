'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/dal'
import { friendlyError } from '@/lib/errors'

export type ChallengeState = { error?: string } | undefined
export type ClaimState = { error?: string; ok?: string } | undefined

export async function createChallenge(_prev: ChallengeState, formData: FormData): Promise<ChallengeState> {
  const opponent = String(formData.get('opponent') ?? '')
  const metric = String(formData.get('metric') ?? '')
  const duration = Number(formData.get('duration'))
  const stake = String(formData.get('stake') ?? '').trim().slice(0, 120)
  if (!opponent) return { error: 'Pick an opponent.' }
  if (!['kcal_burned', 'workouts', 'points'].includes(metric)) return { error: 'Pick what to compete on.' }
  if (![7, 14, 30].includes(duration)) return { error: 'Pick a duration.' }

  const { supabase } = await requireUser()
  const { data, error } = await supabase.rpc('create_challenge', {
    p_opponent: opponent,
    p_metric: metric,
    p_duration_days: duration,
    p_stake: stake || null,
  })
  if (error) return { error: friendlyError(error.message) }
  revalidatePath('/compete')
  revalidatePath('/today')
  redirect(`/compete/${data as string}`)
}

export async function respondChallenge(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const accept = formData.get('accept') === '1'
  if (!id) return
  const { supabase } = await requireUser()
  const { error } = await supabase.rpc('respond_challenge', { p_id: id, p_accept: accept })
  if (error) throw new Error(friendlyError(error.message))
  revalidatePath(`/compete/${id}`)
  revalidatePath('/compete')
  revalidatePath('/today')
}

export async function postMessage(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const body = String(formData.get('body') ?? '').trim().slice(0, 280)
  if (!id || !body) return
  const { supabase, userId } = await requireUser()
  await supabase.from('challenge_messages').insert({ challenge_id: id, user_id: userId, body })
  revalidatePath(`/compete/${id}`)
}

export async function claimPrize(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const prizeId = String(formData.get('prize_id') ?? '')
  if (!prizeId) return { error: 'Pick a prize.' }
  const { supabase } = await requireUser()
  const { data, error } = await supabase.rpc('claim_prize', { p_prize: prizeId })
  if (error) return { error: friendlyError(error.message) }
  const row = Array.isArray(data) ? (data[0] as { points_spent: number; balance: number } | undefined) : null
  revalidatePath('/prizes')
  revalidatePath('/today')
  return { ok: row ? `Claimed. Show this screen at the desk. Balance: ${row.balance} pts.` : 'Claimed.' }
}
