import Link from 'next/link'
import type { Metadata } from 'next'
import { requireUser } from '@/lib/dal'
import { getPrizes } from '@/lib/data/compete'
import { getPointsSummary } from '@/lib/data/points'
import { n, timeAgo } from '@/lib/format'
import { Card, Kicker } from '@/components/ui'
import { ChevronLeft, Trophy } from '@/components/icons'
import ClaimButton from './ClaimButton'

export const metadata: Metadata = { title: 'Prizes' }

export default async function PrizesPage() {
  const [{ prizes, claims }, points, lastWeek, lastMonth] = await Promise.all([
    getPrizes(),
    getPointsSummary(),
    requireUser().then(({ supabase }) => supabase.rpc('my_last_period_rank', { p_period: 'weekly' })),
    requireUser().then(({ supabase }) => supabase.rpc('my_last_period_rank', { p_period: 'monthly' })),
  ])
  const rankOf = (r: { data: unknown }) => (Array.isArray(r.data) && r.data[0] ? (r.data[0] as { rank: number }).rank : null)
  const lastRank = { weekly: rankOf(lastWeek), monthly: rankOf(lastMonth) }
  const byId = new Map(prizes.map((p) => [p.id, p]))

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/compete" className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h1 grow">Prizes</h1>
      </header>

      <Card tone="gold" className="rise delay-1 row between">
        <div>
          <Kicker>Your balance</Kicker>
          <p className="display" style={{ marginTop: 4 }}>{n(points.balance)} <span className="h3" style={{ opacity: 0.7 }}>pts</span></p>
          <p className="small" style={{ opacity: 0.75 }}>
            {points.weekly.rank ? `Rank #${points.weekly.rank} this week` : 'Unranked this week'}
            {lastRank.weekly ? ` · #${lastRank.weekly} last week` : ''}
          </p>
        </div>
        <span className="ico ico-lg" style={{ background: 'rgba(26,18,4,0.12)', color: 'var(--on-gold)' }}><Trophy /></span>
      </Card>

      <div className="prize-grid rise delay-2">
        {prizes.map((p) => {
          const gated = p.rank_gate != null
          const eligible = gated ? (lastRank[p.period ?? 'weekly'] ?? Infinity) <= (p.rank_gate ?? 0) : points.balance >= (p.cost_points ?? 0)
          return (
            <article key={p.id} className={`prize ${eligible ? '' : 'is-locked'}`}>
              <div className="prize-art" aria-hidden>{p.emoji ?? '🎁'}</div>
              <div className="grow">
                <p className="strong">{p.title}</p>
                <p className="tiny muted" style={{ marginTop: 2 }}>{p.description}</p>
              </div>
              <div className="row between">
                <span className={`pill ${gated ? 'pill-gold' : 'pill-mint'}`}>
                  {gated ? `Top ${p.rank_gate} ${p.period === 'monthly' ? 'monthly' : 'weekly'}` : `${n(p.cost_points)} pts`}
                </span>
              </div>
              <ClaimButton prizeId={p.id} eligible={eligible && p.stock > 0} label={p.stock <= 0 ? 'Sold out' : gated && !eligible ? `Reach top ${p.rank_gate}` : eligible ? 'Claim' : 'Keep earning'} />
            </article>
          )
        })}
      </div>

      {claims.length ? (
        <section className="section rise delay-3">
          <h2 className="h3">Your claims</h2>
          <ul className="list">
            {claims.map((c) => {
              const p = byId.get(c.prize_id)
              return (
                <li key={c.id} className="item">
                  <span style={{ fontSize: 24 }} aria-hidden>{p?.emoji ?? '🎁'}</span>
                  <span className="grow">
                    <span className="strong" style={{ display: 'block' }}>{p?.title ?? 'Prize'}</span>
                    <span className="small muted">{timeAgo(c.created_at)}{c.points_spent ? ` · ${n(c.points_spent)} pts` : c.period_key ? ` · ${c.period_key}` : ''}</span>
                  </span>
                  <span className={`pill ${c.status === 'fulfilled' ? 'pill-mint' : c.status === 'cancelled' ? '' : 'pill-gold'}`}>{c.status === 'pending' ? 'Show at desk' : c.status}</span>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      <p className="tiny dim center">Points come from finished sessions, daily logging and won challenges. Rank prizes look at the last completed week or month.</p>
    </div>
  )
}
