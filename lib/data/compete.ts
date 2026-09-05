import 'server-only'
import { requireUser } from '@/lib/dal'
import type { Challenge, ChallengeMessage, Friendship, LeaderboardRow, Period, Prize, PrizeClaim, ProfileLite } from '@/lib/types'

export async function getLeaderboard(period: Period, limit = 50) {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.rpc('leaderboard', { p_period: period, p_limit: limit })
  if (error) throw new Error(error.message)
  return (data ?? []) as LeaderboardRow[]
}

export async function getProfilesById(ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (!unique.length) return new Map<string, ProfileLite>()
  const { supabase } = await requireUser()
  const { data, error } = await supabase.from('profiles').select('id, username, display_name, avatar_url').in('id', unique)
  if (error) throw new Error(error.message)
  return new Map(((data ?? []) as ProfileLite[]).map((p) => [p.id, p]))
}

export async function getMyChallenges() {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw new Error(error.message)
  const challenges = (data ?? []) as Challenge[]
  const profiles = await getProfilesById(challenges.flatMap((c) => [c.challenger_id, c.opponent_id]))
  return { challenges, profiles, userId }
}

/** The one challenge worth showing on Today: the active one ending soonest, else a pending invite. */
export async function getFeaturedChallenge() {
  const { challenges, profiles, userId } = await getMyChallenges()
  const active = challenges.filter((c) => c.status === 'active').sort((a, b) => Date.parse(a.ends_at) - Date.parse(b.ends_at))[0]
  const pending = challenges.find((c) => c.status === 'pending' && c.opponent_id === userId)
  const pick = active ?? pending
  if (!pick) return null
  let live = pick
  if (pick.status === 'active') {
    const { supabase } = await requireUser()
    const { data } = await supabase.rpc('get_challenge', { p_id: pick.id })
    if (Array.isArray(data) && data[0]) live = data[0] as Challenge
  }
  const meIsChallenger = live.challenger_id === userId
  const opponentId = meIsChallenger ? live.opponent_id : live.challenger_id
  return {
    challenge: live,
    me: { id: userId, score: meIsChallenger ? live.challenger_score : live.opponent_score },
    opponent: { ...(profiles.get(opponentId) ?? { id: opponentId, username: 'rival', display_name: 'Rival', avatar_url: null }), score: meIsChallenger ? live.opponent_score : live.challenger_score },
  }
}

export async function getChallengeDetail(id: string) {
  const { supabase, userId } = await requireUser()
  const [c, d, m] = await Promise.all([
    supabase.rpc('get_challenge', { p_id: id }),
    supabase.rpc('challenge_daily', { p_id: id }),
    supabase.from('challenge_messages').select('*').eq('challenge_id', id).order('created_at', { ascending: true }).limit(50),
  ])
  if (c.error) throw new Error(c.error.message)
  const challenge = Array.isArray(c.data) && c.data[0] ? (c.data[0] as Challenge) : null
  if (!challenge) return null
  const profiles = await getProfilesById([challenge.challenger_id, challenge.opponent_id])
  return {
    challenge,
    daily: ((d.data ?? []) as { day: string; challenger: number; opponent: number }[]),
    messages: ((m.data ?? []) as ChallengeMessage[]),
    profiles,
    userId,
  }
}

export async function getFriends() {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase.from('friendships').select('*').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as Friendship[]
  const otherId = (f: Friendship) => (f.requester_id === userId ? f.addressee_id : f.requester_id)
  const profiles = await getProfilesById(rows.map(otherId))
  const withProfile = (f: Friendship) => ({ friendship: f, profile: profiles.get(otherId(f)) ?? null })
  return {
    accepted: rows.filter((f) => f.status === 'accepted').map(withProfile),
    incoming: rows.filter((f) => f.status === 'pending' && f.addressee_id === userId).map(withProfile),
    outgoing: rows.filter((f) => f.status === 'pending' && f.requester_id === userId).map(withProfile),
    userId,
  }
}

export async function searchProfiles(q: string) {
  const { supabase, userId } = await requireUser()
  const term = q.trim().toLowerCase().replace(/[%_,]/g, '')
  if (term.length < 2) return [] as ProfileLite[]
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .neq('id', userId)
    .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
    .limit(12)
  return (data ?? []) as ProfileLite[]
}

export async function getPrizes() {
  const { supabase } = await requireUser()
  const [p, c] = await Promise.all([
    supabase.from('prizes').select('*').eq('active', true).order('sort', { ascending: true }),
    supabase.from('prize_claims').select('*').order('created_at', { ascending: false }).limit(20),
  ])
  if (p.error) throw new Error(p.error.message)
  return { prizes: (p.data ?? []) as Prize[], claims: (c.data ?? []) as PrizeClaim[] }
}
