'use client'

import { useState } from 'react'

/* Same mechanism as the main site's LangToggle — flips `lang-en` on <body>
   and lets the .ge/.en rules in globals.css do the switching — restyled as
   a pill for a light page with no header to live in. */
export default function LangSwitch() {
  const [en, setEn] = useState(false)

  function toggle() {
    const next = !en
    setEn(next)
    document.body.classList.toggle('lang-en', next)
    document.documentElement.lang = next ? 'en' : 'ka'
  }

  return (
    <button
      type="button"
      className="cg-lang"
      onClick={toggle}
      aria-label="ქართული / English"
      aria-pressed={en}
    >
      <span className={en ? '' : 'on'}>ქარ</span>
      <span className={en ? 'on' : ''}>ENG</span>
    </button>
  )
}
