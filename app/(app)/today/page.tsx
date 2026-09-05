import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getToday } from '@/lib/tz'
import { getFoodDay } from '@/lib/data/food'
import { dayStartUTC, getActiveWorkout, getBurn } from '@/lib/data/workouts'
import { getPointsSummary } from '@/lib/data/points'
import { getFeaturedChallenge } from '@/lib/data/compete'
import { CATEGORY_LABEL, featuredTemplate } from '@/lib/workouts'
import { addDays, greeting, n, timeAgo, timeLeft } from '@/lib/format'
import { startWorkout } from '@/app/(app)/train/actions'
import { Avatar, Bar, Card, Kicker, Pill, Rings, SectionHead } from '@/components/ui'
import { Camera, ChevronRight, Dumbbell, Flame, Plus, Swords, Trophy } from '@/components/icons'

export const metadata: Metadata = { title: 'Today' }

export default async function TodayPage() {
  const profile = await getProfile()
  const { tz, today, hour } = await getToday()
  const start = dayStartUTC(today, tz)
  const end = dayStartUTC(addDays(today, 1), tz)

  const [food, burn, active, points, featured] = await Promise.all([
    getFoodDay(today),
    getBurn(start, end),
    getActiveWorkout(),
    getPointsSummary(),
    getFeaturedChallenge(),
  ])

  const goal = profile.daily_kcal_goal
  const eaten = food.totals.kcal
  const left = goal - eaten + burn.kcal
  const burnTarget = Math.max(300, Math.round(goal * 0.25))
  const template = featuredTemplate(today)
  const firstName = profile.display_name.split(' ')[0]

  return (
    <div className="stack-lg stack">
      <header className="topbar rise">
        <div>
          <p className="muted small">{greeting(hour)},</p>
          <h1 className="h1">{firstName}</h1>
        </div>
        <div className="row">
          {points.streak > 0 ? (
            <Pill tone="gold">
              <Flame /> {points.streak} day streak
            </Pill>
          ) : null}
          <Link href="/me" aria-label="Profile">
            <Avatar name={profile.display_name} url={profile.avatar_url} size={42} />
          </Link>
        </div>
      </header>

      <Card glow="gold" className="rise delay-1">
        <div className="row between" style={{ marginBottom: 8 }}>
          <Kicker>Today</Kicker>
          <Link href="/food" className="small gold strong">
            Diary
          </Link>
        </div>
        <div className="row" style={{ gap: 18, alignItems: 'center' }}>
          <Rings
            size={172}
            stroke={15}
            gap={5}
            rings={[
              { pct: eaten / goal, color: 'var(--gold)', label: 'Eaten' },
              { pct: burn.kcal / burnTarget, color: 'var(--mint)', label: 'Burned' },
              { pct: food.totals.protein / profile.protein_goal_g, color: 'var(--ice)', label: 'Protein' },
            ]}
          >
            <span className="hero-num" style={{ fontSize: 40 }}>{n(Math.abs(left))}</span>
            <span className="tiny muted">{left >= 0 ? 'kcal left' : 'kcal over'}</span>
          </Rings>
          <ul className="stack stack-sm grow" style={{ gap: 12 }}>
            <li>
              <p className="tiny muted">
                <i className="legend-dot" style={{ background: 'var(--gold)' }} /> Eaten
              </p>
              <p className="h3">{n(eaten)} <span className="tiny dim">/ {n(goal)}</span></p>
            </li>
            <li>
              <p className="tiny muted">
                <i className="legend-dot" style={{ background: 'var(--mint)' }} /> Burned
              </p>
              <p className="h3">{n(burn.kcal)} <span className="tiny dim">kcal</span></p>
            </li>
            <li>
              <p className="tiny muted">
                <i className="legend-dot" style={{ background: 'var(--ice)' }} /> Protein
              </p>
              <p className="h3">{n(food.totals.protein)}<span className="tiny dim">g / {profile.protein_goal_g}</span></p>
            </li>
          </ul>
        </div>
      </Card>

      <div className="grid-3 rise delay-2">
        <Link href="/food/scan" className="item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 14 }}>
          <span className="ico ico-mint"><Camera /></span>
          <span className="small strong">Scan meal</span>
        </Link>
        <Link href="/food/add" className="item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 14 }}>
          <span className="ico ico-ice"><Plus /></span>
          <span className="small strong">Add food</span>
        </Link>
        <Link href={active ? `/train/active/${active.id}` : '/train'} className="item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 14 }}>
          <span className="ico ico-gold"><Dumbbell /></span>
          <span className="small strong">{active ? 'Resume' : 'Train'}</span>
        </Link>
      </div>

      <section className="section rise delay-2">
        <SectionHead title={active ? 'Workout in progress' : "Today's workout"} href="/train" action="Library" />
        {active ? (
          <Link href={`/train/active/${active.id}`} className="card card--outline-gold row" style={{ display: 'flex' }}>
            <span className="ico ico-lg ico-gold pulse"><Dumbbell /></span>
            <span className="grow">
              <span className="h3" style={{ display: 'block' }}>{active.title}</span>
              <span className="small muted">Started {timeAgo(active.started_at)} · tap to continue</span>
            </span>
            <ChevronRight className="chev" />
          </Link>
        ) : (
          <div className="card row" style={{ display: 'flex' }}>
            <span className="ico ico-lg" style={{ background: 'linear-gradient(135deg,#2b2b36,#15151c)' }}><Dumbbell /></span>
            <span className="grow">
              <span className="h3" style={{ display: 'block' }}>{template.title}</span>
              <span className="small muted">{CATEGORY_LABEL[template.category]} · {template.minutes} min · {template.exercises.length} exercises</span>
            </span>
            <form action={startWorkout}>
              <input type="hidden" name="slug" value={template.slug} />
              <button type="submit" className="btn btn-gold btn-sm btn-pill">Start</button>
            </form>
          </div>
        )}
      </section>

      <section className="section rise delay-3">
        <SectionHead title="Compete" href="/compete" action="Leaderboard" />
        {featured ? (
          <Link href={`/compete/${featured.challenge.id}`} className="card stack" style={{ display: 'flex' }}>
            <div className="row between">
              <Kicker>{featured.challenge.status === 'pending' ? 'Challenge invite' : 'Head to head'}</Kicker>
              <Pill tone={featured.challenge.status === 'pending' ? 'ice' : 'gold'}>{featured.challenge.status === 'pending' ? 'Respond' : timeLeft(featured.challenge.ends_at)}</Pill>
            </div>
            <div className="row between">
              <div className="row">
                <Avatar name={profile.display_name} url={profile.avatar_url} size={44} ring="gold" />
                <div>
                  <p className="small muted">You</p>
                  <p className="h2 tnum">{n(featured.me.score)}</p>
                </div>
              </div>
              <span className="kicker">vs</span>
              <div className="row" style={{ textAlign: 'right' }}>
                <div>
                  <p className="small muted">{featured.opponent.display_name}</p>
                  <p className="h2 tnum">{n(featured.opponent.score)}</p>
                </div>
                <Avatar name={featured.opponent.display_name} url={featured.opponent.avatar_url} size={44} ring="ice" />
              </div>
            </div>
            <div className="split" aria-hidden>
              <i style={{ flex: Math.max(featured.me.score, 1), background: 'var(--gold)' }} />
              <i style={{ flex: Math.max(featured.opponent.score, 1), background: 'var(--ice)' }} />
            </div>
          </Link>
        ) : (
          <Link href="/compete/new" className="item item--gold" style={{ display: 'flex' }}>
            <span className="ico ico-gold"><Swords /></span>
            <span className="grow">
              <span className="strong" style={{ display: 'block' }}>Challenge a friend</span>
              <span className="small muted">Weekly duel. Loser buys the shake.</span>
            </span>
            <ChevronRight className="chev" />
          </Link>
        )}

        <Link href="/compete" className="item" style={{ display: 'flex' }}>
          <span className="ico ico-gold"><Trophy /></span>
          <span className="grow">
            <span className="strong" style={{ display: 'block' }}>
              {points.weekly.rank ? `#${points.weekly.rank} this week` : 'Not ranked yet this week'}
            </span>
            <span className="small muted">
              {points.weekly.rank
                ? `${n(points.weekly.points)} pts${points.weekly.gap_to_top5 ? ` · ${n(points.weekly.gap_to_top5)} to top 5` : ' · top 5'}`
                : 'Finish a workout to enter the leaderboard'}
            </span>
          </span>
          <ChevronRight className="chev" />
        </Link>
        <div style={{ padding: '0 4px' }}>
          <Bar pct={points.weekly.rank ? 1 - Math.min(0.95, (points.weekly.gap_to_top5 ?? 0) / Math.max(points.weekly.points ?? 1, 1)) : 0} />
        </div>
      </section>
    </div>
  )
}
