'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import { supabaseBrowser, supabaseConfigured, type Business, type Review } from '@/lib/supabase'
import { fmtDate, fmtTimestampTbilisi, isActive, PLATFORM_LABEL, platformsOf } from '@/lib/funnel'
import DashShell from '@/components/funnel/DashShell'
import PlatformIcon from '@/components/funnel/PlatformIcon'
import { StarDistribution, TrendChart, type TrendDay } from '@/components/funnel/charts'
import { EMAIL, T, WHATSAPP, WhatsAppIcon } from '@/components/shared'
import { Arrow, Check, Star } from '@/components/icons'

type Load = 'loading' | 'ready' | 'error'
type Range = '30d' | 'all'

const tbilisiDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tbilisi' })

/** The business owner's cabinet: how the funnel is doing (tiles, star
 *  distribution, a 30-day trend), the private feedback inbox with a
 *  handled-tick, the card link with a printable QR, and the subscription. */
export default function DashboardClient() {
  const router = useRouter()
  const [load, setLoad] = useState<Load>('loading')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('30d')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [inboxErr, setInboxErr] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoad('error')
      return
    }
    // an expired or scanner-consumed magic link lands here with the failure
    // in the hash — send it to /login so the owner learns what happened
    // instead of silently bouncing
    if (/[#&](error|error_code|error_description)=/.test(window.location.hash)) {
      router.replace('/login#link-error')
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
        const { data: revs, error: revErr } = await sb
          .from('reviews')
          .select('*')
          .in('business_id', list.map((b) => b.id))
          .order('created_at', { ascending: false })
          .limit(500)
        if (dead) return
        // a failed inbox query must not masquerade as "no feedback yet"
        if (revErr) {
          setLoad('error')
          return
        }
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

  const rangeReviews = useMemo(() => {
    if (range === 'all') return bizReviews
    const cutoff = Date.now() - 30 * 86400e3
    return bizReviews.filter((r) => new Date(r.created_at).getTime() >= cutoff)
  }, [bizReviews, range])

  const stats = useMemo(() => {
    const total = rangeReviews.length
    const toGoogle = rangeReviews.filter((r) => r.sent_to_google).length
    const avg = total
      ? (rangeReviews.reduce((s, r) => s + r.stars, 0) / total).toFixed(1)
      : '—'
    return { total, toGoogle, avg }
  }, [rangeReviews])

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const r of rangeReviews) counts[r.stars - 1]++
    return counts
  }, [rangeReviews])

  const trendDays = useMemo<TrendDay[]>(() => {
    const byDay = new Map<string, { google: number; priv: number }>()
    for (const r of bizReviews) {
      const key = tbilisiDay.format(new Date(r.created_at))
      const d = byDay.get(key) ?? { google: 0, priv: 0 }
      if (r.sent_to_google) d.google++
      else d.priv++
      byDay.set(key, d)
    }
    const days: TrendDay[] = []
    for (let i = 29; i >= 0; i--) {
      const key = tbilisiDay.format(new Date(Date.now() - i * 86400e3))
      const [, m, d] = key.split('-')
      days.push({ key, label: `${d}.${m}`, ...(byDay.get(key) ?? { google: 0, priv: 0 }) })
    }
    return days
  }, [bizReviews])

  // the inbox: everything that stayed private, unhandled first
  const feedback = useMemo(
    () =>
      bizReviews
        .filter((r) => !r.sent_to_google)
        .slice()
        .sort((a, b) =>
          (a.handled_at ? 1 : 0) - (b.handled_at ? 1 : 0) ||
          b.created_at.localeCompare(a.created_at),
        ),
    [bizReviews],
  )
  const unhandled = feedback.filter((r) => !r.handled_at).length

  // printable QR of the card link, generated in the browser
  useEffect(() => {
    if (!biz) return
    let dead = false
    QRCode.toDataURL(`${window.location.origin}/r/${biz.slug}`, {
      width: 512,
      margin: 2,
      color: { dark: '#0A071C', light: '#ffffff' },
    })
      .then((url) => { if (!dead) setQr(url) })
      .catch(() => { if (!dead) setQr(null) })
    return () => { dead = true }
  }, [biz])

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
      setCopiedSlug(slug)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedSlug(null), 1800)
    } catch {
      /* clipboard blocked — the visible link can still be selected by hand */
    }
  }

  async function toggleHandled(r: Review) {
    const next = r.handled_at ? null : new Date().toISOString()
    setInboxErr(false)
    // optimistic: tick now, revert if the server refuses
    setReviews((rs) => rs.map((x) => (x.id === r.id ? { ...x, handled_at: next } : x)))
    const { error } = await supabaseBrowser().rpc('set_feedback_handled', {
      p_review_id: r.id,
      p_handled: !r.handled_at,
    })
    if (error) {
      setReviews((rs) => rs.map((x) => (x.id === r.id ? { ...x, handled_at: r.handled_at } : x)))
      setInboxErr(true)
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
  const plats = platformsOf(biz)
  // rows from before the platform column existed can only be Google's
  const platCount = (key: string) =>
    rangeReviews.filter((r) => r.sent_to_google && (r.platform ?? 'google') === key).length

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
        <div className="dash-range" role="group" aria-label="პერიოდი / period">
          <button type="button" className={`dash-chip${range === '30d' ? ' on' : ''}`}
            onClick={() => setRange('30d')}>
            <T ge="ბოლო 30 დღე" en="Last 30 days" />
          </button>
          <button type="button" className={`dash-chip${range === 'all' ? ' on' : ''}`}
            onClick={() => setRange('all')}>
            <T ge="სულ" en="All time" />
          </button>
        </div>
      </div>

      {/* the numbers the funnel exists for */}
      <div className="dash-stats">
        <div className="dash-stat">
          <b>{stats.total}</b>
          <span><T ge="შეფასება" en="Ratings" /></span>
        </div>
        <div className="dash-stat">
          <b>{stats.avg}{stats.avg !== '—' && <Star />}</b>
          <span><T ge="საშუალო ქულა" en="Average score" /></span>
        </div>
        <div className="dash-stat">
          <b>
            {stats.toGoogle}
            {plats.length === 1 && <PlatformIcon k={plats[0].key} />}
          </b>
          <span>
            {plats.length === 1
              ? <T ge={`გადავიდა ${PLATFORM_LABEL[plats[0].key]}-ზე`}
                  en={`Sent to ${PLATFORM_LABEL[plats[0].key]}`} />
              : <T ge="გავიდა პლატფორმებზე" en="Sent to platforms" />}
          </span>
        </div>
      </div>

      {/* how the month actually went */}
      <div className="dash-card dash-analytics">
        <div className="dash-ana-col">
          <h2 className="dash-h"><T ge="ვარსკვლავების განაწილება" en="Star distribution" /></h2>
          {stats.total === 0
            ? <p className="dash-p"><T ge="ამ პერიოდში შეფასებები არ არის." en="No ratings in this period." /></p>
            : <StarDistribution counts={distribution} />}
          {plats.length > 1 && (
            <div className="dash-plats">
              {plats.map((p) => (
                <span key={p.key}>
                  <PlatformIcon k={p.key} />
                  {PLATFORM_LABEL[p.key]}
                  <b>{platCount(p.key)}</b>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="dash-ana-col">
          <h2 className="dash-h"><T ge="ბოლო 30 დღე, დღეების მიხედვით" en="Last 30 days, day by day" /></h2>
          <TrendChart days={trendDays} />
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
                {copiedSlug === biz.slug
                  ? <><Check /><T ge="დაკოპირდა" en="Copied" /></>
                  : <T ge="კოპირება" en="Copy" />}
              </button>
              <a className="btn" href={`/r/${biz.slug}`} target="_blank" rel="noopener">
                <T ge="ნახვა" en="Open" /><Arrow />
              </a>
            </div>
            {qr && (
              <div className="dash-qr">
                {/* generated locally, never fetched */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt={`QR: ${ratingLink(biz.slug)}`} width={92} height={92} />
                <div>
                  <p className="dash-p">
                    <T
                      ge="იგივე ბმული QR-კოდად — მენიუზე, ჩეკზე, ვიტრინაზე."
                      en="The same link as a QR — for menus, receipts, the window."
                    />
                  </p>
                  <a className="btn dash-qr-btn" href={qr} download={`qrebi-${biz.slug}-qr.png`}>
                    <T ge="QR-ის ჩამოტვირთვა" en="Download QR" />
                  </a>
                </div>
              </div>
            )}
            <p className="dash-note">
              <T
                ge={`${biz.min_public_stars}★ და მეტი ქვეყნდება, დანარჩენი — მხოლოდ შენთან.`}
                en={`${biz.min_public_stars}★ and up goes public; the rest comes only to you.`}
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
              <span className="dash-count">{unhandled}</span>
            </h2>
            {inboxErr && (
              <p className="reg-note" role="status">
                <T ge="ვერ შეინახა — სცადე თავიდან." en="Couldn't save — try again." />
              </p>
            )}
            {feedback.length === 0 ? (
              <p className="dash-p">
                <T ge="ჯერ არაფერია — კარგი ნიშანია." en="Nothing yet — that's a good sign." />
              </p>
            ) : (
              <ul className="dash-feed">
                {feedback.map((r) => (
                  <li key={r.id} className={r.handled_at ? 'done' : undefined}>
                    <div className="dash-feed-top">
                      <span className="dash-feed-stars" aria-label={`${r.stars} ★`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={i < r.stars ? 'on' : ''} />
                        ))}
                      </span>
                      <time dateTime={r.created_at}>{fmtTimestampTbilisi(r.created_at)}</time>
                    </div>
                    {r.comment && <p className="dash-feed-txt">{r.comment}</p>}
                    {(r.author_name || r.author_contact) && (
                      <p className="dash-feed-who">
                        {[r.author_name, r.author_contact].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <button type="button" className="dash-feed-tick" onClick={() => toggleHandled(r)}>
                      <Check />
                      {r.handled_at
                        ? <T ge="მოგვარებულია — დაბრუნება" en="Handled — reopen" />
                        : <T ge="მოგვარებულად მონიშვნა" en="Mark as handled" />}
                    </button>
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
