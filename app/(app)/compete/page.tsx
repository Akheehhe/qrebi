import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getLeaderboard, getMyChallenges, getPrizes } from '@/lib/data/compete'
import { getPointsSummary } from '@/lib/data/points'
import { n, timeLeft } from '@/lib/format'
import type { Period } from '@/lib/types'
import { Avatar, Card, Pill, SectionHead } from '@/components/ui'
import { ChevronRight, Gift, People, Plus, Swords, Trophy } from '@/components/icons'

export const metadata: Metadata = { title: 'Compete' }

const METRIC_LABEL = { kcal_burned: 'Calories burned', workouts: 'Most workouts', points: 'Most points' } as const

export default async function CompetePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const period: Period = sp.p === 'monthly' ? 'monthly' : 'weekly'
  const [profile, board, points, { challenges, profiles, userId }, { prizes }] = await Promise.all([
    getProfile(),
    getLeaderboard(period, 25),
    getPointsSummary(),
    getMyChallenges(),
    getPrizes(),
  ])
  const mine = period === 'weekly' ? points.weekly : points.monthly
  const top3 = board.slice(0, 3)
  const rest = board.slice(3)
  const headline = prizes.find((p) => p.rank_gate && p.period === period)
  const open = challenges.filter((c) => c.status === 'active' || c.status === 'pending')
  const finished = challenges.filter((c) => c.status === 'finished').slice(0, 3)

  const slot = (row: (typeof board)[number] | undefined, place: 1 | 2 | 3) =>
    row ? (
      <div className="podium-slot" key={row.user_id}>
        <Avatar name={row.display_name} url={row.avatar_url} size={place === 1 ? 62 : 50} ring={place === 1 ? 'gold' : undefined} />
        <span className="podium-name ellipsis" style={{ maxWidth: 96 }}>{row.is_me ? 'You' : row.display_name}</span>
        <span className="podium-pts tnum">{n(row.points)} pts</span>
        <div className={`podium-step podium-step--${place}`}>{place}</div>
      </div>
    ) : (
      <div className="podium-slot" key={`empty-${place}`}>
        <span className="avatar" style={{ width: place === 1 ? 62 : 50, height: place === 1 ? 62 : 50, opacity: 0.4 }} />
        <span className="podium-name dim">Open</span>
        <span className="podium-pts">—</span>
        <div className={`podium-step podium-step--${place}`} style={{ opacity: 0.45 }}>{place}</div>
      </div>
    )

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <h1 className="h1">Leaderboard</h1>
        <Link href="/prizes" className="btn btn-glass btn-sm btn-pill"><Gift /> Prizes</Link>
      </header>

      <nav className="seg seg--gold rise" aria-label="Period">
        <Link href="/compete?p=weekly" className={period === 'weekly' ? 'is-on' : ''}>Weekly</Link>
        <Link href="/compete?p=monthly" className={period === 'monthly' ? 'is-on' : ''}>Monthly</Link>
      </nav>

      {headline ? (
        <Link href="/prizes" className="item item--gold rise delay-1" style={{ display: 'flex' }}>
          <span style={{ fontSize: 26 }} aria-hidden>{headline.emoji}</span>
          <span className="grow">
            <span className="strong" style={{ display: 'block' }}>{period === 'weekly' ? "This week's" : "This month's"} prize: {headline.title}</span>
            <span className="small muted">Finish in the top {headline.rank_gate} to claim it</span>
          </span>
          <ChevronRight className="chev" />
        </Link>
      ) : null}

      <Card glow="gold" className="rise delay-1" style={{ paddingBottom: 0 }}>
        <div className="podium">
          {slot(top3[1], 2)}
          {slot(top3[0], 1)}
          {slot(top3[2], 3)}
        </div>
      </Card>

      {rest.length ? (
        <ol className="list rise delay-2" aria-label="Ranks 4 and up">
          {rest.map((row) => (
            <li key={row.user_id} className={`item ${row.is_me ? 'item--gold' : ''}`} style={{ padding: '10px 14px' }}>
              <span className="rank-num">{row.rank}</span>
              <Avatar name={row.display_name} url={row.avatar_url} size={36} />
              <span className="grow">
                <span className="strong ellipsis" style={{ display: 'block' }}>{row.is_me ? 'You' : row.display_name}</span>
                <span className="tiny dim">@{row.username}</span>
              </span>
              <span className="strong tnum">{n(row.points)}</span>
            </li>
          ))}
        </ol>
      ) : board.length === 0 ? (
        <p className="small muted center rise delay-2">Nobody has scored this {period === 'weekly' ? 'week' : 'month'} yet. First workout takes the lead.</p>
      ) : null}

      <div className="pinned rise delay-2">
        <div className="card card--outline-gold row" style={{ display: 'flex', padding: '12px 16px', background: 'rgba(19,19,26,0.92)' }}>
          <Avatar name={profile.display_name} url={profile.avatar_url} size={40} ring="gold" />
          <span className="grow">
            <span className="strong" style={{ display: 'block' }}>
              {mine.rank ? `#${mine.rank} You · ${n(mine.points)} pts` : 'You are not ranked yet'}
            </span>
            <span className="small muted">
              {mine.rank ? (mine.gap_to_top5 ? `${n(mine.gap_to_top5)} to top 5` : 'Top 5 · hold the line') : 'Finish a workout to enter'}
            </span>
          </span>
          <Trophy className="gold" />
        </div>
      </div>

      <section className="section rise delay-3">
        <SectionHead title="Challenges" action={<Link href="/compete/new" className="row row-sm"><Plus width={16} height={16} /> New</Link>} />
        {open.length ? (
          <div className="list">
            {open.map((c) => {
              const meIsChallenger = c.challenger_id === userId
              const other = profiles.get(meIsChallenger ? c.opponent_id : c.challenger_id)
              const myScore = meIsChallenger ? c.challenger_score : c.opponent_score
              const theirScore = meIsChallenger ? c.opponent_score : c.challenger_score
              return (
                <Link key={c.id} href={`/compete/${c.id}`} className="item">
                  <Avatar name={other?.display_name ?? 'Rival'} url={other?.avatar_url} size={40} ring="ice" />
                  <span className="grow">
                    <span className="strong ellipsis" style={{ display: 'block' }}>vs {other?.display_name ?? 'Rival'} · {METRIC_LABEL[c.metric]}</span>
                    <span className="small muted">
                      {c.status === 'pending'
                        ? meIsChallenger ? 'Waiting for them to accept' : 'Invite: tap to respond'
                        : `${n(myScore)} vs ${n(theirScore)} · ${timeLeft(c.ends_at)}`}
                    </span>
                  </span>
                  <Pill tone={c.status === 'pending' ? 'ice' : myScore >= theirScore ? 'gold' : 'coral'}>
                    {c.status === 'pending' ? 'Pending' : myScore >= theirScore ? 'Leading' : 'Behind'}
                  </Pill>
                </Link>
              )
            })}
          </div>
        ) : (
          <Link href="/compete/new" className="item item--gold" style={{ display: 'flex' }}>
            <span className="ico ico-gold"><Swords /></span>
            <span className="grow">
              <span className="strong" style={{ display: 'block' }}>Challenge a friend</span>
              <span className="small muted">Pick a rival, a metric and a stake.</span>
            </span>
            <ChevronRight className="chev" />
          </Link>
        )}
        {finished.length ? (
          <div className="list">
            {finished.map((c) => {
              const other = profiles.get(c.challenger_id === userId ? c.opponent_id : c.challenger_id)
              const won = c.winner_id === userId
              return (
                <Link key={c.id} href={`/compete/${c.id}`} className="item item--plain">
                  <span className="ico" style={{ width: 34, height: 34 }}>{won ? '🏆' : c.winner_id ? '💪' : '🤝'}</span>
                  <span className="grow small">
                    <span className="strong">{won ? 'Won' : c.winner_id ? 'Lost' : 'Draw'}</span> vs {other?.display_name ?? 'Rival'} · {METRIC_LABEL[c.metric]}
                  </span>
                  <ChevronRight className="chev" />
                </Link>
              )
            })}
          </div>
        ) : null}
        <Link href="/me/friends" className="btn btn-glass btn-block"><People /> Friends</Link>
      </section>
    </div>
  )
}
