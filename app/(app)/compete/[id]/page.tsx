import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getChallengeDetail } from '@/lib/data/compete'
import { n, timeAgo, timeLeft, weekdayShort } from '@/lib/format'
import { Avatar, Card, Kicker, Pill } from '@/components/ui'
import { ChevronLeft, Dumbbell } from '@/components/icons'
import { BarsChart } from '@/components/charts'
import { postMessage, respondChallenge } from '../actions'

export const metadata: Metadata = { title: 'Challenge' }

const METRIC = {
  kcal_burned: { label: 'Calories burned', unit: 'kcal' },
  workouts: { label: 'Most workouts', unit: 'workouts' },
  points: { label: 'Most points', unit: 'pts' },
} as const

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [profile, detail] = await Promise.all([getProfile(), getChallengeDetail(id)])
  if (!detail) notFound()
  const { challenge: c, daily, messages, profiles, userId } = detail
  const meIsChallenger = c.challenger_id === userId
  const other = profiles.get(meIsChallenger ? c.opponent_id : c.challenger_id)
  const myScore = meIsChallenger ? c.challenger_score : c.opponent_score
  const theirScore = meIsChallenger ? c.opponent_score : c.challenger_score
  const metric = METRIC[c.metric]
  const lead = myScore - theirScore
  const isInvitee = c.status === 'pending' && c.opponent_id === userId

  const statusPill =
    c.status === 'pending' ? <Pill tone="ice">Pending</Pill>
    : c.status === 'active' ? <Pill tone="gold">{timeLeft(c.ends_at)}</Pill>
    : c.status === 'declined' ? <Pill>Declined</Pill>
    : c.winner_id === userId ? <Pill tone="solid-gold">You won</Pill>
    : c.winner_id ? <Pill tone="coral">{other?.display_name ?? 'They'} won</Pill>
    : <Pill>Draw</Pill>

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/compete" className="back" aria-label="Back"><ChevronLeft /></Link>
        <div className="grow">
          <h1 className="h3">{metric.label} · {c.duration_days === 30 ? '1 month' : `${c.duration_days / 7} week${c.duration_days > 7 ? 's' : ''}`}</h1>
        </div>
        {statusPill}
      </header>

      <Card glow={c.status === 'finished' && c.winner_id === userId ? 'gold' : 'ice'} className="rise delay-1">
        <div className="row between">
          <div className="stack stack-sm" style={{ alignItems: 'center', gap: 6 }}>
            <Avatar name={profile.display_name} url={profile.avatar_url} size={72} ring="gold" />
            <span className="small muted">You</span>
            <span className="display tnum" style={{ fontSize: 38 }}>{n(myScore)}</span>
          </div>
          <span className="kicker" style={{ fontSize: 16, color: 'var(--text-2)' }}>vs</span>
          <div className="stack stack-sm" style={{ alignItems: 'center', gap: 6 }}>
            <Avatar name={other?.display_name ?? 'Rival'} url={other?.avatar_url} size={72} ring="ice" />
            <span className="small muted">{other?.display_name ?? 'Rival'}</span>
            <span className="display tnum" style={{ fontSize: 38 }}>{n(theirScore)}</span>
          </div>
        </div>
        <div className="split" style={{ marginTop: 16 }} aria-hidden>
          <i style={{ flex: Math.max(myScore, 1), background: 'var(--gold)' }} />
          <i style={{ flex: Math.max(theirScore, 1), background: 'var(--ice)' }} />
        </div>
        <p className="small muted center" style={{ marginTop: 8 }}>
          {c.status === 'pending'
            ? 'Scores start when the challenge is accepted.'
            : lead > 0 ? `You lead by ${n(lead)} ${metric.unit}` : lead < 0 ? `${other?.display_name ?? 'They'} lead by ${n(-lead)} ${metric.unit}` : 'Dead even'}
        </p>
      </Card>

      {isInvitee ? (
        <div className="grid-2 rise delay-1">
          <form action={respondChallenge}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="accept" value="0" />
            <button type="submit" className="btn btn-glass btn-block">Decline</button>
          </form>
          <form action={respondChallenge}>
            <input type="hidden" name="id" value={c.id} />
            <input type="hidden" name="accept" value="1" />
            <button type="submit" className="btn btn-gold btn-block">Accept</button>
          </form>
        </div>
      ) : null}

      {daily.length ? (
        <Card className="rise delay-2">
          <Kicker>Day by day</Kicker>
          <BarsChart
            groups={daily.map((d) => ({ label: weekdayShort(d.day).slice(0, 1), values: meIsChallenger ? [d.challenger, d.opponent] : [d.opponent, d.challenger] }))}
            colors={['var(--gold)', 'var(--ice)']}
            seriesNames={['You', other?.display_name ?? 'Rival']}
            caption={`${metric.label} per day`}
            height={130}
          />
          <div className="legend">
            <span><i style={{ background: 'var(--gold)' }} />You</span>
            <span><i style={{ background: 'var(--ice)' }} />{other?.display_name ?? 'Rival'}</span>
          </div>
        </Card>
      ) : null}

      {c.stake ? (
        <div className="item rise delay-2">
          <span className="ico ico-gold" aria-hidden>🥤</span>
          <span className="grow">
            <span className="kicker" style={{ display: 'block' }}>Stake</span>
            <span className="strong">{c.stake}</span>
          </span>
        </div>
      ) : null}

      <section className="card stack rise delay-3">
        <Kicker>Trash talk</Kicker>
        {messages.length ? (
          <div className="stack stack-sm" style={{ gap: 8 }}>
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.user_id === userId ? 'me' : ''}`}>
                <span className="who">{m.user_id === userId ? 'You' : other?.display_name ?? 'Rival'} · {timeAgo(m.created_at)}</span>
                {m.body}
              </div>
            ))}
          </div>
        ) : (
          <p className="small muted">Nothing yet. Say something they will regret.</p>
        )}
        {c.status !== 'declined' ? (
          <form action={postMessage} className="row">
            <input type="hidden" name="id" value={c.id} />
            <input className="input grow" name="body" placeholder="Message" maxLength={280} required autoComplete="off" />
            <button type="submit" className="btn btn-glass">Send</button>
          </form>
        ) : null}
      </section>

      {c.status === 'active' ? (
        <Link href="/train" className="btn btn-gold btn-block btn-lg rise delay-3"><Dumbbell /> Log a workout</Link>
      ) : null}
    </div>
  )
}
