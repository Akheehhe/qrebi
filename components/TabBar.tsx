'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, Fork, Person, Today, Trophy } from '@/components/icons'

const TABS = [
  { href: '/today', label: 'Today', Icon: Today },
  { href: '/food', label: 'Food', Icon: Fork },
  { href: '/train', label: 'Train', Icon: Dumbbell },
  { href: '/compete', label: 'Compete', Icon: Trophy },
  { href: '/me', label: 'Me', Icon: Person },
] as const

export default function TabBar() {
  const pathname = usePathname()
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ href, label, Icon }) => {
        const on = pathname === href || pathname.startsWith(`${href}/`) || (href === '/compete' && pathname.startsWith('/prizes')) || (href === '/today' && pathname.startsWith('/progress'))
        return (
          <Link key={href} href={href} className={`tab ${on ? 'is-on' : ''}`} aria-current={on ? 'page' : undefined}>
            <Icon />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

