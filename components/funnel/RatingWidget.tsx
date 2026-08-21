'use client'

import { useRef, useState } from 'react'
import { supabaseBrowser, type SubmitReviewResult } from '@/lib/supabase'
import { T } from '@/components/shared'
import { Check, GoogleG, Star } from '@/components/icons'

type Props = {
  slug: string
  name: string
  minPublicStars: number
  googleReviewUrl: string
}

type Phase = 'pick' | 'feedback' | 'sending' | 'thanks' | 'google'

/** The funnel itself. One tap on a star decides the route:
 *  at or above the business's threshold the rating is recorded and the
 *  customer is carried straight on to the public Google review form;
 *  below it they get a private feedback form that only the owner sees. */
export default function RatingWidget({ slug, name, minPublicStars, googleReviewUrl }: Props) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [stars, setStars] = useState(0)
  const [failed, setFailed] = useState(false)
  // one written row per visit, whichever path fires first
  const wrote = useRef(false)

  async function record(n: number, extra?: { comment?: string; name?: string; contact?: string }) {
    if (wrote.current) return null
    wrote.current = true
    try {
      const { data, error } = await supabaseBrowser().rpc('submit_review', {
        p_slug: slug,
        p_stars: n,
        p_comment: extra?.comment ?? null,
        p_name: extra?.name ?? null,
        p_contact: extra?.contact ?? null,
      })
      if (error) throw error
      return data as SubmitReviewResult
    } catch {
      wrote.current = false
      return null
    }
  }

  function pick(n: number) {
    if (phase === 'sending' || phase === 'thanks' || phase === 'google') return
    setStars(n)
    setFailed(false)
    if (n >= minPublicStars) {
      setPhase('google')
      // A happy customer must reach Google even if our write stalls: race the
      // insert against a short clock and go with whichever finishes first.
      const timer = new Promise<null>((res) => setTimeout(() => res(null), 2500))
      Promise.race([record(n), timer]).then((r) => {
        window.location.assign(r?.google_review_url || googleReviewUrl)
      })
    } else {
      setPhase('feedback')
    }
  }

  async function sendFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (String(data.get('website') ?? '')) {
      // honeypot: pretend it worked, write nothing
      setPhase('thanks')
      return
    }
    setPhase('sending')
    setFailed(false)
    const r = await record(stars, {
      comment: String(data.get('comment') ?? '').trim() || undefined,
      name: String(data.get('name') ?? '').trim() || undefined,
      contact: String(data.get('contact') ?? '').trim() || undefined,
    })
    if (r?.ok) {
      setPhase('thanks')
    } else {
      setFailed(true)
      setPhase('feedback')
    }
  }

  if (phase === 'google') {
    return (
      <div className="rp-card" role="status">
        <span className="rp-tick"><GoogleG /></span>
        <p className="rp-biz">{name}</p>
        <p className="rp-ask"><T ge="გმადლობთ! გადაგიყვანთ Google-ზე…" en="Thank you! Taking you to Google…" /></p>
        <a className="btn btn-ink rp-google" href={googleReviewUrl} rel="noopener">
          <GoogleG />
          <T ge="თუ არ გადახვედი — დააჭირე აქ" en="If nothing happens, tap here" />
        </a>
      </div>
    )
  }

  if (phase === 'thanks') {
    return (
      <div className="rp-card" role="status">
        <span className="rp-tick rp-tick-ok"><Check /></span>
        <p className="rp-biz"><T ge="მადლობა!" en="Thank you!" /></p>
        <p className="rp-ask">
          <T
            ge="შენს გამოხმაურებას მფლობელი პირადად ნახავს."
            en="The owner will read your feedback personally."
          />
        </p>
      </div>
    )
  }

  const feedback = phase === 'feedback' || phase === 'sending'

  return (
    <div className="rp-card">
      <p className="rp-biz">{name}</p>
      <p className="rp-ask">
        {feedback
          ? <T ge="გვითხარი, რა შეგვეშალა" en="Tell us what went wrong" />
          : <T ge="როგორი იყო შენი გამოცდილება?" en="How was your experience?" />}
      </p>

      <div className="rp-stars" role="radiogroup" aria-label="შეფასება / rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} ★`}
            className={`rp-star${n <= stars ? ' on' : ''}`}
            onClick={() => pick(n)}
          >
            <Star />
          </button>
        ))}
      </div>
      {!feedback && (
        <p className="rp-hint"><T ge="შეეხე ვარსკვლავებს" en="Tap a star to rate" /></p>
      )}

      {feedback && (
        <form className="rp-form" onSubmit={sendFeedback}>
          <p className="rp-private">
            <T
              ge="ეს გამოხმაურება პირდაპირ მფლობელთან მიდის."
              en="This feedback goes straight to the owner."
            />
          </p>
          <label>
            <span><T ge="კომენტარი" en="Comment" /></span>
            <textarea
              name="comment"
              rows={4}
              maxLength={2000}
              required
              placeholder="რა შეიძლება გავაუმჯობესოთ?"
              data-ph-ge="რა შეიძლება გავაუმჯობესოთ?"
              data-ph-en="What could we do better?"
            />
          </label>
          <label>
            <span><T ge="სახელი (არასავალდებულო)" en="Name (optional)" /></span>
            <input type="text" name="name" maxLength={120} autoComplete="name"
              placeholder="გიორგი" data-ph-ge="გიორგი" data-ph-en="Giorgi" />
          </label>
          <label>
            <span><T ge="ტელეფონი ან ელფოსტა (არასავალდებულო)" en="Phone or email (optional)" /></span>
            <input type="text" name="contact" maxLength={120} inputMode="tel"
              placeholder="+995 5__ __ __ __" />
          </label>

          {/* honeypot */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />

          {failed && (
            <p className="reg-note" role="status">
              <T ge="ვერ გაიგზავნა. სცადე თავიდან." en="Couldn't send. Please try again." />
            </p>
          )}

          <button type="submit" className="btn btn-ink" disabled={phase === 'sending'}>
            {phase === 'sending'
              ? <T ge="იგზავნება…" en="Sending…" />
              : <T ge="გაგზავნა" en="Send" />}
          </button>
        </form>
      )}
    </div>
  )
}
