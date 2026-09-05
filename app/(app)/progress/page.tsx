import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getToday } from '@/lib/tz'
import { getProgress, type Range } from '@/lib/data/progress'
import { dayOfMonth, monthShort, n, n1, weekdayShort } from '@/lib/format'
import { Card, Kicker, Stat } from '@/components/ui'
import { ChevronLeft, Medal } from '@/components/icons'
import { BarsChart, LineChart } from '@/components/charts'
import WeightForm from './WeightForm'

export const metadata: Metadata = { title: 'Progress' }

const RANGES: { key: Range; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const range = RANGES.find((r) => r.key === sp.r)?.key ?? 'month'
  const { tz, today } = await getToday()
  const [profile, p] = await Promise.all([getProfile(), getProgress(tz, today, range)])
  const latestWeight = p.weights.length ? p.weights[p.weights.length - 1].kg : profile.weight_kg

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/today" className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h1 grow">Progress</h1>
      </header>

      <nav className="seg seg--gold rise" aria-label="Range">
        {RANGES.map((r) => (
          <Link key={r.key} href={`/progress?r=${r.key}`} className={range === r.key ? 'is-on' : ''} aria-current={range === r.key ? 'page' : undefined}>
            {r.label}
          </Link>
        ))}
      </nav>

      <div className="grid-3 rise delay-1">
        <Stat label="workouts" value={n(p.totals.workouts)} tone="gold" />
        <Stat label="kcal burned" value={n(p.totals.kcal)} tone="mint" />
        <Stat label="minutes" value={n(p.totals.minutes)} />
      </div>

      <Card glow="ice" className="rise delay-1">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <Kicker>Weight</Kicker>
            <p className="display" style={{ marginTop: 4 }}>{latestWeight != null ? n1(latestWeight) : '—'} <span className="h3 muted">kg</span></p>
          </div>
          {p.weightDelta != null ? (
            <span className={`pill ${p.weightDelta <= 0 ? 'pill-mint' : 'pill-ice'}`}>{p.weightDelta > 0 ? '+' : '−'}{n1(Math.abs(p.weightDelta))} kg</span>
          ) : null}
        </div>
        {p.weights.length >= 2 ? (
          <LineChart
            points={p.weights.map((w) => ({ label: `${dayOfMonth(w.date)} ${monthShort(w.date)}`, value: w.kg }))}
            color="var(--ice)"
            unit=" kg"
            caption={`Body weight over the last ${range}`}
          />
        ) : (
          <p className="small muted" style={{ margin: '10px 0' }}>Log your weight a couple of times to see the trend line.</p>
        )}
        <WeightForm defaultKg={latestWeight ?? 75} date={today} />
      </Card>

      <Card className="rise delay-2">
        <div className="row between">
          <Kicker>Calories · 14 days</Kicker>
          <span className="small muted">Avg eaten <b className="tnum">{n(p.avgEaten)}</b></span>
        </div>
        <BarsChart
          groups={p.last14.map((d) => ({ label: weekdayShort(d.date).slice(0, 1), values: [d.burned, d.eaten] }))}
          colors={['var(--mint)', 'rgba(255,255,255,0.22)']}
          seriesNames={['Burned', 'Eaten']}
          caption="Calories burned and eaten per day, last 14 days"
          labelEvery={2}
        />
        <div className="legend">
          <span><i style={{ background: 'var(--mint)' }} />Burned</span>
          <span><i style={{ background: 'rgba(255,255,255,0.22)' }} />Eaten</span>
        </div>
      </Card>

      <Card className="rise delay-2">
        <div className="row between">
          <Kicker>Workouts · 8 weeks</Kicker>
          <span className="small muted">This week</span>
        </div>
        <div className="row between" style={{ margin: '10px 0 4px' }}>
          <p className="h2">{n(p.perWeek[p.perWeek.length - 1]?.count ?? 0)} <span className="small muted">this week</span></p>
          <div className="dots" aria-label="Days trained this week">
            {p.weekDays.map((d) => <span key={d.date} className={`dot ${d.trained ? 'is-on' : ''}`} title={d.date} />)}
          </div>
        </div>
        <BarsChart
          groups={p.perWeek.map((w) => ({ label: `${dayOfMonth(w.start)}/${w.start.slice(5, 7)}`, values: [w.count] }))}
          colors={['var(--gold)']}
          seriesNames={['Workouts']}
          caption="Workouts per week, last 8 weeks"
          height={120}
        />
      </Card>

      <Card className="rise delay-3">
        <Kicker>Personal records</Kicker>
        {p.prs.length ? (
          <ul className="stack stack-sm" style={{ marginTop: 10 }}>
            {p.prs.map((pr, i) => (
              <li key={pr.exercise} className="row between" style={{ padding: '6px 0' }}>
                <span className="row row-sm">
                  <Medal className={i === 0 ? 'gold' : 'dim'} width={18} height={18} />
                  <span className="strong">{pr.exercise}</span>
                </span>
                <span className="tnum"><b>{n1(pr.weight)} kg</b> <span className="small muted">× {pr.reps}</span></span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small muted" style={{ marginTop: 8 }}>Log weighted sets in a session and your heaviest lifts land here.</p>
        )}
      </Card>
    </div>
  )
}
