'use client'

import { useState } from 'react'

/** Flips <body class="lang-en"> and the two placeholder strings on the form. */
export default function LangToggle() {
  const [en, setEn] = useState(false)

  function toggle() {
    const next = !en
    setEn(next)
    document.body.classList.toggle('lang-en', next)
    document.documentElement.lang = next ? 'en' : 'ka'
    document.querySelectorAll<HTMLInputElement>('[data-ph-ge]').forEach((i) => {
      i.placeholder = (next ? i.dataset.phEn : i.dataset.phGe) ?? ''
    })
  }

  return (
    <button
      id="langToggle"
      type="button"
      onClick={toggle}
      aria-label="ქართული / English"
      aria-pressed={en}
    >
      <span className="seg seg-ge">ქარ</span>
      <span className="navrule" aria-hidden="true" />
      <span className="seg seg-en">ENG</span>
    </button>
  )
}
