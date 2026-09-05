import Link from 'next/link'
import type { Metadata } from 'next'
import { getProfile } from '@/lib/dal'
import { getToday } from '@/lib/tz'
import { getFriends } from '@/lib/data/compete'
import { getProfileStats } from '@/lib/data/profile'
import { n } from '@/lib/format'
import { Avatar, Card, Kicker, Pill, SectionHead, Stat } from '@/components/ui'
import { ChevronRight, Flame, Gear, Plus } from '@/components/icons'
import { signOut } from '@/app/(auth)/actions'

export const metadata: Metadata = { title: 'Me' }

export default async function MePage() {
  const { tz } = await getToday()
  const [profile, stats, friends] = await Promise.all([getProfile(), getProfileStats(tz), getFriends()])
  const earned = stats.badges.filter((b) => b.earned).length

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <h1 className="h1">Me</h1>
        <Link href="/me/settings" className="back" aria-label="Settings"><Gear /></Link>
      </header>

      <section className="center stack rise delay-1" style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name={profile.display_name} url={profile.avatar_url} size={96} ring="gold" />
        <h2 className="h2" style={{ marginTop: 6 }}>{profile.display_name}</h2>
        <p className="small muted">@{profile.username}{profile.city ? ` · ${profile.city}` : ''}</p>
        {stats.streak > 0 ? <Pill tone="gold"><Flame /> {stats.streak} day streak</Pill> : <Pill>Start a streak today</Pill>}
      </section>

      <div className="grid-3 rise delay-1">
        <Stat label="workouts" value={n(stats.workouts)} />
        <Stat label="wins" value={n(stats.wins)} tone="gold" />
        <Stat label="points" value={n(stats.balance)} tone="mint" />
      </div>

      <Card className="rise delay-2">
        <div className="row between" style={{ marginBottom: 14 }}>
          <Kicker>Achievements</Kicker>
          <span className="small muted tnum">{earned}/{stats.badges.length}</span>
        </div>
        <div className="badges">
          {stats.badges.map((b) => (
            <div key={b.key} className={`badge ${b.earned ? 'is-earned' : ''}`} title={b.hint}>
              <span className="badge-disc" aria-hidden>{b.earned ? b.emoji : '🔒'}</span>
              <span>{b.label}</span>
              <span className="sr-only">{b.earned ? 'earned' : `locked: ${b.hint}`}</span>
            </div>
          ))}
        </div>
      </Card>

      <section className="section rise delay-2">
        <SectionHead title="Friends" href="/me/friends" action={friends.incoming.length ? `${friends.incoming.length} request${friends.incoming.length > 1 ? 's' : ''}` : 'Manage'} />
        <Link href="/me/friends" className="item">
          {friends.accepted.length ? (
            <span className="avatar-row">
              {friends.accepted.slice(0, 5).map((f) => (
                <Avatar key={f.friendship.id} name={f.profile?.display_name ?? '?'} url={f.profile?.avatar_url} size={36} />
              ))}
            </span>
          ) : (
            <span className="ico ico-gold"><Plus /></span>
          )}
          <span className="grow">
            <span className="strong" style={{ display: 'block' }}>{friends.accepted.length ? `${friends.accepted.length} friend${friends.accepted.length > 1 ? 's' : ''}` : 'Add friends'}</span>
            <span className="small muted">{friends.accepted.length ? 'Tap to challenge someone' : 'Search by username to start competing'}</span>
          </span>
          <ChevronRight className="chev" />
        </Link>
      </section>

      <section className="section rise delay-3">
        <Link href="/me/settings" className="item">
          <span className="ico"><Gear /></span>
          <span className="grow strong">Goals and settings</span>
          <ChevronRight className="chev" />
        </Link>
        <Link href="/progress" className="item">
          <span className="ico">📈</span>
          <span className="grow strong">Progress and records</span>
          <ChevronRight className="chev" />
        </Link>
        <form action={signOut}>
          <button type="submit" className="btn btn-ghost btn-block">Sign out</button>
        </form>
      </section>
    </div>
  )
}
