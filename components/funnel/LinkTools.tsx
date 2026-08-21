'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { T } from '@/components/shared'
import { Check } from '@/components/icons'

type NfcState = 'idle' | 'waiting' | 'ok' | 'fail'

/** One card link with everything needed to put it on plastic: copy, a
 *  print-ready QR, and — on Android Chrome — writing it straight to an NFC
 *  tag held against the phone (Web NFC; nothing else supports it yet). */
export default function LinkTools({ url, filename }: { url: string; filename: string }) {
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [nfc, setNfc] = useState<NfcState>('idle')
  const [nfcAvail, setNfcAvail] = useState(false)

  useEffect(() => {
    setNfcAvail('NDEFReader' in window)
  }, [])

  useEffect(() => {
    let dead = false
    QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: '#0A071C', light: '#ffffff' } })
      .then((u) => { if (!dead) setQr(u) })
      .catch(() => { if (!dead) setQr(null) })
    return () => { dead = true }
  }, [url])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked — the printed URL is still selectable */
    }
  }

  async function writeNfc() {
    setNfc('waiting')
    try {
      const ndef = new NDEFReader()
      // resolves once a tag is actually held to the phone and written
      await ndef.write({ records: [{ recordType: 'url', data: url }] })
      setNfc('ok')
      setTimeout(() => setNfc('idle'), 2500)
    } catch {
      setNfc('fail')
      setTimeout(() => setNfc('idle'), 3000)
    }
  }

  return (
    <div className="ltl">
      <p className="ltl-url">{url}</p>
      <div className="ltl-btns">
        <button type="button" className="btn btn-ink" onClick={copy}>
          {copied ? <><Check /><T ge="დაკოპირდა" en="Copied" /></> : <T ge="კოპირება" en="Copy" />}
        </button>
        {qr && <a className="btn" href={qr} download={filename}>QR</a>}
        {nfcAvail && (
          <button type="button" className="btn btn-soft" onClick={writeNfc} disabled={nfc === 'waiting'}>
            {nfc === 'idle' && <T ge="ჩაწერე NFC-ზე" en="Write to NFC" />}
            {nfc === 'waiting' && <T ge="მიადე ბარათი ტელეფონს…" en="Hold the card to the phone…" />}
            {nfc === 'ok' && <><Check /><T ge="ჩაიწერა!" en="Written!" /></>}
            {nfc === 'fail' && <T ge="ვერ ჩაიწერა — სცადე ისევ" en="Failed — try again" />}
          </button>
        )}
      </div>
    </div>
  )
}
