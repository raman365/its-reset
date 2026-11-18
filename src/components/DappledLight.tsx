import { useMemo } from 'react'
import './DappledLight.css'

// Soft palm shadows and a window shaft of light, like the campaign shoot.
function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function frond(x0: number, y0: number, x1: number, y1: number, bend: number, len: number, seed: number) {
  const r = rand(seed)
  const cx = (x0 + x1) / 2 + bend
  const cy = (y0 + y1) / 2 - bend * 0.4
  const pt = (t: number) => ({
    x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1,
    y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1,
  })
  const parts: string[] = [`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`]
  const n = 26
  for (let i = 2; i < n; i++) {
    const t = i / n
    const p = pt(t)
    const q = pt(Math.min(1, t + 0.01))
    const ang = Math.atan2(q.y - p.y, q.x - p.x)
    const L = len * Math.pow(Math.sin(Math.PI * t), 0.8) * (0.8 + r() * 0.4)
    for (const side of [-1, 1]) {
      const a = ang + side * (0.75 + r() * 0.25)
      const ex = p.x + Math.cos(a) * L
      const ey = p.y + Math.sin(a) * L
      const w = 5 + r() * 4
      const mx = (p.x + ex) / 2
      const my = (p.y + ey) / 2
      const nx = -Math.sin(a) * w
      const ny = Math.cos(a) * w
      parts.push(
        `M${p.x.toFixed(1)},${p.y.toFixed(1)} Q${(mx + nx).toFixed(1)},${(my + ny).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)} Q${(mx - nx).toFixed(1)},${(my - ny).toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}Z`,
      )
    }
  }
  return parts.join(' ')
}

export function DappledLight({ className = '' }: { className?: string }) {
  const paths = useMemo(
    () => [
      frond(-60, -40, 520, 420, 120, 150, 7),
      frond(-80, 260, 420, 700, -60, 130, 19),
      frond(1300, -60, 860, 360, -100, 140, 31),
    ],
    [],
  )
  return (
    <div className={`dapple ${className}`} aria-hidden="true">
      <div className="dapple__shaft" />
      <svg className="dapple__leaves" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {paths.map((d, i) => (
          <path key={i} d={d} className={`dapple__frond dapple__frond--${i}`} />
        ))}
      </svg>
    </div>
  )
}
