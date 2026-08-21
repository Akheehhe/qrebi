'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser, supabaseConfigured, type Business } from '@/lib/supabase'
import { addMonthsClamped, fmtDate, isActive, slugify, tbilisiToday } from '@/lib/funnel'
import DashShell from '@/components/funnel/DashShell'
import { T } from '@/components/shared'
import { Arrow, Check } from '@/components/icons'

type Load = 'loading' | 'ready' | 'denied' | 'error'

type Draft = {
  name: string
  slug: string
  google_review_url: string
  owner_email: string
  paid_until: string
  min_public_stars: number
}

const emptyDraft = (): Draft => ({
  name: '',
  slug: '',
  google_review_url: '',
  owner_email: '',
  paid_until: addMonthsClamped(tbilisiToday(), 1),
  min_public_stars: 4,
})

/** The operator's side of the manual subscription: create a business when
 *  they pay the first month, extend paid_until on every payment after that. */
export default function AdminClient() {
  const router = useRouter()
  const [load, setLoad] = useState<Load>('loading')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [slugTouched, setSlugTouched] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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
      const { data: admin, error: adminErr } = await sb.rpc('is_admin')
      if (dead) return
      // a network blip is not a verdict: only a clean false is 'denied'
      if (adminErr) {
        setLoad('error')
        return
      }
      if (!admin) {
        setLoad('denied')
        return
      }
      await reload(true)
    })()
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace('/login')
    })
    return () => {
      dead = true
      sub.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  async function reload(first = false) {
    const { data, error } = await supabaseBrowser()
      .from('businesses').select('*').order('created_at', { ascending: false })
    if (error) {
      // after a mutation the write has already landed — keep the panel up
      // and say the list refresh failed, rather than tearing everything down
      if (first) setLoad('error')
      else setErr('სია ვერ განახლდა — განაახლე გვერდი. / List refresh failed — reload the page.')
      return
    }
    setBusinesses((data ?? []) as Business[])
    if (first) setLoad('ready')
  }

  async function signOut() {
    await supabaseBrowser().auth.signOut()
    router.replace('/login')
  }

  function friendly(message: string): string {
    if (message.includes('businesses_slug_key')) return 'ეს slug უკვე დაკავებულია. / That slug is taken.'
    if (message.includes('slug')) return 'slug: მხოლოდ a-z, 0-9 და დეფისი. / slug: only a-z, 0-9 and hyphens.'
    if (message.includes('google_review_url')) return 'Google-ის ბმული https://-ით უნდა იწყებოდეს. / The Google link must start with https://.'
    if (message.includes('owner_email')) return 'ელფოსტა პატარა ასოებით. / Email must be lowercase.'
    return message
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const { error } = await supabaseBrowser().from('businesses').insert({
      name: draft.name.trim(),
      slug: draft.slug.trim().toLowerCase(),
      google_review_url: draft.google_review_url.trim(),
      owner_email: draft.owner_email.trim().toLowerCase(),
      paid_until: draft.paid_until,
      min_public_stars: draft.min_public_stars,
    })
    setBusy(false)
    if (error) {
      setErr(friendly(error.message))
      return
    }
    setDraft(emptyDraft())
    setSlugTouched(false)
    await reload()
  }

  async function saveEdit(id: string) {
    if (!edit) return
    // printed NFC cards carry the old URL — renaming the slug kills them
    const before = businesses.find((b) => b.id === id)
    if (before && before.slug !== edit.slug.trim().toLowerCase() &&
        !window.confirm(
          `slug შეიცვლება: /r/${before.slug} → /r/${edit.slug}. უკვე ჩაწერილი NFC ბარათები ძველ ბმულზე გადავა და 404-ს მიიღებს. გავაგრძელო?\n` +
          `Slug change: /r/${before.slug} → /r/${edit.slug}. NFC cards already encoded with the old link will 404. Continue?`,
        )) return
    setBusy(true)
    setErr('')
    const { error } = await supabaseBrowser().from('businesses').update({
      name: edit.name.trim(),
      slug: edit.slug.trim().toLowerCase(),
      google_review_url: edit.google_review_url.trim(),
      owner_email: edit.owner_email.trim().toLowerCase(),
      paid_until: edit.paid_until,
      min_public_stars: edit.min_public_stars,
    }).eq('id', id)
    setBusy(false)
    if (error) {
      setErr(friendly(error.message))
      return
    }
    setEditingId(null)
    setEdit(null)
    await reload()
  }

  async function extend(b: Business) {
    setBusy(true)
    setErr('')
    const base = b.paid_until >= tbilisiToday() ? b.paid_until : tbilisiToday()
    const { error } = await supabaseBrowser()
      .from('businesses')
      .update({ paid_until: addMonthsClamped(base, 1) })
      .eq('id', b.id)
    setBusy(false)
    if (error) setErr(friendly(error.message))
    await reload()
  }

  async function pause(b: Business) {
    setBusy(true)
    setErr('')
    const [y, m, d] = tbilisiToday().split('-').map(Number)
    const yest = new Date(Date.UTC(y, m - 1, d - 1))
    const { error } = await supabaseBrowser()
      .from('businesses')
      .update({ paid_until: yest.toISOString().slice(0, 10) })
      .eq('id', b.id)
    setBusy(false)
    if (error) setErr(friendly(error.message))
    await reload()
  }

  async function remove(b: Business) {
    if (!window.confirm(`წავშალო "${b.name}"? ყველა შეფასებაც წაიშლება. / Delete "${b.name}" and all its reviews?`)) return
    setBusy(true)
    setErr('')
    const { error } = await supabaseBrowser().from('businesses').delete().eq('id', b.id)
    setBusy(false)
    if (error) setErr(friendly(error.message))
    await reload()
  }

  // per render on purpose: a tab left open across Tbilisi midnight should
  // not keep showing yesterday's active/paused states
  const today = tbilisiToday()

  if (load === 'loading') {
    return <DashShell><div className="dash-wait" aria-busy="true"><span className="rp-spin" /></div></DashShell>
  }

  if (load === 'denied') {
    return (
      <DashShell onSignOut={signOut}>
        <div className="dash-card">
          <h2 className="dash-h"><T ge="წვდომა არ გაქვს" en="Not authorized" /></h2>
          <p className="dash-p"><T ge="ეს გვერდი მხოლოდ QRebi-ს გუნდისთვისაა." en="This page is for the QRebi team only." /></p>
          <div className="dash-actions">
            <a className="btn btn-ink" href="/app"><T ge="ჩემი კაბინეტი" en="My dashboard" /><Arrow /></a>
          </div>
        </div>
      </DashShell>
    )
  }

  if (load === 'error') {
    return (
      <DashShell onSignOut={signOut}>
        <div className="dash-card">
          <h2 className="dash-h"><T ge="ვერ ჩაიტვირთა" en="Couldn't load" /></h2>
          <p className="dash-p"><T ge="განაახლე გვერდი." en="Refresh the page." /></p>
        </div>
      </DashShell>
    )
  }

  const fields = (d: Draft, set: (d: Draft) => void, isNew: boolean) => (
    <div className="adm-fields">
      <label>
        <span><T ge="სახელი" en="Name" /></span>
        <input type="text" required maxLength={120} value={d.name}
          onChange={(e) => {
            const name = e.target.value
            set({ ...d, name, slug: isNew && !slugTouched ? slugify(name) : d.slug })
          }} />
      </label>
      <label>
        <span>slug — qrebi.ge/r/…</span>
        <input type="text" required pattern="[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?" value={d.slug}
          onChange={(e) => {
            if (isNew) setSlugTouched(true)
            set({ ...d, slug: e.target.value })
          }} />
      </label>
      <label className="adm-wide">
        <span><T ge="Google შეფასების ბმული" en="Google review link" /></span>
        <input type="url" required placeholder="https://g.page/r/…/review" value={d.google_review_url}
          onChange={(e) => set({ ...d, google_review_url: e.target.value })} />
      </label>
      <label>
        <span><T ge="მფლობელის ელფოსტა" en="Owner's email" /></span>
        <input type="email" required value={d.owner_email}
          onChange={(e) => set({ ...d, owner_email: e.target.value })} />
      </label>
      <label>
        <span><T ge="მოქმედების ვადა" en="Paid until" /></span>
        <input type="date" required value={d.paid_until}
          onChange={(e) => set({ ...d, paid_until: e.target.value })} />
      </label>
      <label>
        <span><T ge="ზღვარი Google-სთვის" en="Google threshold" /></span>
        <select value={d.min_public_stars}
          onChange={(e) => set({ ...d, min_public_stars: Number(e.target.value) })}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★+</option>)}
        </select>
      </label>
    </div>
  )

  return (
    <DashShell onSignOut={signOut}>
      <div className="dash-top">
        <h1 className="dash-title"><T ge="ადმინი" en="Admin" /></h1>
        <span className="dash-badge">
          {businesses.length}{' '}
          <T ge="ბიზნესი" en={businesses.length === 1 ? 'business' : 'businesses'} />
        </span>
      </div>

      {err && <p className="reg-note adm-err" role="status">{err}</p>}

      <div className="dash-card">
        <h2 className="dash-h"><T ge="ახალი ბიზნესი" en="New business" /></h2>
        <form className="adm-form" onSubmit={create}>
          {fields(draft, setDraft, true)}
          <button type="submit" className="btn btn-ink" disabled={busy}>
            <T ge="დამატება" en="Add" />
          </button>
        </form>
      </div>

      <ul className="adm-list">
        {businesses.map((b) => {
          const active = isActive(b.paid_until)
          return (
            <li key={b.id} className="dash-card adm-row">
              <div className="adm-row-head">
                <div className="adm-id">
                  <b>{b.name}</b>
                  <a href={`/r/${b.slug}`} target="_blank" rel="noopener">/r/{b.slug}</a>
                  <span className="adm-mail">{b.owner_email}</span>
                </div>
                <div className="adm-sub">
                  <span className={`dash-badge${active ? '' : ' off'}`}>
                    {active
                      ? <T ge={`${fmtDate(b.paid_until)}-მდე`} en={`until ${fmtDate(b.paid_until)}`} />
                      : <T ge="შეჩერებულია" en="Paused" />}
                  </span>
                  <span className="adm-min">{b.min_public_stars}★+ → Google</span>
                </div>
              </div>

              <div className="adm-actions">
                <button type="button" className="btn btn-ink" disabled={busy} onClick={() => extend(b)}>
                  <Check /><T ge="+1 თვე" en="+1 month" />
                </button>
                {active && b.paid_until >= today && (
                  <button type="button" className="btn adm-quiet" disabled={busy} onClick={() => pause(b)}>
                    <T ge="შეჩერება" en="Pause" />
                  </button>
                )}
                <button
                  type="button"
                  className="btn adm-quiet"
                  disabled={busy}
                  onClick={() => {
                    if (editingId === b.id) {
                      setEditingId(null)
                      setEdit(null)
                    } else {
                      setEditingId(b.id)
                      setEdit({
                        name: b.name,
                        slug: b.slug,
                        google_review_url: b.google_review_url,
                        owner_email: b.owner_email,
                        paid_until: b.paid_until,
                        min_public_stars: b.min_public_stars,
                      })
                    }
                  }}
                >
                  {editingId === b.id ? <T ge="დახურვა" en="Close" /> : <T ge="რედაქტირება" en="Edit" />}
                </button>
                <button type="button" className="btn adm-danger" disabled={busy} onClick={() => remove(b)}>
                  <T ge="წაშლა" en="Delete" />
                </button>
              </div>

              {editingId === b.id && edit && (
                <form
                  className="adm-form adm-edit"
                  onSubmit={(e) => {
                    e.preventDefault()
                    saveEdit(b.id)
                  }}
                >
                  {fields(edit, setEdit, false)}
                  <button type="submit" className="btn btn-ink" disabled={busy}>
                    <T ge="შენახვა" en="Save" />
                  </button>
                </form>
              )}
            </li>
          )
        })}
      </ul>
    </DashShell>
  )
}
