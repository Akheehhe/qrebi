'use client'

import { useActionState, useEffect, useState } from 'react'
import { signIn, signInWithProvider, signUp, type AuthState } from '../actions'
import { createClient } from '@/lib/supabase/client'
import { AppleLogo, Check, Close, GoogleLogo, Spinner } from '@/components/icons'

type Mode = 'in' | 'up'
type Availability = 'idle' | 'checking' | 'free' | 'taken' | 'invalid'

export default function AuthPanel({ initialMode, notice }: { initialMode: Mode; notice?: string }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signIn, undefined)
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUp, undefined)
  const [provState, provAction, provPending] = useActionState<AuthState, FormData>(signInWithProvider, undefined)

  const [username, setUsername] = useState('')
  const [availability, setAvailability] = useState<Availability>('idle')

  useEffect(() => {
    const value = username.trim().toLowerCase()
    if (!value) {
      setAvailability('idle')
      return
    }
    if (!/^[a-z0-9_]{3,20}$/.test(value)) {
      setAvailability('invalid')
      return
    }
    setAvailability('checking')
    const t = setTimeout(async () => {
      try {
        const { data } = await createClient().rpc('username_available', { p_username: value })
        setAvailability(data === false ? 'taken' : 'free')
      } catch {
        setAvailability('idle')
      }
    }, 350)
    return () => clearTimeout(t)
  }, [username])

  return (
    <section className="card stack rise delay-2" style={{ padding: 16 }}>
      <div className="seg seg--gold" role="tablist" aria-label="Sign in or create account">
        <button type="button" role="tab" aria-selected={mode === 'in'} className={mode === 'in' ? 'is-on' : ''} onClick={() => setMode('in')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'up'} className={mode === 'up' ? 'is-on' : ''} onClick={() => setMode('up')}>
          Create account
        </button>
      </div>

      {notice ? <p className="error">{notice}</p> : null}

      {mode === 'in' ? (
        <form action={inAction} className="stack stack-sm" key="in">
          <input className="input" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Email" required />
          <input className="input" name="password" type="password" autoComplete="current-password" placeholder="Password" required />
          {inState?.error ? <p className="error">{inState.error}</p> : null}
          <button className="btn btn-gold btn-block" type="submit" disabled={inPending}>
            {inPending ? <Spinner /> : null}
            {inPending ? 'Signing in' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form action={upAction} className="stack stack-sm" key="up">
          <input className="input" name="display_name" autoComplete="name" placeholder="Your name" maxLength={40} required />
          <div className="input-wrap">
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontWeight: 700 }}>@</span>
            <input
              className="input"
              style={{ paddingLeft: 36, paddingRight: 44 }}
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              placeholder="username"
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]{3,20}"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              required
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex' }} aria-live="polite">
              {availability === 'checking' ? <Spinner width={18} height={18} className="dim" /> : null}
              {availability === 'free' ? <Check width={18} height={18} className="mint" /> : null}
              {availability === 'taken' || availability === 'invalid' ? <Close width={18} height={18} className="coral" /> : null}
            </span>
          </div>
          {availability === 'taken' ? <p className="hint coral">That username is taken.</p> : null}
          {availability === 'invalid' ? <p className="hint">3 to 20 lowercase letters, numbers or underscores.</p> : null}
          <input className="input" name="email" type="email" inputMode="email" autoComplete="email" placeholder="Email" required />
          <input className="input" name="password" type="password" autoComplete="new-password" placeholder="Password (8+ characters)" minLength={8} required />
          {upState?.error ? <p className="error">{upState.error}</p> : null}
          {upState?.notice ? <p className="ok">{upState.notice}</p> : null}
          <button className="btn btn-gold btn-block" type="submit" disabled={upPending || availability === 'taken'}>
            {upPending ? <Spinner /> : null}
            {upPending ? 'Creating account' : 'Get started'}
          </button>
        </form>
      )}

      <div className="row row-sm">
        <span className="hr" />
        <span className="tiny dim">or continue with</span>
        <span className="hr" />
      </div>

      <form action={provAction} className="grid-2">
        <button className="btn btn-glass" type="submit" name="provider" value="apple" disabled={provPending}>
          <AppleLogo /> Apple
        </button>
        <button className="btn btn-glass" type="submit" name="provider" value="google" disabled={provPending}>
          <GoogleLogo /> Google
        </button>
      </form>
      {provState?.error ? <p className="hint">{provState.error}</p> : null}
    </section>
  )
}
