'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { addItems } from '../actions'
import type { Meal } from '@/lib/types'
import type { ScanResult, ScannedItem } from '@/lib/scan'
import { n } from '@/lib/format'
import { Barcode, Camera, Check, Minus, Plus, Spinner } from '@/components/icons'

type Mode = 'photo' | 'barcode'
type Item = ScannedItem & { qty: number }

type BarcodeResult = {
  name: string
  brand: string | null
  serving: { label: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number } | null
  per100: { kcal: number; protein_g: number; carbs_g: number; fat_g: number } | null
}

const MEALS: { key: Meal; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
]

/** Downscale to keep uploads small and fast; returns base64 JPEG without the data: prefix. */
async function toJpegBase64(file: File, maxSide = 1280): Promise<{ data: string; preview: string }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not read that image'))
      el.src = url
    })
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const preview = canvas.toDataURL('image/jpeg', 0.85)
    return { data: preview.split(',')[1] ?? '', preview }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function Scanner({ date, meal: initialMeal, initialMode, scanEnabled }: { date: string; meal: Meal; initialMode: Mode; scanEnabled: boolean }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [meal, setMeal] = useState<Meal>(initialMeal)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Item[] | null>(null)
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  // barcode mode
  const [code, setCode] = useState('')
  const [camera, setCamera] = useState(false)
  const [detectorAvailable, setDetectorAvailable] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setDetectorAvailable(typeof window !== 'undefined' && 'BarcodeDetector' in window)
  }, [])

  useEffect(() => {
    if (!camera) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    async function run() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        // BarcodeDetector is not in the TS DOM lib yet.
        const Detector = (window as unknown as { BarcodeDetector: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
        const tick = async () => {
          if (cancelled || !videoRef.current) return
          try {
            const found = await detector.detect(videoRef.current)
            const value = found[0]?.rawValue
            if (value) {
              setCode(value)
              setCamera(false)
              void lookupBarcode(value)
              return
            }
          } catch {
            /* keep scanning */
          }
          timer = setTimeout(tick, 300)
        }
        void tick()
      } catch {
        setError('Camera access was refused. Type the barcode instead.')
        setCamera(false)
      }
    }
    void run()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera])

  async function onFile(file: File | undefined) {
    if (!file) return
    setError(null)
    setItems(null)
    try {
      const { data, preview } = await toJpegBase64(file)
      setPreview(preview)
      setImageData(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read that image')
    }
  }

  async function analyze() {
    if (!imageData) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: imageData, mediaType: 'image/jpeg' }),
      })
      const body = (await res.json().catch(() => ({}))) as Partial<ScanResult> & { error?: string }
      if (!res.ok) {
        setError(body.error ?? 'Scan failed. Try a clearer photo.')
        return
      }
      const list = (body.items ?? []).map((i) => ({ ...i, qty: 1 }))
      if (!list.length) {
        setError('No food found in that photo. Try again with the plate in frame.')
        return
      }
      setItems(list)
      setNotes(body.notes ?? '')
    } catch {
      setError('Network problem. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function lookupBarcode(value?: string) {
    const clean = (value ?? code).replace(/\D/g, '')
    if (clean.length < 8) return
    setBusy(true)
    setError(null)
    setItems(null)
    try {
      const res = await fetch(`/api/barcode?code=${clean}`)
      if (res.status === 404) {
        setError('That barcode is not in Open Food Facts yet. Add it by hand instead.')
        return
      }
      if (!res.ok) {
        setError('Lookup failed. Try again.')
        return
      }
      const data = (await res.json()) as BarcodeResult
      const base = data.serving ?? data.per100
      if (!base) {
        setError('That product has no nutrition data. Add it by hand instead.')
        return
      }
      setItems([
        {
          name: `${data.brand ? `${data.brand} ` : ''}${data.name}`.trim().slice(0, 80),
          portion: data.serving ? data.serving.label : '100 g',
          kcal: Math.round(base.kcal),
          protein_g: base.protein_g,
          carbs_g: base.carbs_g,
          fat_g: base.fat_g,
          confidence: 1,
          qty: 1,
        },
      ])
      setNotes('')
    } catch {
      setError('Network problem. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function updateQty(i: number, delta: number) {
    setItems((list) => (list ? list.map((it, idx) => (idx === i ? { ...it, qty: Math.max(0, +(it.qty + delta).toFixed(2)) } : it)) : list))
  }

  function save() {
    if (!items) return
    startTransition(async () => {
      const result = await addItems({ date, meal, source: mode === 'photo' ? 'scan' : 'barcode', items })
      if (result?.error) setError(result.error)
    })
  }

  const total = items?.reduce((a, i) => a + i.kcal * i.qty, 0) ?? 0

  return (
    <div className="stack stack-lg">
      <div className="seg" role="tablist" aria-label="Scan mode">
        <button type="button" role="tab" aria-selected={mode === 'photo'} className={mode === 'photo' ? 'is-on' : ''} onClick={() => { setMode('photo'); setItems(null); setError(null) }}>
          <Camera width={16} height={16} style={{ marginRight: 6 }} /> Scan meal
        </button>
        <button type="button" role="tab" aria-selected={mode === 'barcode'} className={mode === 'barcode' ? 'is-on' : ''} onClick={() => { setMode('barcode'); setItems(null); setError(null) }}>
          <Barcode width={16} height={16} style={{ marginRight: 6 }} /> Barcode
        </button>
      </div>

      {mode === 'photo' ? (
        <>
          <div className="scan-frame rise">
            {preview ? <img src={preview} alt="Your meal" /> : null}
            <span className="scan-corner tl" /><span className="scan-corner tr" /><span className="scan-corner bl" /><span className="scan-corner br" />
            {busy ? <span className="scan-sweep" /> : null}
            {!preview ? (
              <div className="center stack" style={{ alignItems: 'center', gap: 10, position: 'relative' }}>
                <span className="ico ico-lg ico-mint"><Camera /></span>
                <p className="strong">Point at the plate</p>
                <p className="small muted" style={{ maxWidth: 240 }}>One photo. Podium estimates every item, calories and macros.</p>
              </div>
            ) : null}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          {!scanEnabled ? (
            <p className="hint center">Photo scanning needs an Anthropic API key on the server. Barcodes and manual entry still work.</p>
          ) : null}
          <div className="row" style={{ justifyContent: 'center', gap: 18 }}>
            <button type="button" className="btn btn-glass btn-pill" onClick={() => fileRef.current?.click()}>
              {preview ? 'Retake' : 'Choose photo'}
            </button>
            <button type="button" className="shutter" aria-label="Take photo" onClick={() => fileRef.current?.click()}>
              <Camera width={26} height={26} />
            </button>
            <button type="button" className="btn btn-mint btn-pill" onClick={analyze} disabled={!imageData || busy || !scanEnabled}>
              {busy ? <Spinner /> : null} Analyze
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="scan-frame rise">
            {camera ? <video ref={videoRef} muted playsInline /> : null}
            <span className="scan-corner tl" /><span className="scan-corner tr" /><span className="scan-corner bl" /><span className="scan-corner br" />
            {camera ? <span className="scan-sweep" /> : null}
            {!camera ? (
              <div className="center stack" style={{ alignItems: 'center', gap: 10, position: 'relative' }}>
                <span className="ico ico-lg ico-ice"><Barcode /></span>
                <p className="strong">Scan a package</p>
                <p className="small muted" style={{ maxWidth: 240 }}>
                  {detectorAvailable ? 'Use the camera or type the digits under the barcode.' : 'Type the digits printed under the barcode.'}
                </p>
              </div>
            ) : null}
          </div>
          <div className="row">
            <input className="input tnum grow" inputMode="numeric" placeholder="Barcode digits" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && lookupBarcode()} />
            <button type="button" className="btn btn-glass" onClick={() => lookupBarcode()} disabled={busy || code.replace(/\D/g, '').length < 8}>
              {busy ? <Spinner /> : 'Look up'}
            </button>
          </div>
          {detectorAvailable ? (
            <button type="button" className="btn btn-glass btn-block" onClick={() => setCamera((c) => !c)}>
              <Camera /> {camera ? 'Stop camera' : 'Scan with camera'}
            </button>
          ) : null}
        </>
      )}

      {error ? <p className="error center">{error}</p> : null}

      {items ? (
        <section className="sheet stack" role="dialog" aria-label="Detected food">
          <div className="sheet-grip" />
          <div className="row between">
            <p className="kicker">Detected</p>
            <div className="seg seg--gold" style={{ padding: 3 }}>
              {MEALS.map((m) => (
                <button key={m.key} type="button" className={meal === m.key ? 'is-on' : ''} style={{ height: 30, fontSize: 12, padding: '0 8px' }} onClick={() => setMeal(m.key)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="stack stack-sm">
            {items.map((it, i) => (
              <li key={`${it.name}-${i}`} className="row between" style={{ padding: '8px 0', opacity: it.qty === 0 ? 0.4 : 1 }}>
                <span className="grow">
                  <span className="strong" style={{ display: 'block' }}>{it.name}</span>
                  <span className="tiny dim">{it.portion}{it.confidence < 0.6 ? ' · low confidence' : ''} · P {n(it.protein_g)} C {n(it.carbs_g)} F {n(it.fat_g)}</span>
                </span>
                <span className="strong tnum" style={{ minWidth: 60, textAlign: 'right' }}>{n(it.kcal * it.qty)}</span>
                <span className="qty">
                  <button type="button" aria-label="Less" onClick={() => updateQty(i, -0.5)}><Minus /></button>
                  <b className="tnum">×{it.qty}</b>
                  <button type="button" aria-label="More" onClick={() => updateQty(i, 0.5)}><Plus /></button>
                </span>
              </li>
            ))}
          </ul>
          {notes ? <p className="hint">{notes}</p> : null}
          <div className="row between">
            <span className="h2 tnum">{n(total)} <span className="small muted">kcal</span></span>
            <button type="button" className="btn btn-gold" onClick={save} disabled={pending || total <= 0}>
              {pending ? <Spinner /> : <Check />} Add to {MEALS.find((m) => m.key === meal)?.label.toLowerCase()}
            </button>
          </div>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setItems(null)}>Scan again</button>
        </section>
      ) : null}
    </div>
  )
}
