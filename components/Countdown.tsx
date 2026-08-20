'use client'

import { useEffect, useState } from 'react'
import { remaining, type Remaining } from '@/lib/campaign'
import { T } from './shared'

/**
 * A real clock against a fixed deadline. It renders nothing until mounted —
 * the server has no business guessing the visitor's "now", and a mismatched
 * first paint would hydrate wrong — and it stops dead when the campaign ends
 * rather than looping back to the top.
 */
export default function Countdown({ variant = 'block' }: { variant?: 'block' | 'inline' }) {
  const [left, setLeft] = useState<Remaining | null>(null)

  useEffect(() => {
    const tick = () => setLeft(remaining())
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  if (!left || left.done) return null

  const cells: [number, React.ReactNode][] = [
    [left.days, <T key="d" ge="დღე" en="days" />],
    [left.hours, <T key="h" ge="სთ" en="hrs" />],
    [left.minutes, <T key="m" ge="წთ" en="min" />],
    [left.seconds, <T key="s" ge="წმ" en="sec" />],
  ]

  return (
    <div className={`cdown cdown-${variant}`} role="timer" aria-live="off">
      {cells.map(([n, label], i) => (
        <span className="cdown-cell" key={i}>
          <b>{String(n).padStart(2, '0')}</b>
          <i>{label}</i>
        </span>
      ))}
    </div>
  )
}
