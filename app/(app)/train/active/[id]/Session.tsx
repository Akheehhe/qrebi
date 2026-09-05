'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { discardWorkout, finishWorkout, logSet, type SetInput } from '../../actions'
import type { Workout, WorkoutSet } from '@/lib/types'
import { estimateKcal, type ExercisePlan } from '@/lib/workouts'
import { clock, n } from '@/lib/format'
import { Check, ChevronLeft, ChevronRight, Close, Flame, Minus, Plus, Timer } from '@/components/icons'

type Plan = ExercisePlan & { timed: boolean }
type LocalSet = Pick<WorkoutSet, 'exercise' | 'set_index' | 'weight_kg' | 'reps' | 'duration_sec'>

export default function Session({
  workout,
  sets: initialSets,
  plan: initialPlan,
  weightKg,
}: {
  workout: Workout
  sets: WorkoutSet[]
  plan: ExercisePlan[]
  weightKg: number | null
}) {
  const [plan, setPlan] = useState<Plan[]>(() => initialPlan.map((p) => ({ ...p, timed: Boolean(p.seconds) })))
  const [sets, setSets] = useState<LocalSet[]>(() => initialSets.map((s) => ({ exercise: s.exercise, set_index: s.set_index, weight_kg: s.weight_kg, reps: s.reps, duration_sec: s.duration_sec })))
  const doneFor = (name: string) => sets.filter((s) => s.exercise === name).length

  const [idx, setIdx] = useState(() => {
    const first = initialPlan.findIndex((p) => initialSets.filter((s) => s.exercise === p.name).length < p.sets)
    return first === -1 ? Math.max(0, initialPlan.length - 1) : first
  })
  const ex = plan[idx] as Plan | undefined

  const [kg, setKg] = useState(0)
  const [reps, setReps] = useState(10)
  const [secs, setSecs] = useState(40)

  // Preload the steppers from the last set of this exercise, else from the plan.
  useEffect(() => {
    if (!ex) return
    const last = [...sets].reverse().find((s) => s.exercise === ex.name)
    setKg(last?.weight_kg ?? ex.weightKg ?? 0)
    setReps(last?.reps ?? ex.reps ?? 10)
    setSecs(last?.duration_sec ?? ex.seconds ?? 40)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, plan.length])

  const startedAt = useMemo(() => Date.parse(workout.started_at), [workout.started_at])
  const [elapsed, setElapsed] = useState(() => Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000))), 1000)
    return () => clearInterval(t)
  }, [startedAt])

  const [rest, setRest] = useState<number | null>(null)
  useEffect(() => {
    if (rest == null) return
    if (rest <= 0) {
      setRest(null)
      try {
        navigator.vibrate?.(200)
      } catch {
        /* no haptics */
      }
      return
    }
    const t = setTimeout(() => setRest((r) => (r == null ? null : r - 1)), 1000)
    return () => clearTimeout(t)
  }, [rest])

  const [pending, startTransition] = useTransition()
  const [toast, setToast] = useState<string | null>(null)
  const [adding, setAdding] = useState(plan.length === 0)
  const [newName, setNewName] = useState('')
  const [newTimed, setNewTimed] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const kcal = estimateKcal(workout.category, weightKg, elapsed)
  const allDone = plan.length > 0 && plan.every((p) => doneFor(p.name) >= p.sets)
  const setNumber = ex ? Math.min(ex.sets, doneFor(ex.name) + 1) : 0
  const exerciseDone = ex ? doneFor(ex.name) >= ex.sets : false

  function completeSet() {
    if (!ex) return
    const local: LocalSet = {
      exercise: ex.name,
      set_index: doneFor(ex.name) + 1,
      weight_kg: ex.timed ? null : kg,
      reps: ex.timed ? null : reps,
      duration_sec: ex.timed ? secs : null,
    }
    setSets((s) => [...s, local])
    setRest(ex.timed ? 20 : 90)
    const payload: SetInput = local
    logSet(workout.id, payload).then((r) => {
      if (!r.ok) setToast(r.error ?? 'Could not save that set')
    })
    if (local.set_index >= ex.sets) {
      const next = plan.findIndex((p, i) => i > idx && doneFor(p.name) < p.sets)
      if (next !== -1) setTimeout(() => setIdx(next), 350)
    }
  }

  function addExercise() {
    const name = newName.trim().slice(0, 80)
    if (!name) return
    setPlan((p) => [...p, { name, sets: 3, reps: newTimed ? undefined : 10, seconds: newTimed ? 40 : undefined, timed: newTimed }])
    setIdx(plan.length)
    setNewName('')
    setAdding(false)
  }

  function finish() {
    startTransition(async () => {
      try {
        await finishWorkout(workout.id, null)
      } catch (e) {
        setToast(e instanceof Error ? e.message : 'Could not finish')
      }
    })
  }

  return (
    <div className="stack stack-lg">
      <header className="topbar">
        <button type="button" className="back" aria-label="Discard workout" onClick={() => setConfirmDiscard(true)}>
          <Close />
        </button>
        <div className="center grow">
          <p className="kicker">{workout.title}</p>
        </div>
        <button type="button" className={`btn btn-sm btn-pill ${allDone ? 'btn-gold' : 'btn-glass'}`} onClick={finish} disabled={pending}>
          {pending ? 'Saving' : 'Finish'}
        </button>
      </header>

      <section className="card card--glow glow-mint center stack" style={{ alignItems: 'center', gap: 8 }}>
        <p className="timer tnum">{clock(elapsed)}</p>
        <div className="row" style={{ gap: 22, marginTop: 6 }}>
          <span className="row row-sm"><Flame className="mint" width={18} height={18} /> <b className="tnum">{n(kcal)}</b> <span className="tiny muted">kcal</span></span>
          <span className="row row-sm"><Check className="gold" width={18} height={18} /> <b className="tnum">{sets.length}</b> <span className="tiny muted">sets</span></span>
          {plan.length ? <span className="row row-sm"><Timer className="ice" width={18} height={18} /> <b className="tnum">{Math.min(idx + 1, plan.length)}/{plan.length}</b> <span className="tiny muted">moves</span></span> : null}
        </div>
      </section>

      {rest != null ? (
        <div className="card card--outline-gold row between" role="status">
          <span className="row">
            <span className="ico ico-gold"><Timer /></span>
            <span>
              <span className="strong" style={{ display: 'block' }}>Rest {clock(rest)}</span>
              <span className="small muted">Breathe. Next set is loading.</span>
            </span>
          </span>
          <button type="button" className="btn btn-glass btn-sm btn-pill" onClick={() => setRest(null)}>Skip</button>
        </div>
      ) : null}

      {ex ? (
        <section className="card stack" style={{ gap: 18 }}>
          <div className="row between">
            <button type="button" className="back" aria-label="Previous exercise" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} style={{ opacity: idx === 0 ? 0.35 : 1 }}>
              <ChevronLeft />
            </button>
            <div className="center grow">
              <h2 className="h2">{ex.name}</h2>
              <p className="small muted">{exerciseDone ? 'All sets done' : `Set ${setNumber} of ${ex.sets}`}</p>
            </div>
            <button type="button" className="back" aria-label="Next exercise" onClick={() => setIdx((i) => Math.min(plan.length - 1, i + 1))} disabled={idx >= plan.length - 1} style={{ opacity: idx >= plan.length - 1 ? 0.35 : 1 }}>
              <ChevronRight />
            </button>
          </div>

          {ex.timed ? (
            <div className="stepper">
              <button type="button" aria-label="Less time" onClick={() => setSecs((v) => Math.max(5, v - 5))}><Minus /></button>
              <div className="val"><b className="tnum">{secs}</b><span>seconds</span></div>
              <button type="button" aria-label="More time" onClick={() => setSecs((v) => Math.min(3600, v + 5))}><Plus /></button>
            </div>
          ) : (
            <div className="grid-2">
              <div className="stepper">
                <button type="button" aria-label="Less weight" onClick={() => setKg((v) => Math.max(0, +(v - 2.5).toFixed(1)))}><Minus /></button>
                <div className="val"><b className="tnum">{kg}</b><span>kg</span></div>
                <button type="button" aria-label="More weight" onClick={() => setKg((v) => Math.min(600, +(v + 2.5).toFixed(1)))}><Plus /></button>
              </div>
              <div className="stepper">
                <button type="button" aria-label="Fewer reps" onClick={() => setReps((v) => Math.max(1, v - 1))}><Minus /></button>
                <div className="val"><b className="tnum">{reps}</b><span>reps</span></div>
                <button type="button" aria-label="More reps" onClick={() => setReps((v) => Math.min(200, v + 1))}><Plus /></button>
              </div>
            </div>
          )}

          <div className="row between">
            <div className="dots" aria-label={`${doneFor(ex.name)} of ${ex.sets} sets`}>
              {Array.from({ length: ex.sets }, (_, i) => <span key={i} className={`dot ${i < doneFor(ex.name) ? 'is-on' : ''}`} />)}
            </div>
            {sets.filter((s) => s.exercise === ex.name).slice(-1).map((s) => (
              <span key={s.set_index} className="tiny muted">
                Last: {s.duration_sec != null ? `${s.duration_sec}s` : `${s.weight_kg ?? 0} kg × ${s.reps ?? 0}`}
              </span>
            ))}
          </div>

          <button type="button" className="btn btn-gold btn-block btn-lg" onClick={completeSet}>
            <Check /> {exerciseDone ? 'Log extra set' : 'Complete set'}
          </button>
          {plan[idx + 1] ? <p className="tiny dim center">Next: {plan[idx + 1].name}</p> : null}
        </section>
      ) : (
        <section className="card center stack" style={{ alignItems: 'center' }}>
          <p className="h3">Add your first exercise</p>
          <p className="small muted">Name it, then log sets as you go. Calories come from the clock.</p>
        </section>
      )}

      {adding ? (
        <section className="card stack">
          <input className="input" placeholder="Exercise name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={80} autoFocus />
          <div className="seg">
            <button type="button" className={!newTimed ? 'is-on' : ''} onClick={() => setNewTimed(false)}>Reps</button>
            <button type="button" className={newTimed ? 'is-on' : ''} onClick={() => setNewTimed(true)}>Timed</button>
          </div>
          <div className="grid-2">
            <button type="button" className="btn btn-glass" onClick={() => setAdding(false)}>Cancel</button>
            <button type="button" className="btn btn-gold" onClick={addExercise} disabled={!newName.trim()}>Add</button>
          </div>
        </section>
      ) : (
        <button type="button" className="btn btn-glass btn-block" onClick={() => setAdding(true)}>
          <Plus /> Add exercise
        </button>
      )}

      {allDone ? (
        <button type="button" className="btn btn-mint btn-block btn-lg" onClick={finish} disabled={pending}>
          {pending ? 'Saving' : 'Finish workout'}
        </button>
      ) : null}

      {confirmDiscard ? (
        <>
          <div className="scrim" onClick={() => setConfirmDiscard(false)} />
          <div className="sheet stack" role="dialog" aria-label="Discard workout">
            <div className="sheet-grip" />
            <p className="h2">Discard this workout?</p>
            <p className="muted small">Sets you logged will be removed and no points are awarded.</p>
            <div className="grid-2">
              <button type="button" className="btn btn-glass" onClick={() => setConfirmDiscard(false)}>Keep going</button>
              <button type="button" className="btn btn-coral" onClick={() => startTransition(() => discardWorkout(workout.id))}>Discard</button>
            </div>
            <Link href="/train" className="btn btn-ghost btn-block">Leave it running</Link>
          </div>
        </>
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}
