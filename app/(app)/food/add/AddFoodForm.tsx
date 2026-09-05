'use client'

import { useActionState, useMemo, useState } from 'react'
import { addFood, type FoodState } from '../actions'
import type { QuickFood } from '@/lib/foods'
import type { Meal } from '@/lib/types'
import { Barcode, Minus, Plus, Search, Spinner } from '@/components/icons'

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

export default function AddFoodForm({ date, meal: initialMeal, quick, initialQuery }: { date: string; meal: Meal; quick: QuickFood[]; initialQuery: string }) {
  const [state, action, pending] = useActionState<FoodState, FormData>(addFood, undefined)
  const [meal, setMeal] = useState<Meal>(initialMeal)
  const [q, setQ] = useState(initialQuery)
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [servings, setServings] = useState(1)
  const [source, setSource] = useState<'manual' | 'barcode'>('manual')
  const [code, setCode] = useState('')
  const [lookup, setLookup] = useState<'idle' | 'busy' | 'missing' | 'error'>('idle')

  const picks = useMemo(() => {
    const term = q.trim().toLowerCase()
    return quick.filter((f) => !term || f.name.toLowerCase().includes(term) || f.portion.toLowerCase().includes(term)).slice(0, 12)
  }, [q, quick])

  function pick(f: QuickFood) {
    setName(f.name)
    setKcal(String(f.kcal))
    setProtein(String(f.protein_g))
    setCarbs(String(f.carbs_g))
    setFat(String(f.fat_g))
    setSource('manual')
  }

  async function lookupBarcode() {
    const clean = code.replace(/\D/g, '')
    if (clean.length < 8) return
    setLookup('busy')
    try {
      const res = await fetch(`/api/barcode?code=${clean}`)
      if (res.status === 404) return setLookup('missing')
      if (!res.ok) return setLookup('error')
      const data = (await res.json()) as BarcodeResult
      const base = data.serving ?? data.per100
      setName(`${data.brand ? `${data.brand} ` : ''}${data.name}${data.serving ? ` (${data.serving.label})` : ' (100 g)'}`.slice(0, 120))
      if (base) {
        setKcal(String(Math.round(base.kcal)))
        setProtein(String(base.protein_g))
        setCarbs(String(base.carbs_g))
        setFat(String(base.fat_g))
      }
      setSource('barcode')
      setLookup('idle')
    } catch {
      setLookup('error')
    }
  }

  const total = Math.round((Number(kcal) || 0) * servings)

  return (
    <form action={action} className="stack rise delay-1">
      <div className="seg seg--gold" role="tablist" aria-label="Meal">
        {MEALS.map((m) => (
          <button key={m.key} type="button" role="tab" aria-selected={meal === m.key} className={meal === m.key ? 'is-on' : ''} onClick={() => setMeal(m.key)}>
            {m.label}
          </button>
        ))}
      </div>
      <input type="hidden" name="meal" value={meal} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="servings" value={servings} />

      <div className="input-wrap">
        <Search />
        <input className="input" placeholder="Search quick picks" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {picks.length ? (
        <div className="chips" role="list">
          {picks.map((f) => (
            <button key={f.name} type="button" className={`chip ${name === f.name ? 'is-on' : ''}`} onClick={() => pick(f)} role="listitem">
              {f.name} <span className="dim">· {f.kcal}</span>
            </button>
          ))}
        </div>
      ) : null}

      <section className="card stack">
        <div className="field">
          <label htmlFor="name">Food</label>
          <input id="name" className="input" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken and rice" maxLength={120} required />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="kcal">Calories (per serving)</label>
            <input id="kcal" className="input tnum" name="kcal" type="number" inputMode="numeric" min={0} max={5000} value={kcal} onChange={(e) => setKcal(e.target.value)} required />
          </div>
          <div className="field">
            <label>Servings</label>
            <div className="stepper" style={{ height: 52 }}>
              <button type="button" aria-label="Fewer servings" onClick={() => setServings((s) => Math.max(0.5, +(s - 0.5).toFixed(1)))} style={{ width: 44, height: 44 }}><Minus /></button>
              <div className="val" style={{ minWidth: 48 }}><b className="tnum" style={{ fontSize: 22 }}>{servings}</b></div>
              <button type="button" aria-label="More servings" onClick={() => setServings((s) => Math.min(10, +(s + 0.5).toFixed(1)))} style={{ width: 44, height: 44 }}><Plus /></button>
            </div>
          </div>
        </div>
        <div className="grid-3">
          <div className="field">
            <label htmlFor="protein">Protein g</label>
            <input id="protein" className="input tnum" name="protein_g" type="number" inputMode="decimal" min={0} step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="carbs">Carbs g</label>
            <input id="carbs" className="input tnum" name="carbs_g" type="number" inputMode="decimal" min={0} step="0.1" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="fat">Fat g</label>
            <input id="fat" className="input tnum" name="fat_g" type="number" inputMode="decimal" min={0} step="0.1" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="card card--tight stack" style={{ gap: 10 }}>
        <div className="row row-sm"><Barcode className="dim" width={18} height={18} /><span className="label">Have a barcode?</span></div>
        <div className="row">
          <input className="input tnum grow" inputMode="numeric" placeholder="Type the digits" value={code} onChange={(e) => setCode(e.target.value)} />
          <button type="button" className="btn btn-glass" onClick={lookupBarcode} disabled={lookup === 'busy' || code.replace(/\D/g, '').length < 8}>
            {lookup === 'busy' ? <Spinner /> : 'Look up'}
          </button>
        </div>
        {lookup === 'missing' ? <p className="hint">Not in Open Food Facts. Enter it by hand.</p> : null}
        {lookup === 'error' ? <p className="hint coral">Lookup failed. Try again.</p> : null}
      </section>

      {state?.error ? <p className="error">{state.error}</p> : null}
      <button className="btn btn-gold btn-block btn-lg" type="submit" disabled={pending || !name || !kcal}>
        {pending ? <Spinner /> : null} Add {total ? `${total} kcal` : ''} to {MEALS.find((m) => m.key === meal)?.label.toLowerCase()}
      </button>
    </form>
  )
}
