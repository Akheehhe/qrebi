import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { initials } from '@/lib/format'

type Tone = 'gold' | 'glass' | 'mint' | 'coral' | 'ghost'

export function Card({
  children,
  className = '',
  tone,
  glow,
  style,
}: {
  children: ReactNode
  className?: string
  tone?: 'gold' | 'outline-gold'
  glow?: 'gold' | 'mint' | 'ice'
  style?: CSSProperties
}) {
  const cls = ['card', tone ? `card--${tone}` : '', glow ? `card--glow glow-${glow}` : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <section className={cls} style={style}>
      {children}
    </section>
  )
}

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`kicker ${className}`}>{children}</p>
}

export function SectionHead({ title, action, href }: { title: ReactNode; action?: ReactNode; href?: string }) {
  return (
    <div className="section-head">
      <h2 className="h3">{title}</h2>
      {href ? <Link href={href}>{action ?? 'See all'}</Link> : action}
    </div>
  )
}

export function Button({
  href,
  children,
  tone = 'gold',
  size,
  block,
  pill,
  className = '',
  type = 'button',
  disabled,
  onClick,
  formAction,
  name,
  value,
  ariaLabel,
}: {
  href?: string
  children: ReactNode
  tone?: Tone
  size?: 'sm' | 'lg' | 'icon'
  block?: boolean
  pill?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  formAction?: (formData: FormData) => void | Promise<void>
  name?: string
  value?: string
  ariaLabel?: string
}) {
  const cls = ['btn', `btn-${tone}`, size ? `btn-${size}` : '', block ? 'btn-block' : '', pill ? 'btn-pill' : '', className]
    .filter(Boolean)
    .join(' ')
  if (href) {
    return (
      <Link href={href} className={cls} aria-disabled={disabled || undefined} aria-label={ariaLabel}>
        {children}
      </Link>
    )
  }
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
      formAction={formAction}
      name={name}
      value={value}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

export function Pill({
  children,
  tone,
  className = '',
}: {
  children: ReactNode
  tone?: 'gold' | 'mint' | 'ice' | 'coral' | 'solid-gold'
  className?: string
}) {
  return <span className={`pill ${tone ? `pill-${tone}` : ''} ${className}`}>{children}</span>
}

export function Avatar({
  name,
  url,
  size = 40,
  ring,
  className = '',
}: {
  name: string
  url?: string | null
  size?: number
  ring?: 'gold' | 'ice' | 'mint'
  className?: string
}) {
  return (
    <span
      className={`avatar ${ring ? `avatar--${ring}` : ''} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-label={name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {url ? <img src={url} alt="" /> : initials(name)}
    </span>
  )
}

/**
 * Concentric activity rings. Each ring is a full-circle track plus an arc
 * whose length is pct (0..1) of the circumference.
 */
export function Rings({
  size = 200,
  stroke = 16,
  gap = 6,
  rings,
  children,
  className = '',
}: {
  size?: number
  stroke?: number
  gap?: number
  rings: { pct: number; color: string; label: string }[]
  children?: ReactNode
  className?: string
}) {
  const c = size / 2
  return (
    <div className={`rings ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={rings.map((r) => `${r.label} ${Math.round(r.pct * 100)}%`).join(', ')}>
        {rings.map((r, i) => {
          const radius = c - stroke / 2 - i * (stroke + gap)
          const circ = 2 * Math.PI * radius
          const pct = Math.min(1, Math.max(0, r.pct))
          return (
            <g key={r.label}>
              <circle cx={c} cy={c} r={radius} stroke={r.color} strokeOpacity={0.18} strokeWidth={stroke} />
              <circle
                cx={c}
                cy={c}
                r={radius}
                stroke={r.color}
                strokeWidth={stroke}
                strokeDasharray={`${circ} ${circ}`}
                strokeDashoffset={circ * (1 - pct)}
              />
            </g>
          )
        })}
      </svg>
      {children ? <div className="rings-center">{children}</div> : null}
    </div>
  )
}

export function Bar({ pct, tone, thin }: { pct: number; tone?: 'mint' | 'ice'; thin?: boolean }) {
  const w = Math.round(Math.min(1, Math.max(0, pct)) * 100)
  return (
    <div className={`bar ${tone ? `bar--${tone}` : ''} ${thin ? 'bar--thin' : ''}`} role="progressbar" aria-valuenow={w} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${w}%` }} />
    </div>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'gold' | 'mint' | 'ice' }) {
  return (
    <div className="stat">
      <span className={`value ${tone ?? ''}`}>{value}</span>
      <span className="label">{label}</span>
      {sub ? <span className="tiny dim">{sub}</span> : null}
    </div>
  )
}

export function Empty({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="card center stack" style={{ padding: 28, alignItems: 'center' }}>
      {icon ? <span className="ico ico-lg ico-gold">{icon}</span> : null}
      <p className="h3">{title}</p>
      {body ? <p className="muted small" style={{ maxWidth: 300 }}>{body}</p> : null}
      {action}
    </div>
  )
}

export function Dots({ total, done, tone }: { total: number; done: number; tone?: 'mint' }) {
  return (
    <div className="dots" aria-label={`${done} of ${total} done`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i < done ? (tone === 'mint' ? 'is-mint' : 'is-on') : ''}`} />
      ))}
    </div>
  )
}
