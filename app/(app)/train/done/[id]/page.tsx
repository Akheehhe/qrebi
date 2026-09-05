import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getWorkout, getWorkoutPoints } from '@/lib/data/workouts'
import { CATEGORY_LABEL } from '@/lib/workouts'
import { minutes, n } from '@/lib/format'
import { Card, Kicker, Stat } from '@/components/ui'
import { Check, Swords, Trophy } from '@/components/icons'

export const metadata: Metadata = { title: 'Workout complete' }

export default async function DonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ workout, sets }, points] = await Promise.all([getWorkout(id), getWorkoutPoints(id)])
  if (!workout) notFound()
  if (workout.status === 'active') redirect(`/train/active/${id}`)

  const byExercise = new Map<string, typeof sets>()
  for (const s of sets) byExercise.set(s.exercise, [...(byExercise.get(s.exercise) ?? []), s])
  const when = workout.ended_at ? new Date(workout.ended_at).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' }) : ''

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/train" className="small gold strong">Train</Link>
        <span className="kicker">{when}</span>
      </header>

      <Card tone="gold" className="rise center stack" style={{ alignItems: 'center', gap: 6 }}>
        <span className="ico ico-lg" style={{ background: 'rgba(26,18,4,0.12)', color: 'var(--on-gold)' }}><Check /></span>
        <Kicker>{workout.status === 'discarded' ? 'Discarded' : 'Workout complete'}</Kicker>
        <h1 className="h1">{workout.title}</h1>
        <p className="small" style={{ opacity: 0.75 }}>{CATEGORY_LABEL[workout.category]} · {minutes(workout.duration_sec)}</p>
        {points > 0 ? (
          <p className="display" style={{ marginTop: 10 }}>+{n(points)} <span style={{ fontSize: 18, fontWeight: 700 }}>pts</span></p>
        ) : (
          <p className="small" style={{ opacity: 0.75, marginTop: 8 }}>
            {workout.status === 'discarded' ? 'No points for discarded sessions.' : 'No points: sessions under 5 minutes or beyond 3 a day do not score.'}
          </p>
        )}
      </Card>

      <div className="grid-3 rise delay-1">
        <Stat label="kcal burned" value={n(workout.kcal_burned)} tone="mint" />
        <Stat label="minutes" value={n((workout.duration_sec ?? 0) / 60)} />
        <Stat label="sets" value={n(sets.length)} tone="gold" />
      </div>

      {byExercise.size ? (
        <section className="card stack rise delay-2">
          <Kicker>Sets</Kicker>
          <ul className="stack stack-sm">
            {Array.from(byExercise.entries()).map(([name, list]) => (
              <li key={name} className="row between" style={{ padding: '6px 0' }}>
                <span className="strong">{name}</span>
                <span className="small muted tnum">
                  {list.map((s) => (s.duration_sec != null ? `${s.duration_sec}s` : `${s.weight_kg ?? 0}×${s.reps ?? 0}`)).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {workout.notes ? <p className="muted small rise delay-2">“{workout.notes}”</p> : null}

      <div className="grid-2 rise delay-3">
        <Link href="/compete" className="btn btn-glass"><Trophy /> Leaderboard</Link>
        <Link href="/compete/new" className="btn btn-gold"><Swords /> Challenge</Link>
      </div>
      <Link href="/today" className="btn btn-ghost btn-block rise delay-3">Back to Today</Link>
    </div>
  )
}
