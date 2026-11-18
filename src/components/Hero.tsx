import { useLayoutEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import modelImg from '../assets/img/model.webp'
import { hero } from '../content'
import { handleAnchorClick } from '../hooks/smoothScroll'
import { Arrow } from './Icons'
import { Wordmark } from './Wordmark'
import './Hero.css'

// Source photo is 1230 x 1278. The focus point is the dot printed on the
// jar label, so the logo's dot opens straight onto the jar's own dot.
const AR = 1230 / 1278
const FOCUS = { x: 625 / 1230, y: 767 / 1278 }
const EASE = [0.16, 1, 0.3, 1] as const

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

type Geo = {
  cx: number
  cy: number
  r: number
  R: number
  x0: number
  y0: number
  xF: number
  yF: number
  sx: number
  sy: number
  land: boolean
}

export function Hero() {
  const reduce = useReducedMotion()
  return reduce ? <HeroStatic /> : <HeroPinned />
}

function Letters({ text, delay }: { text: string; delay: number }) {
  return (
    <>
      {text.split('').map((c, i) => (
        <span className="hero__clip" key={i}>
          <motion.span
            className="hero__char"
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ delay: delay + i * 0.07, duration: 1.3, ease: EASE }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </>
  )
}

function HeroPinned() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const g = useRef<Geo>({ cx: 0, cy: 0, r: 0, R: 0, x0: 0, y0: 0, xF: 0, yF: 0, sx: 0, sy: 0, land: true })
  const [img, setImg] = useState({ w: 0, h: 0, ox: 0, oy: 0 })
  const [ring, setRing] = useState({ cx: -999, cy: -999, d: 0 })

  const tick = useMotionValue(0)
  const intro = useMotionValue(0)
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useLayoutEffect(() => {
    const stage = stageRef.current
    const dot = dotRef.current
    if (!stage || !dot) return
    // Same query as the CSS that moves the copy under the photo
    const mq = window.matchMedia('(max-aspect-ratio: 21/20)')

    const measure = () => {
      const s = stage.getBoundingClientRect()
      const d = dot.getBoundingClientRect()
      const vw = s.width
      const vh = s.height
      const cx = d.left - s.left + d.width / 2
      const cy = d.top - s.top + d.height / 2
      const R = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 4
      const W = Math.max(vw, vh * AR)
      const H = W / AR
      const land = !mq.matches
      const xF = (vw - W) / 2
      const yF = H > vh ? Math.max(vh - H, Math.min((vh - H) * 0.3, vh - 0.7 * H)) : 0
      const fx = FOCUS.x * W
      const fy = FOCUS.y * H
      // Where the photo slides to once the copy panel opens
      const sx = land ? vw * 0.23 : 0
      const sy = land ? 0 : Math.min(0, vh * 0.52 - 12 - (yF + 0.665 * H))
      g.current = { cx, cy, r: d.width / 2, R, x0: cx - fx, y0: cy - fy, xF, yF, sx, sy, land }
      setImg({ w: W, h: H, ox: fx, oy: fy })
      setRing({ cx, cy, d: d.width })
      tick.set(tick.get() + 1)
    }

    measure()
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    mq.addEventListener('change', measure)

    const a = animate(intro, 1, { delay: 0.75, type: 'spring', stiffness: 140, damping: 11 })
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', measure)
      a.stop()
    }
  }, [tick, intro])

  const open = useTransform(p, [0, 0.58], [0, 1])
  const split = useTransform(p, [0.62, 0.8], [0, 1])

  const radius = useTransform([open, intro, tick] as MotionValue<number>[], ([o, i]: number[]) =>
    lerp(g.current.r * i, g.current.R, Math.pow(o, 2.3)),
  )
  const clip = useTransform([open, split, radius] as MotionValue<number>[], ([o, s, rad]: number[]) => {
    const G = g.current
    if (o < 1) return `circle(${rad.toFixed(1)}px at ${G.cx.toFixed(1)}px ${G.cy.toFixed(1)}px)`
    const e = easeInOut(s)
    return G.land ? `inset(0px 0px 0px ${(46 * e).toFixed(2)}%)` : `inset(0px 0px ${(48 * e).toFixed(2)}% 0px)`
  })
  const imgX = useTransform([open, split, tick] as MotionValue<number>[], ([o, s]: number[]) => {
    const G = g.current
    return lerp(G.x0, G.xF, easeInOut(o)) + G.sx * easeInOut(s)
  })
  const imgY = useTransform([open, split, tick] as MotionValue<number>[], ([o, s]: number[]) => {
    const G = g.current
    return lerp(G.y0, G.yF, easeInOut(o)) + G.sy * easeInOut(s)
  })
  const imgScale = useTransform(open, (o) => lerp(1.9, 1, easeInOut(o)))
  const ink = useTransform(open, [0.015, 0.14], [1, 0])

  // The growing dot pushes the letters apart
  const push = useTransform(radius, (rad) => Math.max(0, rad - g.current.r))
  const reX = useTransform(push, (v) => -v)
  const setX = push
  const markFade = useTransform(p, [0.2, 0.42], [1, 0])
  const introFade = useTransform(p, [0, 0.14], [1, 0])
  const introY = useTransform(p, [0, 0.14], [0, -30])
  const ringFade = useTransform(p, [0, 0.03], [1, 0])

  const copyO = useTransform(p, [0.72, 0.86], [0, 1])
  const copyY = useTransform(p, [0.72, 0.9], [40, 0])

  return (
    <section ref={sectionRef} id="top" className="hero" data-nav="light">
      <div ref={stageRef} className="hero__stage">
        {/* Intro: wordmark and supporting lines */}
        <motion.div className="hero__top" style={{ opacity: introFade, y: introY }}>
          <p>
            {hero.eyebrowLeft.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
          <p>
            {hero.eyebrowRight.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </p>
        </motion.div>

        <div className="hero__center">
          <motion.p
            className="hero__kicker"
            style={{ opacity: introFade, y: introY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1.2 }}
          >
            {hero.kicker}
          </motion.p>
          <h1 className="hero__mark mark">
            <span className="sr-only">re•set, BARRIER ceramide face cream</span>
            <motion.span className="hero__half" style={{ x: reX, opacity: markFade }} aria-hidden="true">
              <Letters text="re" delay={0.15} />
            </motion.span>
            <span ref={dotRef} className="hero__dot" aria-hidden="true" />
            <motion.span className="hero__half" style={{ x: setX, opacity: markFade }} aria-hidden="true">
              <Letters text="set" delay={0.36} />
            </motion.span>
          </h1>
        </div>

        <motion.div className="hero__bottom" style={{ opacity: introFade }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 1, ease: EASE }}
          >
            {hero.intro}
          </motion.p>
          <motion.span
            className="hero__cue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
          >
            <span className="hero__cue-line" />
            {hero.scroll}
          </motion.span>
        </motion.div>

        {/* Ripples around the dot while it waits */}
        <motion.span
          className="hero__ripple"
          aria-hidden="true"
          style={{ left: ring.cx, top: ring.cy, width: ring.d, height: ring.d, opacity: ringFade }}
        >
          <span />
          <span />
        </motion.span>

        {/* The photo lives inside the dot */}
        <motion.div className="hero__photo" style={{ clipPath: clip, WebkitClipPath: clip }}>
          <motion.img
            src={modelImg}
            alt="A woman holding a jar of re•set BARRIER ceramide face cream in warm sunlight"
            width={1230}
            height={1278}
            fetchPriority="high"
            style={{
              x: imgX,
              y: imgY,
              scale: imgScale,
              width: img.w || undefined,
              height: img.h || undefined,
              transformOrigin: `${img.ox}px ${img.oy}px`,
            }}
          />
          <motion.div className="hero__ink" style={{ opacity: ink }} />
        </motion.div>

        {/* Copy that appears once the photo slides aside */}
        <motion.div className="hero__copy" style={{ opacity: copyO, y: copyY }}>
          <span className="eyebrow">BARRIER, ceramide face cream</span>
          <h2 className="display hero__title">{hero.title}</h2>
          <p className="hero__lede hero__lede--full">{hero.lede}</p>
          <p className="hero__lede hero__lede--short">{hero.ledeShort}</p>
          <div className="hero__actions">
            <a href="#waitlist" className="btn" onClick={handleAnchorClick}>
              <span className="btn__dot" />
              Get early access
            </a>
            <a href="#inside" className="link-arrow" onClick={handleAnchorClick}>
              Look inside the jar <Arrow />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroStatic() {
  return (
    <section id="top" className="hero-static" data-nav="light">
      <div className="wrap hero-static__grid">
        <div className="hero-static__copy">
          <h1 className="hero-static__mark">
            <Wordmark />
            <span className="sr-only">, BARRIER ceramide face cream</span>
          </h1>
          <p className="hero__kicker">{hero.kicker}</p>
          <h2 className="display hero__title">{hero.title}</h2>
          <p className="hero__lede">{hero.lede}</p>
          <div className="hero__actions">
            <a href="#waitlist" className="btn" onClick={handleAnchorClick}>
              <span className="btn__dot" />
              Get early access
            </a>
            <a href="#inside" className="link-arrow" onClick={handleAnchorClick}>
              Look inside the jar <Arrow />
            </a>
          </div>
        </div>
        <img
          className="hero-static__img"
          src={modelImg}
          alt="A woman holding a jar of re•set BARRIER ceramide face cream in warm sunlight"
          width={1230}
          height={1278}
        />
      </div>
    </section>
  )
}
