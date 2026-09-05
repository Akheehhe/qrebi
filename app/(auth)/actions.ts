'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseConfigured } from '@/lib/env'

export type AuthState = { error?: string; notice?: string } | undefined

const USERNAME_RE = /^[a-z0-9_]{3,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

function friendly(message: string) {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Wrong email or password.'
  if (m.includes('email not confirmed')) return 'Confirm your email first. The link is in your inbox.'
  if (m.includes('already registered') || m.includes('already been registered')) return 'That email already has an account. Sign in instead.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Give it a minute and try again.'
  if (m.includes('password')) return 'Password needs at least 8 characters.'
  return message
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: 'Supabase is not configured yet.' }
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!EMAIL_RE.test(email) || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: friendly(error.message) }
  redirect('/today')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: 'Supabase is not configured yet.' }
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const username = String(formData.get('username') ?? '').trim().toLowerCase()
  const displayName = String(formData.get('display_name') ?? '').trim().slice(0, 40)

  if (!displayName) return { error: 'Tell us what to call you.' }
  if (!USERNAME_RE.test(username)) return { error: 'Username: 3 to 20 letters, numbers or underscores.' }
  if (!EMAIL_RE.test(email)) return { error: 'That email does not look right.' }
  if (password.length < 8) return { error: 'Password needs at least 8 characters.' }

  const supabase = await createClient()
  const { data: available } = await supabase.rpc('username_available', { p_username: username })
  if (available === false) return { error: `@${username} is taken. Try another.` }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/today`,
    },
  })
  if (error) return { error: friendly(error.message) }
  if (data.session) redirect('/today')
  return { notice: `Almost there. Confirm your email at ${email}, then sign in.` }
}

export async function signInWithProvider(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return { error: 'Supabase is not configured yet.' }
  const provider = formData.get('provider')
  if (provider !== 'apple' && provider !== 'google') return { error: 'Unknown sign-in provider.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=/today` },
  })
  if (error || !data.url) {
    return { error: `${provider === 'apple' ? 'Apple' : 'Google'} sign-in is not switched on for this project yet. Use email for now.` }
  }
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/welcome')
}
