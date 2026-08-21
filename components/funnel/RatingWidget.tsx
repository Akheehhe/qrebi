'use client'

import { useEffect, useRef, useState } from 'react'
import { supabaseBrowser, type SubmitReviewResult } from '@/lib/supabase'
import { T } from '@/components/shared'
import { Check, GoogleG, Star } from '@/components/icons'

type Props = {
  slug: string
  name: string
  minPublicStars: number
  googleReviewUrl: string
}

type Phase = 'pick' | 'feedback' | 'sending' | 'thanks' | 'google' | 'gone'
type Extra = { comment?: string; name?: string; contact?: string }
type Outcome = { res: SubmitReviewResult | null; gone: boolean }

/** The funnel itself. The first tap on a star writes the rating immediately —
 *  an abandoned feedback form still counts — and everything after (a changed
 *  pick, the comment) amends that same row through add_feedback(). At or
 *  above the business's threshold the customer is carried straight on to the
 *  public Google review form; below it only the owner ever sees the visit. */
export default function RatingWidget({ slug, name, minPublicStars, googleReviewUrl }: Props) {
  const [phase, setPhase] = useState<Phase>('pick')
  const [stars, setStars] = useState(0)
  const [failed, setFailed] = useState(false)
  const [returning, setReturning] = useState(false)
  const reviewId = useRef<string | null>(null)
  const goneRef = useRef(false)
  // all writes go through one chain, so a quick second tap can never race the
  // first into a duplicate insert
  const chain = useRef<Promise<unknown>>(Promise.resolve())

  const ratedKey = `qrebi-rated-${slug}`

  // same phone, same page, within hours: they already rated — don't count twice
  useEffect(() => {
    try {
      const t = Number(localStorage.getItem(ratedKey) ?? 0)
      if (t && Date.now() - t < 6 * 3600e3) {
        setReturning(true)
        setPhase('thanks')
      }
    } catch {
      /* storage unavailable — the visit just isn't deduped */
    }
  }, [ratedKey])

  // LangToggle rewrites placeholders only on inputs present at toggle time;
  // this form mounts later, so sync it on mount when the page is in English.
  useEffect(() => {
    if (phase !== 'feedback') return
    if (!document.body.classList.contains('lang-en')) return
    document
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.rp-form [data-ph-en]')
      .forEach((el) => { el.placeholder = el.dataset.phEn ?? el.placeholder })
  }, [phase])

  function markRated() {
    try {
      localStorage.setItem(ratedKey, String(Date.now()))
    } catch {}
  }

  async function doRecord(n: number, extra?: Extra): Promise<Outcome> {
    if (goneRef.current) return { res: null, gone: true }
    try {
      const sb = supabaseBrowser()
      if (reviewId.current) {
        const { data, error } = await sb.rpc('add_feedback', {
          p_review_id: reviewId.current,
          p_stars: n,
          p_comment: extra?.comment ?? null,
          p_name: extra?.name ?? null,
          p_contact: extra?.contact ?? null,
        })
        if (error) throw error
        return { res: data as SubmitReviewResult, gone: false }
      }
      const { data, error } = await sb.rpc('submit_review', {
        p_slug: slug,
        p_stars: n,
        p_comment: extra?.comment ?? null,
        p_name: extra?.name ?? null,
        p_contact: extra?.contact ?? null,
      })
      if (error) throw error
      const res = data as SubmitReviewResult
      reviewId.current = res.review_id ?? null
      markRated()
      return { res, gone: false }
    } catch (e) {
      // 'not-available' is the server refusing for good (unknown slug, lapsed
      // subscription, flood guard) — retrying can never succeed
      const gone = e instanceof Error && e.message.includes('not-available')
      if (gone) goneRef.current = true
      return { res: null, gone }
    }
  }

  function enqueue(n: number, extra?: Extra): Promise<Outcome> {
    const p = chain.current.then(() => doRecord(n, extra))
    chain.current = p.catch(() => {})
    return p
  }

  function pick(n: number) {
    if (phase === 'sending' || phase === 'thanks' || phase === 'google' || phase === 'gone') return
    setStars(n)
    setFailed(false)
    if (n >= minPublicStars) {
      setPhase('google')
      // keepalive on the client's fetch lets the write finish even after the
      // navigation; the timer only bounds how long the customer waits here
      const timer = new Promise<null>((res) => setTimeout(() => res(null), 2500))
      Promise.race([enqueue(n), timer]).then((r) => {
        window.location.assign(r?.res?.google_review_url || googleReviewUrl)
      })
    } else {
      // the tap itself is the rating — record it now, ask for words after
      void enqueue(n)
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
    const { res, gone } = await enqueue(stars, {
      comment: String(data.get('comment') ?? '').trim() || undefined,
      name: String(data.get('name') ?? '').trim() || undefined,
      contact: String(data.get('contact') ?? '').trim() || undefined,
    })
    if (res?.ok) {
      setPhase('thanks')
    } else if (gone) {
      setPhase('gone')
    } else {
      setFailed(true)
      setPhase('feedback')
    }
  }

  if (phase === 'gone') {
    return (
      <div className="rp-card" role="status">
        <p className="rp-biz">{name}</p>
        <p className="rp-ask">
          <T ge="ეს გვერდი დროებით არ იღებს შეფასებებს." en="This page isn't taking ratings right now." />
        </p>
        <a className="btn btn-ink rp-google" href={googleReviewUrl} rel="noopener">
          <GoogleG />
          <T ge="დაწერე შეფასება Google-ზე" en="Leave a review on Google" />
        </a>
      </div>
    )
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
          {returning
            ? <T
                ge="ამ ტელეფონიდან შეფასება უკვე გაგზავნილია."
                en="A rating has already been sent from this phone."
              />
            : <T
                ge="შენს გამოხმაურებას მფლობელი პირადად ნახავს."
                en="The owner will read your feedback personally."
              />}
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
            <input type="text" name="contact" maxLength={120}
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
