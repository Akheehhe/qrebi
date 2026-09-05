import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getActiveWorkout, getRecentWorkouts } from '@/lib/data/workouts'
import { CATEGORIES, CATEGORY_LABEL, TEMPLATES, estimateKcal } from '@/lib/workouts'
import { minutes, n, timeAgo } from '@/lib/format'
import type { WorkoutCategory } from '@/lib/types'
import { Card, Kicker, SectionHead } from '@/components/ui'
import { Bolt, ChevronRight, Dumbbell, Flame, Plus, Run, Timer, Wave } from '@/components/icons'
import { startWorkout } from './actions'

export const metadata: Metadata = { title: 'Train' }

const ICON: Record<WorkoutCategory, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  strength: Dumbbell,
  hiit: Bolt,
  run: Run,
  mobility: Wave,
  other: Timer,
}

export default async function TrainPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { c } = await searchParams
  const category = CATEGORIES.find((x) => x === c) ?? null
  const [active, recent, profile] = await Promise.all([getActiveWorkout(), getRecentWorkouts(5), getProfile()])
  const list = TEMPLATES.filter((t) => !category || t.category === category)
  const [featured, ...rest] = list
  const FeaturedIcon = ICON[featured.category]

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <h1 className="h1">Train</h1>
        <Link href="/train/log" className="btn btn-glass btn-sm btn-pill">
          <Plus /> Log past
        </Link>
      </header>

      {active ? (
        <Link href={`/train/active/${active.id}`} className="card card--outline-gold row rise" style={{ display: 'flex' }}>
          <span className="ico ico-lg ico-gold pulse"><Flame /></span>
          <span className="grow">
            <span className="kicker gold" style={{ display: 'block', marginBottom: 2 }}>In progress</span>
            <span className="h3" style={{ display: 'block' }}>{active.title}</span>
            <span className="small muted">Started {timeAgo(active.started_at)} · tap to continue</span>
          </span>
          <ChevronRight className="chev" />
        </Link>
      ) : null}

      <nav className="chips rise delay-1" aria-label="Workout type">
        <Link href="/train" className={`chip ${!category ? 'is-on' : ''}`}>All</Link>
        {CATEGORIES.map((cat) => (
          <Link key={cat} href={`/train?c=${cat}`} className={`chip ${category === cat ? 'is-on' : ''}`}>
            {CATEGORY_LABEL[cat]}
          </Link>
        ))}
      </nav>

      <Card glow="gold" className="rise delay-1">
        <div className="row between" style={{ marginBottom: 14 }}>
          <Kicker>Featured</Kicker>
          <span className="pill pill-mint"><Flame /> ~{n(estimateKcal(featured.category, profile.weight_kg, featured.minutes * 60))} kcal</span>
        </div>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <span className="ico ico-lg" style={{ background: 'linear-gradient(135deg,#2b2b36,#15151c)' }}><FeaturedIcon /></span>
          <div className="grow">
            <h2 className="h2">{featured.title}</h2>
            <p className="small muted">{featured.exercises.length} exercises · {featured.minutes} min · {featured.blurb}</p>
          </div>
        </div>
        <ul className="row wrap" style={{ gap: 6, margin: '14px 0 16px' }}>
          {featured.exercises.slice(0, 4).map((e) => (
            <li key={e.name} className="pill">{e.name}</li>
          ))}
          {featured.exercises.length > 4 ? <li className="pill">+{featured.exercises.length - 4}</li> : null}
        </ul>
        <form action={startWorkout}>
          <input type="hidden" name="slug" value={featured.slug} />
          <button className="btn btn-gold btn-block" type="submit">Start workout</button>
        </form>
      </Card>

      <section className="section rise delay-2">
        <SectionHead title="Plans" />
        <div className="list">
          {rest.map((t) => {
            const Icon = ICON[t.category]
            return (
              <form key={t.slug} action={startWorkout} className="item">
                <input type="hidden" name="slug" value={t.slug} />
                <span className="ico"><Icon /></span>
                <span className="grow">
                  <span className="strong" style={{ display: 'block' }}>{t.title}</span>
                  <span className="small muted">{CATEGORY_LABEL[t.category]} · {t.minutes} min · <span className="mint">~{n(estimateKcal(t.category, profile.weight_kg, t.minutes * 60))} kcal</span></span>
                </span>
                <button className="btn btn-glass btn-sm btn-pill" type="submit">Start</button>
              </form>
            )
          })}
          <form action={startWorkout}>
            <input type="hidden" name="slug" value="custom" />
            <button className="btn btn-glass btn-block" type="submit">
              <Plus /> Start empty workout
            </button>
          </form>
        </div>
      </section>

      {recent.length ? (
        <section className="section rise delay-3">
          <SectionHead title="Recent" href="/progress" action="Progress" />
          <div className="list">
            {recent.map((w) => {
              const Icon = ICON[w.category]
              return (
                <Link key={w.id} href={`/train/done/${w.id}`} className="item">
                  <span className="ico ico-mint"><Icon /></span>
                  <span className="grow">
                    <span className="strong ellipsis" style={{ display: 'block' }}>{w.title}</span>
                    <span className="small muted">{minutes(w.duration_sec)} · {n(w.kcal_burned)} kcal · {timeAgo(w.ended_at ?? w.started_at)}</span>
                  </span>
                  <ChevronRight className="chev" />
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
