import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { lab } from '../content'
import { useMedia } from '../hooks/useMedia'
import { Reveal, RevealWords } from './Reveal'
import './BarrierLab.css'

const H = 400
const BH = 30
const GAP = 6
const TOP = 132
const X0 = 24
const ROWS = 5
const BOTTOM = TOP + ROWS * (BH + GAP) - GAP
// Phones get a narrower wall so everything stays a readable size
const WIDE = { W: 720, X1: 696, BW: 112, CRACK_X: [98, 226, 360, 494, 622] }
const COMPACT = { W: 440, X1: 416, BW: 84, CRACK_X: [66, 144, 220, 296, 374] }
const DROP = 'M0 -7 C4 -2 6 1 6 3.5 A6 6 0 0 1 -6 3.5 C-6 1 -4 -2 0 -7 Z'

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16))
  const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`
}

export function BarrierLab() {
  const compact = useMedia('(max-width: 600px)')
  const { W, X1, BW, CRACK_X } = compact ? COMPACT : WIDE
  const [on, setOn] = useState<boolean[]>(() => lab.stressors.map(() => false))
  const [applied, setApplied] = useState(false)
  const [sweep, setSweep] = useState(0)
  const touched = useRef(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const inView = useInView(panelRef, { once: true, margin: '0px 0px -25% 0px' })

  // A gentle demo the first time the panel comes into view
  useEffect(() => {
    if (!inView) return
    const id = window.setTimeout(() => {
      if (!touched.current) setOn((s) => s.map((v, i) => v || i === 0 || i === 2))
    }, 900)
    return () => window.clearTimeout(id)
  }, [inView])

  const bricks = useMemo(() => {
    const r = seeded(11)
    const out: { x: number; y: number; w: number; jx: number; jy: number; jr: number; tone: number }[] = []
    for (let row = 0; row < ROWS; row++) {
      const y = TOP + row * (BH + GAP)
      const offset = row % 2 ? -(BW + GAP) / 2 : 0
      for (let x = X0 + offset; x < X1; x += BW + GAP) {
        const a = Math.max(x, X0)
        const b = Math.min(x + BW, X1)
        if (b - a < 8) continue
        out.push({ x: a, y, w: b - a, jx: r() * 2 - 1, jy: r() * 2 - 1, jr: r() * 2 - 1, tone: r() })
      }
    }
    return out
  }, [X1, BW])

  const cracks = useMemo(
    () =>
      CRACK_X.map((cx, k) => {
        const r = seeded(100 + k * 7)
        const pts: [number, number][] = []
        for (let y = TOP - 8; y <= BOTTOM + 8; y += 12) pts.push([cx + (r() * 2 - 1) * 8, y])
        const crack = 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(' L')
        const up = [...pts].reverse()
        const escape =
          `M${cx} ${H - 30} L` + up.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(' L') + ` L${cx + 14} 34`
        const inward = `M${cx - 18} 18 L` + pts.map(([x, y]) => `${x.toFixed(1)} ${y}`).join(' L')
        return { crack, escape, inward }
      }),
    [CRACK_X],
  )

  const open = applied ? 0 : on.filter(Boolean).length
  const dry = open / lab.stressors.length
  const health = applied ? 1 : Math.max(0.12, 1 - open * 0.17)
  const key: keyof typeof lab.states = applied ? 'sealed' : open === 0 ? 'calm' : open <= 2 ? 'tight' : 'dry'
  const state = lab.states[key]

  const mortar = applied ? '#f8ead2' : mix('f3e4ca', 'a58d77', dry)
  const brickBase = mix('e7c8ad', 'd1b398', dry)
  const brickAlt = mix('dfbea2', 'c8a98e', dry)

  const toggle = (i: number) => {
    touched.current = true
    setApplied(false)
    setOn((s) => s.map((v, k) => (k === i ? !v : v)))
  }
  const apply = () => {
    touched.current = true
    setApplied(true)
    setSweep((n) => n + 1)
  }
  const reset = () => {
    touched.current = true
    setApplied(false)
    setOn(lab.stressors.map(() => false))
  }

  const held = Array.from({ length: compact ? 7 : 11 }, (_, i) => ({
    x: 60 + i * 58 + (i % 2 ? 12 : -8),
    y: BOTTOM + 34 + (i % 3) * 14,
    d: (i * 0.37) % 2.2,
  }))
  const visibleHeld = Math.round(held.length * health)

  return (
    <section id="lab" className="section lab" data-nav="light">
      <div className="wrap lab__grid">
        <div className="lab__copy">
          <span className="eyebrow">{lab.eyebrow}</span>
          <RevealWords as="h2" className="display lab__title" text={lab.title} />
          <Reveal delay={0.1}>
            {lab.body.map((p) => (
              <p className="lede lab__p" key={p}>
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.2} className="lab__controls">
            <p className="lab__label">Add some everyday stress</p>
            <div className="lab__chips">
              {lab.stressors.map((s, i) => (
                <button key={s} className="chip" aria-pressed={on[i]} onClick={() => toggle(i)}>
                  <span className="chip__dot" />
                  {s}
                </button>
              ))}
            </div>
            <div className="lab__actions">
              <button className="btn" onClick={apply}>
                <span className="btn__dot" />
                {lab.apply}
              </button>
              <button className="lab__reset" onClick={reset}>
                {lab.reset}
              </button>
            </div>
          </Reveal>
        </div>

        <div className="lab__panel" ref={panelRef}>
          <div className="lab__status" aria-live="polite">
            <div className="lab__status-top">
              <AnimatePresence mode="wait">
                <motion.span
                  key={key}
                  className="lab__state"
                  data-state={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  {state.label}
                </motion.span>
              </AnimatePresence>
              <span className="lab__meter-label">Moisture held</span>
            </div>
            <div className="lab__meter" aria-hidden="true">
              <span style={{ transform: `scaleX(${health})` }} data-state={key} />
            </div>
            <p className="lab__state-body">{state.body}</p>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="lab__svg" data-smil="" role="img" aria-label={`Illustration of the skin barrier. ${state.label}. ${state.body}`}>
            <defs>
              <linearGradient id="lab-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f6efe6" />
                <stop offset="1" stopColor="#efe4d6" />
              </linearGradient>
              <linearGradient id="lab-skin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ecd6c0" />
                <stop offset="1" stopColor="#e3c6aa" />
              </linearGradient>
              <linearGradient id="lab-sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff8ec" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff8ec" stopOpacity="0.85" />
                <stop offset="1" stopColor="#fff8ec" stopOpacity="0" />
              </linearGradient>
              <clipPath id="lab-wall">
                <rect x={X0} y={TOP - 10} width={X1 - X0} height={BOTTOM - TOP + 20} rx="6" />
              </clipPath>
              <filter id="lab-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            <rect width={W} height={TOP - 4} fill="url(#lab-sky)" />
            <rect y={BOTTOM + 4} width={W} height={H - BOTTOM - 4} fill="url(#lab-skin)" />
            <text x={X0} y={34} className="lab__svg-label">Outside</text>
            <text x={X0} y={H - 16} className="lab__svg-label">Your skin</text>

            {/* mortar */}
            <rect
              x={X0}
              y={TOP - 4}
              width={X1 - X0}
              height={BOTTOM - TOP + 8}
              rx="4"
              style={{ fill: mortar, transition: 'fill 0.9s ease' }}
            />

            {/* bricks, i.e. skin cells */}
            <g clipPath="url(#lab-wall)">
              {bricks.map((b, i) => (
                <rect
                  key={i}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={BH}
                  rx="7"
                  className="lab__brick"
                  style={{
                    fill: b.tone > 0.5 ? brickBase : brickAlt,
                    transform: `translate(${(b.jx * dry * 3).toFixed(2)}px, ${(b.jy * dry * 2.2).toFixed(2)}px) rotate(${(b.jr * dry * 1.6).toFixed(2)}deg) scale(${1 - dry * 0.05})`,
                  }}
                />
              ))}
            </g>

            {/* cracks */}
            {cracks.map((c, i) => {
              const isOpen = on[i] && !applied
              const sealed = on[i] && applied
              return (
                <g key={i}>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.path
                        d={c.crack}
                        className="lab__crack"
                        initial={{ pathLength: 0, opacity: 1 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    )}
                    {sealed && (
                      <motion.g key={`s${sweep}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.path
                          d={c.crack}
                          className="lab__seal-glow"
                          filter="url(#lab-glow)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9, delay: 0.15 * i }}
                        />
                        <motion.path
                          d={c.crack}
                          className="lab__seal"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9, delay: 0.15 * i }}
                        />
                      </motion.g>
                    )}
                  </AnimatePresence>
                  {isOpen && (
                    <g>
                      {[0, 1, 2].map((k) => (
                        <path key={`d${k}`} d={DROP} className="lab__drop" opacity="0">
                          <animateMotion dur="3.2s" repeatCount="indefinite" begin={`${k * 1.05 + i * 0.3}s`} path={c.escape} />
                          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.8;1" dur="3.2s" repeatCount="indefinite" begin={`${k * 1.05 + i * 0.3}s`} />
                        </path>
                      ))}
                      {[0, 1].map((k) => (
                        <circle key={`x${k}`} r="2.6" className="lab__irritant" opacity="0">
                          <animateMotion dur="3.8s" repeatCount="indefinite" begin={`${k * 1.9 + i * 0.5}s`} path={c.inward} />
                          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.85;1" dur="3.8s" repeatCount="indefinite" begin={`${k * 1.9 + i * 0.5}s`} />
                        </circle>
                      ))}
                    </g>
                  )}
                </g>
              )
            })}

            {/* moisture held below the wall */}
            {held.map((d, i) => (
              <g key={i} transform={`translate(${d.x} ${d.y})`}>
                <path
                  d={DROP}
                  className="lab__held"
                  style={{
                    opacity: i < visibleHeld ? 0.9 : 0,
                    animationDelay: `${-d.d}s`,
                  }}
                />
              </g>
            ))}

            {/* the cream going on */}
            {applied && (
              <g key={sweep} clipPath="url(#lab-wall)">
                <rect
                  x={X0}
                  y={TOP - 10}
                  width="160"
                  height={BOTTOM - TOP + 20}
                  fill="url(#lab-sweep)"
                  className="lab__sweep"
                  style={{ ['--sweep-to' as string]: `${W + 40}px` }}
                />
              </g>
            )}
          </svg>

          <div className="lab__legend">
            <span>
              <i className="lab__legend-drop" /> Moisture
            </span>
            <span>
              <i className="lab__legend-irr" /> Irritants
            </span>
            <span>
              <i className="lab__legend-brick" /> Skin cells
            </span>
            <span>
              <i className="lab__legend-mortar" /> Ceramides
            </span>
          </div>
          <p className="lab__note">{lab.note}</p>
        </div>
      </div>
    </section>
  )
}
