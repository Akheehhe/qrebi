'use client'

import { useState } from 'react'
import { EMAIL, T } from './shared'
import { Check, NoFee } from './icons'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

/**
 * Two delivery channels race; one success is enough. If both fail we keep the
 * form, show the error, and open a prefilled mail draft so the lead is never
 * silently lost — same contract as the static build.
 */
export default function OrderForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '')
    const phone = String(data.get('phone') ?? '')
    const business = String(data.get('business') ?? '')
    const website = String(data.get('website') ?? '') // honeypot

    setStatus('sending')

    const viaEmail = fetch(`https://formsubmit.co/ajax/${EMAIL}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        _subject: `ახალი შეკვეთა: Qrebi.ge · ${name || phone}`,
        _template: 'table',
        _captcha: 'false',
        _honey: website,
        სახელი: name,
        ბიზნესი: business,
        ტელეფონი: phone,
      }),
    })
      .then((r) => r.json())
      .then((j) => j?.success === 'true' || j?.success === true)
      .catch(() => false)

    const viaApi = fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, phone, business, website }),
    })
      .then(async (r) => r.ok && (await r.json())?.ok === true)
      .catch(() => false)

    const ok = (await Promise.all([viaEmail, viaApi])).some(Boolean)

    if (!ok) {
      setStatus('failed')
      const body = encodeURIComponent(
        `სახელი: ${name}\nბიზნესი: ${business}\nტელეფონი: ${phone}`,
      )
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
        'ახალი შეკვეთა: Qrebi.ge',
      )}&body=${body}`
      return
    }
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="success" data-reveal>
        <span className="tick"><Check /></span>
        <h3 style={{ fontSize: 26 }}>
          <T ge="მიღებულია!" en="Got it!" />
        </h3>
        <p style={{ fontSize: 16, color: 'var(--text)' }}>
          <T
            ge="დაგირეკავთ დღესვე სამუშაო საათებში."
            en="We'll call you today during working hours."
          />
        </p>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={onSubmit} data-reveal noValidate={false}>
      <label>
        <span>
          <T ge="სახელი" en="Your name" />
        </span>
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          placeholder="გიორგი"
          data-ph-ge="გიორგი"
          data-ph-en="Giorgi"
        />
      </label>
      <label>
        <span>
          <T ge="ბიზნესის სახელი" en="Business name" />
        </span>
        <input
          type="text"
          name="business"
          autoComplete="organization"
          placeholder="Cafe Vino"
          data-ph-ge="Cafe Vino"
          data-ph-en="Cafe Vino"
        />
      </label>
      <label>
        <span>
          <T ge="ტელეფონი" en="Phone" />
        </span>
        <input
          type="tel"
          name="phone"
          required
          inputMode="tel"
          autoComplete="tel"
          pattern="[0-9 +()\-]{9,}"
          placeholder="+995 5__ __ __ __"
        />
      </label>

      {/* honeypot — bots fill it, api/lead silently accepts and drops them */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
      />

      <p
        className="reg-note"
        role="status"
        aria-live="polite"
        style={{
          display: status === 'failed' ? 'block' : 'none',
          background: '#FDECEC',
          color: '#B3261E',
        }}
      >
        <T
          ge="ვერ გაიგზავნა. სცადე თავიდან ან მოგვწერე WhatsApp-ზე: +995 592 10 54 19"
          en="Couldn't send. Try again or message us on WhatsApp: +995 592 10 54 19"
        />
      </p>

      <button type="submit" className="btn btn-ink" disabled={sending}>
        {sending ? <T ge="იგზავნება…" en="Sending…" /> : <T ge="გაგზავნა" en="Send" />}
      </button>

      <p className="form-foot">
        <NoFee />
        <T
          ge="არავითარი ვალდებულება. წინასწარ არაფერს იხდი."
          en="No obligation. You pay nothing upfront."
        />
      </p>
    </form>
  )
}
