'use client'

import { useState } from 'react'
import { T } from '@/components/shared'
import { Star } from '@/components/icons'

// Chart marks use deepened brand steps (validated for CVD separation and the
// lightness band; every value is also written as text, never color-gated):
//   gold #C78F00 — ratings that carried on to Google
//   purple #5B36BD — private ones only the owner saw

/** counts[i] = how many ratings of i+1 stars. Single series, one hue,
 *  every row's value printed — no legend needed. */
export function StarDistribution({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts)
  return (
    <div className="chart-dist" role="img"
      aria-label={`შეფასებების განაწილება: ${counts.map((c, i) => `${i + 1}★ ${c}`).join(', ')}`}>
      {[5, 4, 3, 2, 1].map((n) => {
        const c = counts[n - 1]
        return (
          <div key={n} className="chart-dist-row">
            <span className="chart-dist-lab">{n}<Star /></span>
            <span className="chart-dist-track">
              <span className="chart-dist-fill" style={{ width: `${(c / max) * 100}%` }} />
            </span>
            <span className={`chart-dist-n${c === 0 ? ' zero' : ''}`}>{c}</span>
          </div>
        )
      })}
    </div>
  )
}

export type TrendDay = {
  key: string     // YYYY-MM-DD (Tbilisi)
  label: string   // dd.MM
  google: number
  priv: number
}

const W = 660
const H = 150
const PAD_L = 26
const PAD_T = 8
const PAD_B = 20
const PLOT_W = W - PAD_L - 4
const PLOT_H = H - PAD_T - PAD_B

/** A bar growing up from the baseline: square at the base, 4px rounded cap. */
function bar(x: number, y: number, w: number, h: number, capped: boolean): string {
  if (!capped || h < 5) return `M${x},${y + h} v${-h} h${w} v${h} z`
  const r = 4
  return `M${x},${y + h} v${-(h - r)} q0,-${r} ${r},-${r} h${w - 2 * r} q${r},0 ${r},${r} v${h - r} z`
}

function niceCeil(n: number): number {
  if (n <= 5) return Math.max(1, n)
  const pow = 10 ** Math.floor(Math.log10(n))
  for (const m of [1, 2, 5, 10]) if (m * pow >= n) return m * pow
  return 10 * pow
}

/** Last 30 days, one stacked column per day: Google-bound below, private
 *  above, a 2px surface gap between them. Legend + hover tooltip + an
 *  sr-only table carry the identities and exact values. */
export function TrendChart({ days }: { days: TrendDay[] }) {
  const [tip, setTip] = useState<number | null>(null)
  const max = niceCeil(Math.max(1, ...days.map((d) => d.google + d.priv)))
  const slot = PLOT_W / days.length
  const bw = Math.min(16, Math.max(3, slot - 3))
  const yOf = (v: number) => PAD_T + PLOT_H * (1 - v / max)
  const hOf = (v: number) => (PLOT_H * v) / max

  const t = tip != null ? days[tip] : null

  return (
    <div className="chart-trend">
      <div className="chart-legend">
        <span><i className="chart-dot chart-dot-g" /><T ge="Google-ზე" en="To Google" /></span>
        <span><i className="chart-dot chart-dot-p" /><T ge="პირადი" en="Private" /></span>
      </div>
      <div className="chart-trend-plot">
        <svg viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label="შეფასებები დღეების მიხედვით, ბოლო 30 დღე"
          onMouseLeave={() => setTip(null)}>
          {/* recessive hairlines: baseline, midpoint, max */}
          {[0, max / 2, max].map((v) => (
            <g key={v}>
              <line x1={PAD_L} x2={W - 4} y1={yOf(v)} y2={yOf(v)} className="chart-grid" />
              <text x={PAD_L - 6} y={yOf(v) + 3.5} className="chart-tick" textAnchor="end">
                {Number.isInteger(v) ? v : ''}
              </text>
            </g>
          ))}
          {days.map((d, i) => {
            const x = PAD_L + i * slot + (slot - bw) / 2
            const gh = hOf(d.google)
            const ph = hOf(d.priv)
            const gap = d.google > 0 && d.priv > 0 ? 2 : 0
            return (
              <g key={d.key}>
                {d.google > 0 && (
                  <path className="chart-seg-g" d={bar(x, yOf(d.google), bw, gh, d.priv === 0)} />
                )}
                {d.priv > 0 && (
                  <path className="chart-seg-p"
                    d={bar(x, yOf(d.google + d.priv) - 0, bw, Math.max(1, ph - gap), true)} />
                )}
                {/* full-height hit target, wider than the mark */}
                <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={PLOT_H + PAD_B}
                  fill="transparent" onMouseEnter={() => setTip(i)} />
                {i % 7 === 3 && (
                  <text x={x + bw / 2} y={H - 6} className="chart-tick" textAnchor="middle">
                    {d.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        {t && (
          <div className="chart-tip" style={{ left: `${((PAD_L + (tip! + 0.5) * slot) / W) * 100}%` }}>
            <b>{t.label}</b>
            <span>Google: {t.google}</span>
            <span><T ge="პირადი" en="Private" />: {t.priv}</span>
          </div>
        )}
      </div>
      {/* the same data as text, for screen readers and as the value fallback */}
      <table className="sr-only">
        <caption>ბოლო 30 დღის შეფასებები დღეების მიხედვით</caption>
        <thead><tr><th>დღე</th><th>Google</th><th>პირადი</th></tr></thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.key}><td>{d.key}</td><td>{d.google}</td><td>{d.priv}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
