'use client'

import { useActionState, useState } from 'react'
import { quickLog, type QuickLogState } from '../actions'
import { CATEGORIES, CATEGORY_LABEL, TEMPLATES } from '@/lib/workouts'
import type { WorkoutCategory } from '@/lib/types'
import { Spinner } from '@/components/icons'

export default function QuickLogForm() {
  const [state, action, pending] = useActionState<QuickLogState, FormData>(quickLog, undefined)
  const [category, setCategory] = useState<WorkoutCategory>('strength')
  const [title, setTitle] = useState('Upper Body Push')
  const [when, setWhen] = useState<'now' | 'morning' | 'yesterday'>('now')

  return (
    <form action={action} className="stack rise delay-1">
      <div className="card stack">
        <label className="label" htmlFor="title">Session</label>
        <input id="title" className="input" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
        <div className="chips" style={{ marginInline: 0, paddingInline: 0 }}>
          {TEMPLATES.map((t) => (
            <button key={t.slug} type="button" className={`chip ${title === t.title ? 'is-on' : ''}`} onClick={() => { setTitle(t.title); setCategory(t.category) }}>
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack">
        <span className="label">Type</span>
        <div className="grid-2">
          {[...CATEGORIES, 'other' as const].map((c) => (
            <button key={c} type="button" className={`opt ${category === c ? 'is-on' : ''}`} onClick={() => setCategory(c)}>
              <strong>{CATEGORY_LABEL[c]}</strong>
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={category} />
      </div>

      <div className="card stack">
        <label className="label" htmlFor="minutes">Duration (minutes)</label>
        <input id="minutes" className="input" name="minutes" type="number" inputMode="numeric" min={1} max={360} defaultValue={45} required />
        <span className="label">When</span>
        <div className="seg">
          {(['now', 'morning', 'yesterday'] as const).map((w) => (
            <button key={w} type="button" className={when === w ? 'is-on' : ''} onClick={() => setWhen(w)}>
              {w === 'now' ? 'Just now' : w === 'morning' ? 'Earlier today' : 'Yesterday'}
            </button>
          ))}
        </div>
        <input type="hidden" name="when" value={when} />
      </div>

      {state?.error ? <p className="error">{state.error}</p> : null}
      <button className="btn btn-gold btn-block btn-lg" type="submit" disabled={pending}>
        {pending ? <Spinner /> : null} Save session
      </button>
    </form>
  )
}
