'use client'

import { useActionState, useState } from 'react'
import { logWeight, type WeightState } from '../me/actions'
import { Minus, Plus, Spinner } from '@/components/icons'

export default function WeightForm({ defaultKg, date }: { defaultKg: number; date: string }) {
  const [state, action, pending] = useActionState<WeightState, FormData>(logWeight, undefined)
  const [kg, setKg] = useState(Math.round(defaultKg * 10) / 10)
  return (
    <form action={action} className="row between" style={{ marginTop: 12 }}>
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="kg" value={kg} />
      <div className="stepper grow">
        <button type="button" aria-label="Less" onClick={() => setKg((v) => Math.max(30, +(v - 0.1).toFixed(1)))} style={{ width: 40, height: 40 }}><Minus /></button>
        <div className="val" style={{ minWidth: 70 }}><b className="tnum" style={{ fontSize: 22 }}>{kg.toFixed(1)}</b></div>
        <button type="button" aria-label="More" onClick={() => setKg((v) => Math.min(300, +(v + 0.1).toFixed(1)))} style={{ width: 40, height: 40 }}><Plus /></button>
      </div>
      <button type="submit" className="btn btn-glass btn-sm btn-pill" disabled={pending}>
        {pending ? <Spinner /> : null} {state?.ok ? 'Saved' : 'Log weight'}
      </button>
    </form>
  )
}
