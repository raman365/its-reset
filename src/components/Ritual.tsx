import { useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { ritual } from '../content'
import { RevealWords, Reveal } from './Reveal'
import './Ritual.css'

// Sky colour through the day (t runs 06:00 to 23:00): dawn, day, golden hour, dusk, night
const STOPS: [number, string][] = [
  [0, 'efd8c3'],
  [0.2, 'f6eee3'],
  [0.5, 'f4eadc'],
  [0.66, 'ead2b2'],
  [0.76, 'deb895'],
  [0.85, '5e483a'],
  [0.92, '2e2520'],
  [1, '1b1714'],
]
const hex = (h: string) => h.match(/\w\w/g)!.map((v) => parseInt(v, 16))
function skyAt(t: number) {
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i]
    const [t0, c0] = STOPS[i - 1]
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0)
      const a = hex(c0)
      const b = hex(c1)
      return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * k)).join(',')})`
    }
  }
  return `#${STOPS[STOPS.length - 1][1]}`
}
const isDark = (t: number) => t > 0.82

const X0 = 60
const X1 = 940
const BASE = 250
const CTRL = -70
const arcX = (t: number) => X0 + (X1 - X0) * t
const arcY = (t: number) => (1 - t) ** 2 * BASE + 2 * (1 - t) * t * CTRL + t * t * BASE
const clockOf = (t: number) => {
  const mins = Math.round((6 * 60 + t * 17 * 60) / 5) * 5
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

export function Ritual() {
  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const t = useMotionValue(ritual.moments[0].t)
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)

  const bg = useTransform(t, skyAt)
  const fg = useTransform(t, (v) => (isDark(v) ? '#f5efe7' : '#1b1815'))
  const soft = useTransform(t, (v) => (isDark(v) ? 'rgba(245,239,231,0.68)' : 'rgba(27,24,21,0.62)'))
  const line = useTransform(t, (v) => (isDark(v) ? 'rgba(245,239,231,0.2)' : 'rgba(27,24,21,0.18)'))
  const sunX = useTransform(t, arcX)
  const sunY = useTransform(t, arcY)
  const night = useTransform(t, [0.82, 0.9], [0, 1])
  const sunFill = useTransform(t, [0, 0.2, 0.7, 0.82, 0.9], ['#e9a06f', '#d9a84e', '#c9853f', '#b06a3f', '#f1e6d4'])
  const glow = useTransform(t, [0, 0.4, 0.78, 0.9], [0.5, 0.75, 0.65, 0.12])
  const biteX = useTransform(sunX, (v) => v + 11)
  const biteY = useTransform(sunY, (v) => v - 8)
  const clock = useTransform(t, clockOf)

  useMotionValueEvent(t, 'change', (v) => {
    let best = 0
    ritual.moments.forEach((m, i) => {
      if (Math.abs(m.t - v) < Math.abs(ritual.moments[best].t - v)) best = i
    })
    setActive((a) => (a === best ? a : best))
    const el = sectionRef.current
    if (el) el.dataset.nav = isDark(v) ? 'dark' : 'light'
  })

  const goTo = (i: number) => {
    animate(t, ritual.moments[i].t, { duration: 1.4, ease: [0.65, 0, 0.35, 1] })
  }

  const fromPointer = (clientX: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    const x = ((clientX - r.left) / r.width) * 1000
    return Math.min(1, Math.max(0, (x - X0) / (X1 - X0)))
  }
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    setDragging(true)
    t.stop()
    t.set(fromPointer(e.clientX))
  }
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (dragging) t.set(fromPointer(e.clientX))
  }
  const onUp = () => setDragging(false)
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.08 : 0.02
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') t.set(Math.min(1, t.get() + step))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') t.set(Math.max(0, t.get() - step))
    else return
    e.preventDefault()
  }

  const m = ritual.moments[active]
  const arcPath = `M${X0} ${BASE} Q500 ${CTRL} ${X1} ${BASE}`

  return (
    <motion.section
      ref={sectionRef}
      id="ritual"
      className="ritual"
      data-nav="light"
      style={{
        backgroundColor: bg,
        color: fg,
        ['--fg' as string]: fg,
        ['--sky' as string]: bg,
        ['--soft' as string]: soft,
        ['--rline' as string]: line,
      }}
    >
      <div className="wrap">
        <div className="ritual__head">
          <span className="eyebrow">{ritual.eyebrow}</span>
          <RevealWords as="h2" className="display ritual__title" text={ritual.title} />
          <Reveal delay={0.1}>
            <p className="ritual__sub">{ritual.sub}</p>
          </Reveal>
        </div>

        <div className="ritual__sky">
          <div className="ritual__dial">
          <motion.span className="ritual__clock" aria-hidden="true">
            {clock}
          </motion.span>
          <svg
            ref={svgRef}
            viewBox="0 0 1000 300"
            className="ritual__svg"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            data-cursor="Drag"
            data-dragging={dragging}
          >
            <defs>
              <radialGradient id="sun-glow">
                <stop offset="0" stopColor="#f6c98b" stopOpacity="0.9" />
                <stop offset="1" stopColor="#f6c98b" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path d={arcPath} className="ritual__arc" />
            <line x1="0" x2="1000" y1={BASE} y2={BASE} className="ritual__horizon" />
            {ritual.moments.map((mo, i) => (
              <g
                key={mo.id}
                className="ritual__mark"
                data-active={i === active}
                transform={`translate(${arcX(mo.t)} ${arcY(mo.t)})`}
              >
                <circle r="6" />
              </g>
            ))}
            <motion.circle cx={sunX} cy={sunY} r="90" fill="url(#sun-glow)" style={{ opacity: glow }} />
            <motion.circle
              cx={sunX}
              cy={sunY}
              r="24"
              style={{ fill: sunFill }}
              className="ritual__sun"
              role="slider"
              tabIndex={0}
              aria-label="Time of day"
              aria-valuemin={6}
              aria-valuemax={23}
              aria-valuenow={Math.round((6 + ritual.moments[active].t * 17) * 10) / 10}
              aria-valuetext={`${m.label}, around ${m.time}`}
              onKeyDown={onKey}
            />
            <motion.circle cx={biteX} cy={biteY} r="21" style={{ fill: bg, opacity: night }} pointerEvents="none" />
          </svg>
          </div>

          <div className="ritual__tabs">
            {ritual.moments.map((mo, i) => (
              <button key={mo.id} className="ritual__tab" aria-pressed={i === active} onClick={() => goTo(i)}>
                <span className="ritual__tab-time">{mo.time}</span>
                {mo.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ritual__card">
          <AnimatePresence mode="wait">
            <motion.div
              key={m.id}
              className="ritual__content"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="ritual__lead">
                <span className="ritual__when">
                  {m.label} · {m.time}
                </span>
                <h3 className="display ritual__h">{m.title}</h3>
                <p className="ritual__tip">{m.tip}</p>
              </div>
              <ol className="ritual__steps">
                {m.steps.map((s, i) => (
                  <li key={s.name}>
                    <span className="ritual__n">{i + 1}</span>
                    <strong>{s.name}</strong>
                    <p>{s.body}</p>
                  </li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}
