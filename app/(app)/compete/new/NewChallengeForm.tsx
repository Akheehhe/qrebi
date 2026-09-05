'use client'

import { useActionState, useState } from 'react'
import { createChallenge, type ChallengeState } from '../actions'
import type { ProfileLite } from '@/lib/types'
import { Avatar } from '@/components/ui'
import { Bolt, Dumbbell, Flame, Spinner } from '@/components/icons'

const METRICS = [
  { key: 'workouts', label: 'Most workouts', hint: 'Sessions finished', Icon: Dumbbell },
  { key: 'kcal_burned', label: 'Calories burned', hint: 'Estimated from sessions', Icon: Flame },
  { key: 'points', label: 'Most points', hint: 'Everything counts', Icon: Bolt },
] as const

const STAKES = ['Loser buys a protein shake', 'Loser cooks dinner', 'Loser does 50 burpees', 'Bragging rights only']

export default function NewChallengeForm({ friends, preselect }: { friends: ProfileLite[]; preselect: string }) {
  const [state, action, pending] = useActionState<ChallengeState, FormData>(createChallenge, undefined)
  const [opponent, setOpponent] = useState(preselect)
  const [metric, setMetric] = useState<(typeof METRICS)[number]['key']>('kcal_burned')
  const [duration, setDuration] = useState<7 | 14 | 30>(7)
  const [stake, setStake] = useState(STAKES[0])

  return (
    <form action={action} className="stack rise delay-1">
      <input type="hidden" name="opponent" value={opponent} />
      <input type="hidden" name="metric" value={metric} />
      <input type="hidden" name="duration" value={duration} />

      <section className="card stack">
        <span className="label">Opponent</span>
        <div className="chips" style={{ marginInline: 0, paddingInline: 0, gap: 14 }}>
          {friends.map((f) => (
            <button key={f.id} type="button" onClick={() => setOpponent(f.id)} className="stack stack-sm" style={{ alignItems: 'center', minWidth: 68, gap: 6 }} aria-pressed={opponent === f.id}>
              <Avatar name={f.display_name} url={f.avatar_url} size={56} ring={opponent === f.id ? 'gold' : undefined} />
              <span className={`tiny ${opponent === f.id ? 'gold strong' : 'muted'}`}>{f.display_name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <span className="label">Type</span>
        <div className="stack stack-sm">
          {METRICS.map(({ key, label, hint, Icon }) => (
            <button key={key} type="button" className={`opt ${metric === key ? 'is-on' : ''}`} onClick={() => setMetric(key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Icon />
              <span className="grow"><strong style={{ display: 'block' }}>{label}</strong><span className="small">{hint}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <span className="label">Duration</span>
        <div className="seg seg--gold">
          {([7, 14, 30] as const).map((d) => (
            <button key={d} type="button" className={duration === d ? 'is-on' : ''} onClick={() => setDuration(d)}>
              {d === 7 ? '1 week' : d === 14 ? '2 weeks' : '1 month'}
            </button>
          ))}
        </div>
      </section>

      <section className="card stack">
        <label className="label" htmlFor="stake">Stake</label>
        <input id="stake" className="input" name="stake" value={stake} onChange={(e) => setStake(e.target.value)} maxLength={120} placeholder="What does the loser owe?" />
        <div className="chips" style={{ marginInline: 0, paddingInline: 0 }}>
          {STAKES.map((s) => (
            <button key={s} type="button" className={`chip ${stake === s ? 'is-on' : ''}`} onClick={() => setStake(s)}>{s}</button>
          ))}
        </div>
      </section>

      {state?.error ? <p className="error">{state.error}</p> : null}
      <button type="submit" className="btn btn-gold btn-block btn-lg" disabled={pending || !opponent}>
        {pending ? <Spinner /> : null} Send challenge
      </button>
    </form>
  )
}
