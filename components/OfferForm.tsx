'use client'

import { useState } from 'react'
import { CAMPAIGN } from '@/lib/campaign'
import { T } from './shared'
import { Arrow, Check, Truck } from './icons'

type Status = 'idle' | 'sending' | 'done' | 'failed'

/** Email for a code. The code is generated and stored server-side, so what the
 *  visitor sees on screen is the same string the business can be asked for. */
export default function OfferForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [code, setCode] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setStatus('sending')
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          business: data.get('business'),
          website: data.get('website'),
        }),
      })
      const j = await r.json()
      if (!j?.ok) throw new Error(j?.error ?? 'failed')
      setCode(j.code)
      setStatus('done')
    } catch {
      setStatus('failed')
    }
  }

  if (status === 'done') {
    return (
      <div className="offer-done" role="status">
        <span className="offer-tick"><Check /></span>
        <p className="offer-lead">
          <T ge="შენი კოდი მზადაა" en="Your code is ready" />
        </p>
        <b className="offer-code">{code}</b>
        <p className="offer-note">
          <T
            ge="უთხარი ეს კოდი შეკვეთისას — მიიღებ დამატებით ფასდაკლებას და უფასო მიწოდებას."
            en="Give this code when you order and you get the extra discount plus free delivery."
          />
        </p>
      </div>
    )
  }

  return (
    <form className="offer-form" onSubmit={onSubmit}>
      <div className="offer-head">
        <p className="offer-title">
          <T
            ge={<>დატოვე მეილი და მიიღე <mark>უნიკალური კოდი</mark></>}
            en={<>Leave your email and get a <mark>unique code</mark></>}
          />
        </p>
        <ul className="offer-perks">
          <li><Truck /><T ge="უფასო მიწოდება" en="Free delivery" /></li>
          <li><Check /><T ge={`დამატებითი ფასდაკლება −${CAMPAIGN.discountPct}%-ს ზემოდან`} en={`An extra discount on top of −${CAMPAIGN.discountPct}%`} /></li>
        </ul>
      </div>

      <div className="offer-row">
        <label className="sr-only" htmlFor="offer-email">
          <T ge="ელფოსტა" en="Email" />
        </label>
        <input
          id="offer-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="name@business.ge"
        />
        <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
          {status === 'sending'
            ? <T ge="იგზავნება…" en="Sending…" />
            : <><T ge="კოდის მიღება" en="Get the code" /><Arrow /></>}
        </button>
      </div>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

      {status === 'failed' && (
        <p className="offer-err" role="status">
          <T ge="ვერ გაიგზავნა. სცადე თავიდან ან მოგვწერე WhatsApp-ზე." en="Couldn't send. Try again, or message us on WhatsApp." />
        </p>
      )}
    </form>
  )
}
