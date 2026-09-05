import Link from 'next/link'
import type { Metadata } from 'next'
import { getFriends } from '@/lib/data/compete'
import { ChevronLeft, People } from '@/components/icons'
import NewChallengeForm from './NewChallengeForm'

export const metadata: Metadata = { title: 'New challenge' }

export default async function NewChallengePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const { accepted } = await getFriends()
  const friends = accepted.flatMap((f) => (f.profile ? [f.profile] : []))
  const preselect = typeof sp.to === 'string' && friends.some((f) => f.id === sp.to) ? sp.to : friends[0]?.id ?? ''

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/compete" className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h2 grow">New challenge</h1>
      </header>
      {friends.length ? (
        <NewChallengeForm friends={friends} preselect={preselect} />
      ) : (
        <div className="card center stack rise" style={{ alignItems: 'center', padding: 28 }}>
          <span className="ico ico-lg ico-gold"><People /></span>
          <p className="h3">Add a friend first</p>
          <p className="small muted">Challenges run between accepted friends. Find them by username.</p>
          <Link href="/me/friends" className="btn btn-gold">Find friends</Link>
        </div>
      )}
    </div>
  )
}
