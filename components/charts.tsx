'use client'

import { useState } from 'react'

/**
 * Small SVG charts that follow the data-viz rules: thin marks, 2px lines,
 * ≥8px markers with a surface ring, 4px rounded bar ends on a square
 * baseline, 2px gaps, hairline solid gridlines, selective labels, a tap/hover
 * tooltip, and a screen-reader table twin.
 */

const W = 320
const PAD = { l: 10, r: 34, t: 14, b: 22 }

function niceTicks(min: number, max: number, count = 3) {
  const span = Math.max(max - min, 1)
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  // Small integer ranges (workout counts) get whole-number ticks.
  const step =
    span <= 6 && Number.isInteger(min) && Number.isInteger(max)
      ? Math.max(1, Math.ceil(span / count))
      : ([1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw)
  const start = Math.floor(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(6))
  return ticks
}

function SrTable({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  )
}

export function LineChart({
  points,
  color = 'var(--ice)',
  height = 150,
  unit = '',
  decimals = 1,
  caption,
}: {
  points: { label: string; value: number }[]
  color?: string
  height?: number
  unit?: string
  decimals?: number
  caption: string
}) {
  const [active, setActive] = useState<number | null>(points.length ? points.length - 1 : null)
  if (points.length < 2) return null
  const innerW = W - PAD.l - PAD.r
  const innerH = height - PAD.t - PAD.b
  const values = points.map((p) => p.value)
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (max - min < 0.5) {
    min -= 0.5
    max += 0.5
  }
  const padY = (max - min) * 0.12
  min -= padY
  max += padY
  const x = (i: number) => PAD.l + (i / (points.length - 1)) * innerW
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * innerH
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const area = `${d} L${x(points.length - 1).toFixed(1)},${(PAD.t + innerH).toFixed(1)} L${PAD.l},${(PAD.t + innerH).toFixed(1)} Z`
  const ticks = niceTicks(min, max, 3)
  const showAllMarkers = points.length <= 14
  const fmt = (v: number) => `${v.toFixed(decimals)}${unit}`

  return (
    <div>
      <svg className="chart" viewBox={`0 0 ${W} ${height}`} height={height} role="img" aria-label={caption}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="axis-label" x={W - PAD.r + 6} y={y(t) + 4}>{t}</text>
          </g>
        ))}
        <path d={area} fill={color} opacity={0.1} />
        <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) =>
          showAllMarkers || i === 0 || i === points.length - 1 || i === active ? (
            <circle key={i} cx={x(i)} cy={y(p.value)} r={4} fill={color} stroke="var(--bg)" strokeWidth={2} />
          ) : null,
        )}
        {points.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={x(i) - innerW / points.length / 2}
            y={0}
            width={innerW / points.length}
            height={height}
            fill="transparent"
            onPointerDown={() => setActive(i)}
            onPointerEnter={() => setActive(i)}
          />
        ))}
        {active != null ? (
          <g pointerEvents="none">
            <line x1={x(active)} x2={x(active)} y1={PAD.t} y2={PAD.t + innerH} stroke="rgba(255,255,255,0.18)" />
            <text className="value-label" x={Math.min(Math.max(x(active), 34), W - PAD.r - 30)} y={Math.max(10, y(points[active].value) - 10)} textAnchor="middle">
              {fmt(points[active].value)}
            </text>
          </g>
        ) : null}
        <text className="axis-label" x={PAD.l} y={height - 6}>{points[0].label}</text>
        <text className="axis-label" x={W - PAD.r} y={height - 6} textAnchor="end">{points[points.length - 1].label}</text>
      </svg>
      <SrTable caption={caption} head={['When', 'Value']} rows={points.map((p) => [p.label, fmt(p.value)])} />
    </div>
  )
}

export function BarsChart({
  groups,
  colors,
  height = 150,
  caption,
  seriesNames,
  labelEvery = 1,
  unit = '',
}: {
  groups: { label: string; values: number[] }[]
  colors: string[]
  height?: number
  caption: string
  seriesNames: string[]
  labelEvery?: number
  unit?: string
}) {
  const [active, setActive] = useState<number | null>(null)
  if (!groups.length) return null
  const innerW = W - PAD.l - PAD.r
  const innerH = height - PAD.t - PAD.b
  const max = Math.max(1, ...groups.flatMap((g) => g.values))
  const ticks = niceTicks(0, max, 3)
  const top = ticks[ticks.length - 1] > max ? ticks[ticks.length - 1] : max
  const slot = innerW / groups.length
  const n = groups[0].values.length
  const barW = Math.max(3, Math.min(24, (slot - 6 - (n - 1) * 2) / n))
  const groupW = n * barW + (n - 1) * 2
  const y = (v: number) => PAD.t + (1 - v / top) * innerH
  const base = PAD.t + innerH

  const bar = (x0: number, v: number) => {
    const h = Math.max(0, base - y(v))
    if (h <= 0) return ''
    const r = Math.min(4, h, barW / 2)
    const yTop = base - h
    return `M${x0},${base} V${yTop + r} Q${x0},${yTop} ${x0 + r},${yTop} H${x0 + barW - r} Q${x0 + barW},${yTop} ${x0 + barW},${yTop + r} V${base} Z`
  }

  return (
    <div>
      <svg className="chart" viewBox={`0 0 ${W} ${height}`} height={height} role="img" aria-label={caption}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid" x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} />
            <text className="axis-label" x={W - PAD.r + 6} y={y(t) + 4}>{t >= 1000 ? `${(t / 1000).toFixed(t % 1000 ? 1 : 0)}k` : t}</text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={base} y2={base} stroke="rgba(255,255,255,0.14)" />
        {groups.map((g, gi) => {
          const gx = PAD.l + gi * slot + (slot - groupW) / 2
          return (
            <g key={g.label}>
              {g.values.map((v, si) => (
                <path key={si} d={bar(gx + si * (barW + 2), v)} fill={colors[si] ?? colors[0]} opacity={active == null || active === gi ? 1 : 0.55} />
              ))}
              <rect x={PAD.l + gi * slot} y={0} width={slot} height={height} fill="transparent" onPointerDown={() => setActive(gi)} onPointerEnter={() => setActive(gi)} />
              {gi % labelEvery === 0 ? (
                <text className="axis-label" x={gx + groupW / 2} y={height - 6} textAnchor="middle">{g.label}</text>
              ) : null}
            </g>
          )
        })}
        {active != null ? (
          <text className="value-label" x={Math.min(Math.max(PAD.l + active * slot + slot / 2, 40), W - PAD.r - 40)} y={Math.max(10, y(Math.max(...groups[active].values)) - 8)} textAnchor="middle" pointerEvents="none">
            {groups[active].values.map((v) => `${Math.round(v)}${unit}`).join(' · ')}
          </text>
        ) : null}
      </svg>
      <SrTable caption={caption} head={['When', ...seriesNames]} rows={groups.map((g) => [g.label, ...g.values.map((v) => Math.round(v))])} />
    </div>
  )
}
