import { useLayoutEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
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
  cx: number // dot centre within the stage
  cy: number
  r: number // dot radius
  R: number // radius that covers the whole stage
  s0: number // photo zoom while it sits inside the dot
  x0: number // photo position inside the dot
  y0: number
  xF: number // photo position once it fills the screen
  yF: number
  xS: number // photo position and zoom once the copy panel opens
  yS: number
  sS: number
  panel: number // how far the photo panel slides to make room for the copy
  land: boolean
}

type Layout = { vw: number; vh: number; cx: number; cy: number; R: number; w: number; h: number; ox: number; oy: number; d: number }

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

/**
 * The reveal only ever animates transforms and opacity, so the browser can
 * hand it to the GPU. A round, overflow-hidden "dot" is scaled up from the
 * logo while the photo inside it is scaled down by the same amount, which
 * keeps the photo still while the window around it grows. No clip-path, no
 * repaints per frame, which is what keeps it smooth on phones.
 */
function HeroPinned() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const g = useRef<Geo>({
    cx: 0, cy: 0, r: 0, R: 1, s0: 1.9, x0: 0, y0: 0, xF: 0, yF: 0, xS: 0, yS: 0, sS: 1, panel: 0, land: true,
  })
  const [L, setL] = useState<Layout>({ vw: 0, vh: 0, cx: -999, cy: -999, R: 0, w: 0, h: 0, ox: 0, oy: 0, d: 0 })

  const tick = useMotionValue(0)
  const intro = useMotionValue(0)
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useLayoutEffect(() => {
    const stage = stageRef.current
    const dot = dotRef.current
    if (!stage || !dot) return
    // Same query as the CSS that moves the copy under the photo
    const portrait = window.matchMedia('(max-aspect-ratio: 21/20)')
    const coarse = window.matchMedia('(pointer: coarse)')

    const measure = () => {
      const s = stage.getBoundingClientRect()
      const d = dot.getBoundingClientRect()
      const vw = s.width
      const vh = s.height
      if (!vw || !vh) return
      const cx = d.left - s.left + d.width / 2
      const cy = d.top - s.top + d.height / 2
      const R = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 4
      const W = Math.max(vw, vh * AR)
      const H = W / AR
      const land = !portrait.matches
      const fx = FOCUS.x * W
      const fy = FOCUS.y * H
      const xF = (vw - W) / 2
      const yF = H > vh ? Math.max(vh - H, Math.min((vh - H) * 0.3, vh - 0.7 * H)) : 0
      // Less zoom on phones: same effect, far smaller image texture
      const s0 = coarse.matches ? 1.35 : 1.9

      let panel: number, xS: number, yS: number, sS: number
      if (land) {
        panel = vw * 0.46
        xS = xF + vw * 0.23
        yS = yF
        sS = 1
      } else {
        // Give the copy exactly the room it needs, then fit forehead to jar
        // into whatever is left above it
        const copyH = copyRef.current?.offsetHeight ?? vh * 0.48
        panel = Math.min(0.62, Math.max(0.34, copyH / vh)) * vh
        const region = vh - panel
        sS = Math.max((vw / W) * 1.02, Math.min(1, (region - 16) / (0.53 * H)))
        xS = vw / 2 - fx
        yS = region / 2 - fy - (0.405 * H - fy) * sS
      }

      g.current = { cx, cy, r: d.width / 2, R, s0, x0: cx - fx, y0: cy - fy, xF, yF, xS, yS, sS, panel, land }
      setL({ vw, vh, cx, cy, R, w: W, h: H, ox: fx, oy: fy, d: d.width })
      tick.set(tick.get() + 1)
    }

    measure()
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    if (copyRef.current) ro.observe(copyRef.current)
    portrait.addEventListener('change', measure)

    // Pop the dot in once the photo is decoded, so the first scroll never
    // stalls on image decoding
    let anim: ReturnType<typeof animate> | undefined
    let cancelled = false
    const decoded = imgRef.current?.decode?.().catch(() => undefined) ?? Promise.resolve()
    Promise.race([decoded, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (!cancelled) anim = animate(intro, 1, { delay: 0.6, type: 'spring', stiffness: 140, damping: 11 })
    })
    return () => {
      cancelled = true
      ro.disconnect()
      portrait.removeEventListener('change', measure)
      anim?.stop()
    }
  }, [tick, intro])

  const open = useTransform(p, [0, 0.58], [0, 1])
  const split = useTransform(p, [0.62, 0.8], [0, 1])
  const M = [open, split, intro, tick] as MotionValue<number>[]

  // Size of the dot window as a fraction of its full size
  const dotScale = useTransform(M, ([o, , i]: number[]) => {
    const G = g.current
    return Math.max(0.0005, lerp(G.r * i, G.R, Math.pow(o, 2.3)) / G.R)
  })
  const undoScale = useTransform(dotScale, (v) => 1 / v)

  const imgX = useTransform(M, ([o, s]: number[]) => {
    const G = g.current
    return lerp(lerp(G.x0, G.xF, easeInOut(o)), G.xS, easeInOut(s))
  })
  const imgY = useTransform(M, ([o, s]: number[]) => {
    const G = g.current
    return lerp(lerp(G.y0, G.yF, easeInOut(o)), G.yS, easeInOut(s))
  })
  const imgScale = useTransform(M, ([o, s]: number[]) => {
    const G = g.current
    return lerp(lerp(G.s0, 1, easeInOut(o)), G.sS, easeInOut(s))
  })
  const ink = useTransform(open, [0.015, 0.14], [1, 0])

  // The photo panel slides aside (right on wide screens, up on tall ones)
  const panelX = useTransform(M, ([, s]: number[]) => (g.current.land ? g.current.panel * easeInOut(s) : 0))
  const panelY = useTransform(M, ([, s]: number[]) => (g.current.land ? 0 : -g.current.panel * easeInOut(s)))
  const unX = useTransform(panelX, (v) => -v)
  const unY = useTransform(panelY, (v) => -v)

  // The growing dot pushes the letters apart
  const push = useTransform(dotScale, (v) => Math.max(0, v * g.current.R - g.current.r))
  const reX = useTransform(push, (v) => -v)
  const setX = push
  const markFade = useTransform(p, [0.2, 0.42], [1, 0])
  const introFade = useTransform(p, [0, 0.14], [1, 0])
  const introY = useTransform(p, [0, 0.14], [0, -30])
  const ringFade = useTransform(p, [0, 0.03], [1, 0])

  useMotionValueEvent(p, 'change', (v) => {
    const el = stageRef.current
    if (el) el.toggleAttribute('data-intro-done', v > 0.16)
  })

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
          style={{ left: L.cx, top: L.cy, width: L.d, height: L.d, opacity: ringFade }}
        >
          <span />
          <span />
        </motion.span>

        {/* The photo lives inside the dot */}
        <motion.div className="hero__photo" style={{ x: panelX, y: panelY }}>
          <motion.div className="hero__unshift" style={{ x: unX, y: unY }}>
            <motion.div
              className="hero__window"
              style={{ left: L.cx - L.R, top: L.cy - L.R, width: L.R * 2, height: L.R * 2, scale: dotScale }}
            >
              <motion.div
                className="hero__inner"
                style={{
                  left: L.R - L.cx,
                  top: L.R - L.cy,
                  width: L.vw,
                  height: L.vh,
                  scale: undoScale,
                  transformOrigin: `${L.cx}px ${L.cy}px`,
                }}
              >
                <motion.img
                  ref={imgRef}
                  src={modelImg}
                  alt="A woman holding a jar of re•set BARRIER ceramide face cream in warm sunlight"
                  width={1230}
                  height={1278}
                  decoding="async"
                  fetchPriority="high"
                  style={{
                    x: imgX,
                    y: imgY,
                    scale: imgScale,
                    width: L.w || undefined,
                    height: L.h || undefined,
                    transformOrigin: `${L.ox}px ${L.oy}px`,
                  }}
                />
                <motion.div className="hero__ink" style={{ opacity: ink }} />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Copy that appears once the photo slides aside */}
        <motion.div ref={copyRef} className="hero__copy" style={{ opacity: copyO, y: copyY }}>
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
