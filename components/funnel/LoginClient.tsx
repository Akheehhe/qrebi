'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser, supabaseConfigured } from '@/lib/supabase'
import FunnelShell from '@/components/funnel/FunnelShell'
import { EMAIL, T } from '@/components/shared'
import { Arrow, Check } from '@/components/icons'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

/** Passwordless door to the dashboard: the owner types the email their
 *  business is registered under and gets a one-tap sign-in link. */
export default function LoginClient() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')

  // already signed in? straight through.
  useEffect(() => {
    if (!supabaseConfigured) return
    supabaseBrowser().auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/app')
    })
  }, [router])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim()
    if (!email) return
    setStatus('sending')
    try {
      const { error } = await supabaseBrowser().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      })
      if (error) throw error
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  if (!supabaseConfigured) {
    return (
      <FunnelShell>
        <div className="rp-card">
          <p className="rp-biz"><T ge="დროებით მიუწვდომელია" en="Temporarily unavailable" /></p>
          <p className="rp-ask"><T ge={`მოგვწერე: ${EMAIL}`} en={`Write to us: ${EMAIL}`} /></p>
        </div>
      </FunnelShell>
    )
  }

  if (status === 'sent') {
    return (
      <FunnelShell>
        <div className="rp-card" role="status">
          <span className="rp-tick rp-tick-ok"><Check /></span>
          <p className="rp-biz"><T ge="შეამოწმე ელფოსტა" en="Check your email" /></p>
          <p className="rp-ask">
            <T
              ge="გამოგიგზავნეთ ბმული — ერთი დაჭერა და შენს კაბინეტში ხარ."
              en="We've sent you a link — one tap and you're in your dashboard."
            />
          </p>
        </div>
      </FunnelShell>
    )
  }

  return (
    <FunnelShell>
      <div className="rp-card">
        <p className="rp-biz"><T ge="შესვლა" en="Log in" /></p>
        <p className="rp-ask">
          <T
            ge="ჩაწერე ელფოსტა, რომლითაც შენი ბიზნესი დარეგისტრირდა. პაროლი არ სჭირდება."
            en="Enter the email your business is registered under. No password needed."
          />
        </p>
        <form className="rp-form" onSubmit={onSubmit}>
          <label>
            <span><T ge="ელფოსტა" en="Email" /></span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="name@business.ge"
            />
          </label>
          {status === 'failed' && (
            <p className="reg-note" role="status">
              <T ge="ვერ გაიგზავნა. სცადე თავიდან." en="Couldn't send. Please try again." />
            </p>
          )}
          <button type="submit" className="btn btn-ink" disabled={status === 'sending'}>
            {status === 'sending'
              ? <T ge="იგზავნება…" en="Sending…" />
              : <><T ge="ბმულის მიღება" en="Send me the link" /><Arrow /></>}
          </button>
        </form>
      </div>
    </FunnelShell>
  )
}
