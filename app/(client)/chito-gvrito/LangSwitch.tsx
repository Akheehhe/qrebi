'use client'

import { useState } from 'react'

const LANGS = [
  { code: 'ka', label: 'ქარ', name: 'ქართული' },
  { code: 'en', label: 'ENG', name: 'English' },
  { code: 'ru', label: 'РУС', name: 'Русский' },
] as const

type Lang = (typeof LANGS)[number]['code']

/* Three-way version of the site's language mechanism: the buttons swap a
   class on <body> (none = ka, cg-en, cg-ru) and the .cg-t-* rules in
   chito.css show exactly one language. */
export default function LangSwitch() {
  const [lang, setLang] = useState<Lang>('ka')

  function pick(next: Lang) {
    if (next === lang) return
    setLang(next)
    document.body.classList.toggle('cg-en', next === 'en')
    document.body.classList.toggle('cg-ru', next === 'ru')
    document.documentElement.lang = next
  }

  return (
    <div className="cg-lang" role="group" aria-label="ენა · Language · Язык">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={lang === l.code ? 'on' : ''}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          onClick={() => pick(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
