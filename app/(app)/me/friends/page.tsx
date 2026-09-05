import Link from 'next/link'
import type { Metadata } from 'next'
import { getFriends, searchProfiles } from '@/lib/data/compete'
import { Avatar, Kicker } from '@/components/ui'
import { ChevronLeft, Search, Swords } from '@/components/icons'
import { requestFriend, respondFriend } from '../actions'

export const metadata: Metadata = { title: 'Friends' }

export default async function FriendsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 40) : ''
  const [friends, results] = await Promise.all([getFriends(), q ? searchProfiles(q) : Promise.resolve([])])
  const known = new Set([...friends.accepted, ...friends.incoming, ...friends.outgoing].map((f) => f.profile?.id))

  return (
    <div className="stack stack-lg">
      <header className="topbar rise">
        <Link href="/me" className="back" aria-label="Back"><ChevronLeft /></Link>
        <h1 className="h2 grow">Friends</h1>
      </header>

      <form className="input-wrap rise" role="search">
        <Search />
        <input className="input" name="q" defaultValue={q} placeholder="Search by name or @username" autoComplete="off" />
      </form>

      {q ? (
        <section className="section rise delay-1">
          <Kicker>Results for “{q}”</Kicker>
          {results.length ? (
            <div className="list">
              {results.map((p) => (
                <div key={p.id} className="item">
                  <Avatar name={p.display_name} url={p.avatar_url} size={40} />
                  <span className="grow">
                    <span className="strong" style={{ display: 'block' }}>{p.display_name}</span>
                    <span className="small muted">@{p.username}</span>
                  </span>
                  {known.has(p.id) ? (
                    <span className="pill">Connected</span>
                  ) : (
                    <form action={requestFriend}>
                      <input type="hidden" name="user_id" value={p.id} />
                      <button type="submit" className="btn btn-gold btn-sm btn-pill">Add</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="small muted">No one matches. Usernames are lowercase, like @nika.</p>
          )}
        </section>
      ) : null}

      {friends.incoming.length ? (
        <section className="section rise delay-1">
          <Kicker>Requests</Kicker>
          <div className="list">
            {friends.incoming.map(({ friendship, profile }) => (
              <div key={friendship.id} className="item item--gold">
                <Avatar name={profile?.display_name ?? '?'} url={profile?.avatar_url} size={40} />
                <span className="grow">
                  <span className="strong" style={{ display: 'block' }}>{profile?.display_name}</span>
                  <span className="small muted">wants to compete with you</span>
                </span>
                <form action={respondFriend} className="row row-sm">
                  <input type="hidden" name="id" value={friendship.id} />
                  <button type="submit" name="accept" value="0" className="btn btn-glass btn-sm btn-pill">Decline</button>
                  <button type="submit" name="accept" value="1" className="btn btn-gold btn-sm btn-pill">Accept</button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section rise delay-2">
        <Kicker>Your friends</Kicker>
        {friends.accepted.length ? (
          <div className="list">
            {friends.accepted.map(({ friendship, profile }) => (
              <div key={friendship.id} className="item">
                <Avatar name={profile?.display_name ?? '?'} url={profile?.avatar_url} size={40} />
                <span className="grow">
                  <span className="strong" style={{ display: 'block' }}>{profile?.display_name}</span>
                  <span className="small muted">@{profile?.username}</span>
                </span>
                {profile ? (
                  <Link href={`/compete/new?to=${profile.id}`} className="btn btn-glass btn-sm btn-pill"><Swords /> Challenge</Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="small muted">No friends yet. Search above, or tell them your handle: type it in and they add you.</p>
        )}
      </section>

      {friends.outgoing.length ? (
        <section className="section rise delay-3">
          <Kicker>Sent</Kicker>
          <div className="list">
            {friends.outgoing.map(({ friendship, profile }) => (
              <div key={friendship.id} className="item">
                <Avatar name={profile?.display_name ?? '?'} url={profile?.avatar_url} size={40} />
                <span className="grow">
                  <span className="strong" style={{ display: 'block' }}>{profile?.display_name}</span>
                  <span className="small muted">Waiting for them</span>
                </span>
                <form action={respondFriend}>
                  <input type="hidden" name="id" value={friendship.id} />
                  <button type="submit" name="accept" value="0" className="btn btn-ghost btn-sm">Cancel</button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
