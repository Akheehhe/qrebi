import type { Metadata } from 'next'
import { Podium } from '@/components/icons'
import { supabaseConfigured } from '@/lib/env'
import AuthPanel from './AuthPanel'

export const metadata: Metadata = { title: 'Welcome' }

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const mode = params.mode === 'up' ? 'up' : 'in'
  const notice = params.error === 'link' ? 'That link has expired. Sign in again to get a fresh one.' : undefined

  return (
    <div className="app app--bare" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '0 0 auto',
          height: '58%',
          background:
            'radial-gradient(70% 55% at 50% 0%, rgba(224,177,90,0.28), transparent 70%), radial-gradient(40% 30% at 85% 30%, rgba(61,220,151,0.12), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 'auto 0 0',
          height: '45%',
          background: 'radial-gradient(80% 60% at 50% 100%, rgba(224,177,90,0.18), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <header className="row rise" style={{ position: 'relative', paddingTop: 18 }}>
        <span className="ico ico-gold" style={{ background: 'var(--gold-grad)', color: 'var(--on-gold)' }}>
          <Podium />
        </span>
        <span className="h3">Podium</span>
      </header>

      <section className="stack rise delay-1" style={{ position: 'relative', flex: 1, justifyContent: 'center', padding: '36px 0 26px' }}>
        <h1 className="display" style={{ fontSize: 'clamp(44px, 12vw, 56px)' }}>
          Train.
          <br />
          Compete.
          <br />
          <span className="gold">Win.</span>
        </h1>
        <p className="muted" style={{ fontSize: 17, maxWidth: 320 }}>
          Track calories, crush workouts, beat your friends. Weekly and monthly leaderboards with real prizes.
        </p>
      </section>

      {supabaseConfigured ? (
        <AuthPanel initialMode={mode} notice={notice} />
      ) : (
        <section className="card stack rise delay-2">
          <p className="h3">Almost ready</p>
          <p className="muted small">Podium needs its Supabase keys before anyone can sign in. See the setup screen.</p>
          <a className="btn btn-glass btn-block" href="/setup">
            Open setup
          </a>
        </section>
      )}

      <p className="tiny dim center" style={{ marginTop: 18, position: 'relative' }}>
        By continuing you agree to compete fairly. Points come from real sessions.
      </p>
    </div>
  )
}
