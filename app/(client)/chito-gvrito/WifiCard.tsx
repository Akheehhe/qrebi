'use client'

import { useState } from 'react'
import { T } from '@/components/shared'

/* The third link on the card. A phone can't join a network from a plain
   web link, so the honest version of "connect" is the credentials laid
   out ready to copy, one tap each. */
export default function WifiCard({ ssid, password }: { ssid: string; password: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'ssid' | 'pass' | null>(null)

  async function copy(which: 'ssid' | 'pass', text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 1800)
    } catch {
      /* clipboard blocked — the value is selectable text, long-press still works */
    }
  }

  return (
    <div className={`cg-link cg-wifi${open ? ' open' : ''}`}>
      <button
        type="button"
        className="cg-wifi-head"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="cg-ico cg-ico-org"><WifiIcon /></span>
        <span className="cg-txt">
          <b>Wi-Fi</b>
          <small><T ge="დაუკავშირდი ინტერნეტს" en="Connect to the internet" /></small>
        </span>
        <ChevDown />
      </button>

      {open && (
        <div className="cg-wifi-body">
          <div className="cg-wifi-row">
            <span className="cg-wifi-lab"><T ge="ქსელი" en="Network" /></span>
            <code>{ssid}</code>
            <button type="button" onClick={() => copy('ssid', ssid)}>
              {copied === 'ssid'
                ? <T ge="დაკოპირდა ✓" en="Copied ✓" />
                : <T ge="კოპირება" en="Copy" />}
            </button>
          </div>
          <div className="cg-wifi-row">
            <span className="cg-wifi-lab"><T ge="პაროლი" en="Password" /></span>
            <code>{password}</code>
            <button type="button" onClick={() => copy('pass', password)}>
              {copied === 'pass'
                ? <T ge="დაკოპირდა ✓" en="Copied ✓" />
                : <T ge="კოპირება" en="Copy" />}
            </button>
          </div>
          <p className="cg-wifi-hint">
            <T
              ge="დააკოპირე პაროლი, გახსენი პარამეტრებში Wi-Fi და აირჩიე ქსელი."
              en="Copy the password, open Wi-Fi in Settings and pick the network."
            />
          </p>
        </div>
      )}
    </div>
  )
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round">
      <path d="M2.5 9a14.5 14.5 0 0 1 19 0" />
      <path d="M5.8 12.5a10 10 0 0 1 12.4 0" />
      <path d="M9 16a5.3 5.3 0 0 1 6 0" />
      <circle cx="12" cy="19.4" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ChevDown() {
  return (
    <svg className="cg-chev" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l7 7 7-7" />
    </svg>
  )
}
