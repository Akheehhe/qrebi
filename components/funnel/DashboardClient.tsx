'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser, supabaseConfigured, type Business, type Review } from '@/lib/supabase'
import { fmtDate, isActive } from '@/lib/funnel'
import DashShell from '@/components/funnel/DashShell'
import { EMAIL, T, WHATSAPP, WhatsAppIcon } from '@/components/shared'
import { Arrow, Check, GoogleG, Star } from '@/components/icons'

type Load = 'loading' | 'ready' | 'error'

/** The business owner's cabinet: how the funnel is doing, the private
 *  feedback inbox, the card link, and where the subscription stands. */
export default function DashboardClient() {
  const router = useRouter()
  const [load, setLoad] = useState<Load>('loading')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoad('error')
      return
    }
    const sb = supabaseBrowser()
    let dead = false

    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (dead) return
      if (!session) {
        router.replace('/login')
        return
      }
      const { data: biz, error } = await sb
        .from('businesses').select('*').order('created_at', { ascending: true })
      if (dead) return
      if (error) {
        setLoad('error')
        return
      }
      const list = (biz ?? []) as Business[]
      setBusinesses(list)
      setSelected(list[0]?.id ?? null)
      if (list.length) {
        const { data: revs } = await sb
          .from('reviews')
          .select('*')
          .in('business_id', list.map((b) => b.id))
          .order('created_at', { ascending: false })
          .limit(500)
        if (dead) return
        setReviews((revs ?? []) as Review[])
      }
      setLoad('ready')
    })()

    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => {
      dead = true
      sub.subscription.unsubscribe()
    }
  }, [router])

  const biz = useMemo(
    () => businesses.find((b) => b.id === selected) ?? null,
    [businesses, selected],
  )
  const bizReviews = useMemo(
    () => reviews.filter((r) => r.business_id === biz?.id),
    [reviews, biz],
  )
  const stats = useMemo(() => {
    const total = bizReviews.length
    const toGoogle = bizReviews.filter((r) => r.sent_to_google).length
    const avg = total
      ? (bizReviews.reduce((s, r) => s + r.stars, 0) / total).toFixed(1)
      : '—'
    return { total, toGoogle, avg }
  }, [bizReviews])
  const feedback = useMemo(
    () => bizReviews.filter((r) => !r.sent_to_google),
    [bizReviews],
  )

  async function signOut() {
    await supabaseBrowser().auth.signOut()
    router.replace('/login')
  }

  function ratingLink(slug: string) {
    return `${window.location.origin}/r/${slug}`
  }

  async function copyLink(slug: string) {
    try {
      await navigator.clipboard.writeText(ratingLink(slug))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the visible link can still be selected by hand */
    }
  }

  if (load === 'loading') {
    return (
      <DashShell>
        <div className="dash-wait" aria-busy="true"><span className="rp-spin" /></div>
      </DashShell>
    )
  }

  if (load === 'error') {
    return (
      <DashShell onSignOut={signOut}>
        <div className="dash-card">
          <h2 className="dash-h"><T ge="ვერ ჩაიტვირთა" en="Couldn't load" /></h2>
          <p className="dash-p"><T ge="განაახლე გვერდი ან მოგვწერე." en="Refresh the page or write to us." /></p>
        </div>
      </DashShell>
    )
  }

  if (!biz) {
    return (
      <DashShell onSignOut={signOut}>
        <div className="dash-card">
          <h2 className="dash-h"><T ge="ბიზნესი ვერ მოიძებნა" en="No business found" /></h2>
          <p className="dash-p">
            <T
              ge="ამ ელფოსტაზე ჯერ არაფერია მიბმული. მოგვწერე და დაგიმატებთ."
              en="Nothing is linked to this email yet. Write to us and we'll set you up."
            />
          </p>
          <div className="dash-actions">
            <a className="btn btn-ink" href={WHATSAPP} target="_blank" rel="noopener">
              <WhatsAppIcon />WhatsApp
            </a>
            <a className="btn" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
      </DashShell>
    )
  }

  const active = isActive(biz.paid_until)

  return (
    <DashShell onSignOut={signOut}>
      {businesses.length > 1 && (
        <div className="dash-tabs" role="tablist">
          {businesses.map((b) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={b.id === biz.id}
              className={`dash-tab${b.id === biz.id ? ' on' : ''}`}
              onClick={() => setSelected(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      <div className="dash-top">
        <h1 className="dash-title">{biz.name}</h1>
        <span className={`dash-badge${active ? '' : ' off'}`}>
          {active
            ? <T ge={`აქტიურია ${fmtDate(biz.paid_until)}-მდე`} en={`Active until ${fmtDate(biz.paid_until)}`} />
            : <T ge="შეჩერებულია" en="Paused" />}
        </span>
      </div>

      {/* the numbers the funnel exists for */}
      <div className="dash-stats">
        <div className="dash-stat">
          <b>{stats.total}</b>
          <span><T ge="შეფასება სულ" en="Ratings total" /></span>
        </div>
        <div className="dash-stat">
          <b>{stats.avg}{stats.avg !== '—' && <Star />}</b>
          <span><T ge="საშუალო ქულა" en="Average score" /></span>
        </div>
        <div className="dash-stat dash-stat-g">
          <b>{stats.toGoogle}<GoogleG /></b>
          <span><T ge="გადავიდა Google-ზე" en="Sent to Google" /></span>
        </div>
      </div>

      <div className="dash-cols">
        <div className="dash-col">
          {/* the card's link */}
          <div className="dash-card">
            <h2 className="dash-h"><T ge="შენი ბარათის ბმული" en="Your card's link" /></h2>
            <p className="dash-link">{ratingLink(biz.slug)}</p>
            <div className="dash-actions">
              <button type="button" className="btn btn-ink" onClick={() => copyLink(biz.slug)}>
                {copied ? <><Check /><T ge="დაკოპირდა" en="Copied" /></> : <T ge="კოპირება" en="Copy" />}
              </button>
              <a className="btn" href={`/r/${biz.slug}`} target="_blank" rel="noopener">
                <T ge="ნახვა" en="Open" /><Arrow />
              </a>
            </div>
            <p className="dash-note">
              <T
                ge={`${biz.min_public_stars}★ და მეტი Google-ზე მიდის, დანარჩენი — მხოლოდ შენთან.`}
                en={`${biz.min_public_stars}★ and up goes to Google; the rest comes only to you.`}
              />
            </p>
          </div>

          {/* subscription */}
          <div className="dash-card">
            <h2 className="dash-h"><T ge="გამოწერა" en="Subscription" /></h2>
            <p className="dash-price">10 <i>₾</i><em><T ge="თვეში" en="per month" /></em></p>
            <p className="dash-p">
              {active
                ? <T ge={`გადახდილია ${fmtDate(biz.paid_until)}-მდე.`} en={`Paid until ${fmtDate(biz.paid_until)}.`} />
                : <T
                    ge={`ვადა ამოიწურა ${fmtDate(biz.paid_until)}-ს — ბარათი ახლა პირდაპირ Google-ზე უშვებს ყველას, ფილტრის გარეშე.`}
                    en={`Expired on ${fmtDate(biz.paid_until)} — the card now sends everyone straight to Google, unfiltered.`}
                  />}
            </p>
            <p className="dash-p">
              <T
                ge="გადასახდელად მოგვწერე — გააქტიურებას ჩვენ ვაკეთებთ."
                en="To pay, just message us — we handle the activation."
              />
            </p>
            <div className="dash-actions">
              <a className="btn btn-ink" href={WHATSAPP} target="_blank" rel="noopener">
                <WhatsAppIcon />WhatsApp
              </a>
              <a className="btn" href={`mailto:${EMAIL}`}><T ge="ელფოსტა" en="Email" /></a>
            </div>
          </div>
        </div>

        {/* the private inbox */}
        <div className="dash-col">
          <div className="dash-card">
            <h2 className="dash-h">
              <T ge="პირადი გამოხმაურებები" en="Private feedback" />
              <span className="dash-count">{feedback.length}</span>
            </h2>
            {feedback.length === 0 ? (
              <p className="dash-p">
                <T ge="ჯერ არაფერია — კარგი ნიშანია." en="Nothing yet — that's a good sign." />
              </p>
            ) : (
              <ul className="dash-feed">
                {feedback.map((r) => (
                  <li key={r.id}>
                    <div className="dash-feed-top">
                      <span className="dash-feed-stars" aria-label={`${r.stars} ★`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={i < r.stars ? 'on' : ''} />
                        ))}
                      </span>
                      <time dateTime={r.created_at}>{fmtDate(r.created_at.slice(0, 10))}</time>
                    </div>
                    {r.comment && <p className="dash-feed-txt">{r.comment}</p>}
                    {(r.author_name || r.author_contact) && (
                      <p className="dash-feed-who">
                        {[r.author_name, r.author_contact].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashShell>
  )
}
