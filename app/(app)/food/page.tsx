import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getToday } from '@/lib/tz'
import { getFoodDay, getFoodWeek } from '@/lib/data/food'
import { MEALS } from '@/lib/foods'
import { dayOfMonth, n, relativeDay, weekdayShort } from '@/lib/format'
import { Bar, Card, Kicker } from '@/components/ui'
import { Barcode, Camera, Close, Plus, Search } from '@/components/icons'
import { deleteFood } from './actions'

export const metadata: Metadata = { title: 'Food' }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function FoodPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { d } = await searchParams
  const { today } = await getToday()
  const date = typeof d === 'string' && DATE_RE.test(d) && d <= today ? d : today
  const [profile, day, week] = await Promise.all([getProfile(), getFoodDay(date), getFoodWeek(today)])

  const goal = profile.daily_kcal_goal
  const macros = [
    { label: 'Protein', value: day.totals.protein, goal: profile.protein_goal_g, tone: 'mint' as const },
    { label: 'Carbs', value: day.totals.carbs, goal: profile.carbs_goal_g, tone: 'ice' as const },
    { label: 'Fat', value: day.totals.fat, goal: profile.fat_goal_g, tone: undefined },
  ]

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <div>
          <h1 className="h1">Food</h1>
          <p className="muted small">{relativeDay(date, today)}</p>
        </div>
        <Link href={`/food/scan?d=${date}`} className="btn btn-mint btn-sm btn-pill"><Camera /> Scan</Link>
      </header>

      <nav className="week rise" aria-label="Pick a day">
        {week.map((w) => (
          <Link key={w.date} href={`/food?d=${w.date}`} className={`day ${w.date === date ? 'is-on' : ''} ${w.kcal > 0 ? 'has-log' : ''}`} aria-current={w.date === date ? 'date' : undefined}>
            {weekdayShort(w.date).slice(0, 2)}
            <b>{dayOfMonth(w.date)}</b>
            <i aria-hidden />
          </Link>
        ))}
      </nav>

      <Link href={`/food/add?d=${date}`} className="input-wrap rise delay-1" style={{ display: 'block' }}>
        <Search />
        <span className="input" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-3)' }}>Search food or scan a barcode</span>
      </Link>

      <Card glow="gold" className="rise delay-1">
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <div>
            <Kicker>Eaten</Kicker>
            <p className="display" style={{ marginTop: 4 }}>{n(day.totals.kcal)}</p>
            <p className="small muted">of {n(goal)} kcal</p>
          </div>
          <div className="stack stack-sm" style={{ minWidth: 150 }}>
            {macros.map((m) => (
              <div key={m.label}>
                <div className="row between tiny muted" style={{ marginBottom: 4 }}>
                  <span>{m.label}</span>
                  <span className="tnum">{n(m.value)}<span className="dim">/{m.goal}g</span></span>
                </div>
                <Bar pct={m.value / Math.max(m.goal, 1)} tone={m.tone} thin />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Bar pct={day.totals.kcal / goal} />
        </div>
      </Card>

      <div className="stack rise delay-2">
        {MEALS.map((meal) => {
          const logs = day.byMeal[meal.key]
          const kcal = logs.reduce((a, l) => a + l.kcal, 0)
          return (
            <section key={meal.key} className="card card--tight stack" style={{ gap: 6 }}>
              <div className="meal-head">
                <div className="row row-sm">
                  <span aria-hidden>{meal.emoji}</span>
                  <h2 className="h3">{meal.label}</h2>
                  {kcal ? <span className="small muted tnum">{n(kcal)} kcal</span> : null}
                </div>
                <Link href={`/food/add?d=${date}&meal=${meal.key}`} className="ico ico-gold" style={{ width: 34, height: 34, borderRadius: 11 }} aria-label={`Add to ${meal.label}`}>
                  <Plus />
                </Link>
              </div>
              {logs.length ? (
                <ul>
                  {logs.map((l) => (
                    <li key={l.id} className="food-row">
                      <span className="grow">
                        <span className="ellipsis" style={{ display: 'block' }}>{l.name}</span>
                        <span className="tiny dim tnum">P {n(l.protein_g)} · C {n(l.carbs_g)} · F {n(l.fat_g)}{l.source !== 'manual' ? ` · ${l.source}` : ''}</span>
                      </span>
                      <span className="strong tnum">{n(l.kcal)}</span>
                      <form action={deleteFood}>
                        <input type="hidden" name="id" value={l.id} />
                        <button type="submit" className="x" aria-label={`Remove ${l.name}`}><Close /></button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="tiny dim">Nothing logged yet.</p>
              )}
            </section>
          )
        })}
      </div>

      <div className="grid-2 rise delay-3">
        <Link href={`/food/scan?d=${date}`} className="btn btn-glass"><Camera /> Scan meal</Link>
        <Link href={`/food/scan?d=${date}&mode=barcode`} className="btn btn-glass"><Barcode /> Barcode</Link>
      </div>
    </div>
  )
}
