'use client'

import { useEffect, useState } from 'react'

/** Flips <body class="lang-en"> and the placeholder strings, and remembers
 *  the choice so it survives the hop between the landing, the rating pages,
 *  and the dashboard — each of which mounts its own toggle. */
export default function LangToggle() {
  const [en, setEn] = useState(false)

  function apply(next: boolean) {
    setEn(next)
    document.body.classList.toggle('lang-en', next)
    document.documentElement.lang = next ? 'en' : 'ka'
    document.querySelectorAll<HTMLInputElement>('[data-ph-ge]').forEach((i) => {
      i.placeholder = (next ? i.dataset.phEn : i.dataset.phGe) ?? ''
    })
    try {
      localStorage.setItem('qrebi-lang', next ? 'en' : 'ka')
    } catch {
      /* private mode — the choice just won't stick across loads */
    }
  }

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('qrebi-lang')
    } catch {}
    const want = saved ? saved === 'en' : document.body.classList.contains('lang-en')
    if (want) apply(true)
    // apply is stable within this component's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <button
      id="langToggle"
      type="button"
      onClick={() => apply(!en)}
      aria-label="ქართული / English"
      aria-pressed={en}
    >
      <span className="seg seg-ge">ქარ</span>
      <span className="navrule" aria-hidden="true" />
      <span className="seg seg-en">ENG</span>
    </button>
  )
}
