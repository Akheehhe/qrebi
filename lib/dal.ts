import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

/** Verified session for this request. Cached per render pass. */
export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub ?? null
  return { supabase, userId }
})

/** Session or redirect to /welcome. Every page, action and route handler goes through this. */
export async function requireUser() {
  const { supabase, userId } = await getSession()
  if (!userId) redirect('/welcome')
  return { supabase, userId: userId as string }
}

export const getProfile = cache(async (): Promise<Profile> => {
  const { supabase, userId } = await requireUser()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) {
    // The auth trigger creates the profile; a missing row means it did not run yet.
    redirect('/setup')
  }
  return data as Profile
})
