import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import modelImg from '../assets/img/model.webp'
import { hero } from '../content'
import { handleAnchorClick } from '../hooks/smoothScroll'
import { applyFrame, buildCss, frame, measureGeo, supportsScrollDriven, type Geo } from './heroTimeline'
import { Arrow } from './Icons'
import { Wordmark } from './Wordmark'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1] as const

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
 * The logo's dot opens onto the campaign photo as you scroll.
 *
 * Only transforms and opacity ever change. A round, overflow-hidden window is
 * scaled up from the dot while the photo inside it is scaled down by the same
 * amount, so the photo holds still while the window around it grows.
 *
 * Where the browser supports CSS scroll-driven animations (Safari 26+, Chrome,
 * Edge) the whole sequence is generated as keyframes on the page's scroll
 * timeline and no JavaScript runs while scrolling. Elsewhere a scroll
 * listener applies the same frames.
 */
function HeroPinned() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const els = useRef<Record<string, HTMLElement | null>>({})
  const ref = (k: string) => (el: HTMLElement | null) => {
    els.current[k] = el
  }
  const [sda] = useState(supportsScrollDriven)
  const [css, setCss] = useState('')
  const [popped, setPopped] = useState(false)
  const [L, setL] = useState<Layout>({ vw: 0, vh: 0, cx: -999, cy: -999, R: 0, w: 0, h: 0, ox: 0, oy: 0, d: 0 })

  useLayoutEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const dot = dotRef.current
    if (!section || !stage || !dot) return
    // Same query as the CSS that moves the copy under the photo
    const portrait = window.matchMedia('(max-aspect-ratio: 21/20)')
    const coarse = window.matchMedia('(pointer: coarse)')
    let G: Geo | null = null
    // The pinned stretch is the section minus the stage. Both use units that
    // don't change when Safari's toolbars collapse, so neither does this.
    let start = 0
    let distance = 1

    const update = () => {
      if (!G) return
      const p = Math.min(1, Math.max(0, (window.scrollY - start) / distance))
      stage.toggleAttribute('data-intro-done', p > 0.16)
      if (!sda) applyFrame(els.current, frame(G, p))
    }

    const measure = () => {
      const s = stage.getBoundingClientRect()
      const d = dot.getBoundingClientRect()
      if (!s.width || !s.height) return
      G = measureGeo({
        vw: s.width,
        vh: s.height,
        cx: d.left - s.left + d.width / 2,
        cy: d.top - s.top + d.height / 2,
        r: d.width / 2,
        land: !portrait.matches,
        coarse: coarse.matches,
        copyH: els.current.copy?.offsetHeight ?? s.height * 0.48,
      })
      start = section.getBoundingClientRect().top + window.scrollY
      distance = Math.max(1, section.offsetHeight - stage.offsetHeight)
      setL({ vw: G.vw, vh: G.vh, cx: G.cx, cy: G.cy, R: G.R, w: G.W, h: G.H, ox: G.fx, oy: G.fy, d: d.width })
      if (sda) setCss(buildCss(G, start, distance))
      update()
    }

    let raf = 0
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), update()))
    }

    measure()
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(stage)
    if (els.current.copy) ro.observe(els.current.copy)
    portrait.addEventListener('change', measure)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Pop the dot in once the photo is decoded, so nothing stalls on it later
    let cancelled = false
    const decoded = imgRef.current?.decode?.().catch(() => undefined) ?? Promise.resolve()
    Promise.race([decoded, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      if (!cancelled) setTimeout(() => !cancelled && setPopped(true), 450)
    })

    return () => {
      cancelled = true
      ro.disconnect()
      portrait.removeEventListener('change', measure)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [sda])

  return (
    <section ref={sectionRef} id="top" className={`hero ${sda ? 'hero--sda' : ''}`} data-nav="light">
      {sda && <style>{css}</style>}
      <div ref={stageRef} className="hero__stage">
        {/* Intro: wordmark and supporting lines */}
        <div className="hero__top" ref={ref('top')} data-sa="">
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
        </div>

        <div className="hero__center">
          <p className="hero__kicker" ref={ref('kicker')} data-sa="">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1.2 }}>
              {hero.kicker}
            </motion.span>
          </p>
          <h1 className="hero__mark mark">
            <span className="sr-only">re•set, BARRIER ceramide face cream</span>
            <span className="hero__half hero__half--re" ref={ref('re')} data-sa="" aria-hidden="true">
              <Letters text="re" delay={0.15} />
            </span>
            <span ref={dotRef} className="hero__dot" aria-hidden="true" />
            <span className="hero__half hero__half--set" ref={ref('set')} data-sa="" aria-hidden="true">
              <Letters text="set" delay={0.36} />
            </span>
          </h1>
        </div>

        <div className="hero__bottom" ref={ref('bottom')} data-sa="">
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
        </div>

        {/* Ripples around the dot while it waits */}
        <span
          className="hero__ripple"
          ref={ref('ring')}
          data-sa=""
          aria-hidden="true"
          style={{ left: L.cx, top: L.cy, width: L.d, height: L.d }}
        >
          <span />
          <span />
        </span>

        {/* The photo lives inside the dot */}
        <div className="hero__photo" ref={ref('photo')} data-sa="">
          <div className="hero__unshift" ref={ref('unshift')} data-sa="">
            <div
              className={`hero__pop ${popped ? 'is-in' : ''}`}
              style={{ transformOrigin: `${L.cx}px ${L.cy}px` }}
            >
              <div
                className="hero__window"
                ref={ref('window')}
                data-sa=""
                style={{ left: L.cx - L.R, top: L.cy - L.R, width: L.R * 2, height: L.R * 2 }}
              >
                <div
                  className="hero__inner"
                  ref={ref('inner')}
                  data-sa=""
                  style={{
                    left: L.R - L.cx,
                    top: L.R - L.cy,
                    width: L.vw,
                    height: L.vh,
                    transformOrigin: `${L.cx}px ${L.cy}px`,
                  }}
                >
                  <img
                    ref={(el) => {
                      imgRef.current = el
                      els.current.img = el
                    }}
                    data-sa=""
                    src={modelImg}
                    alt="A woman holding a jar of re•set BARRIER ceramide face cream in warm sunlight"
                    width={1230}
                    height={1278}
                    decoding="async"
                    fetchPriority="high"
                    style={{
                      width: L.w || undefined,
                      height: L.h || undefined,
                      transformOrigin: `${L.ox}px ${L.oy}px`,
                    }}
                  />
                  <div className="hero__ink" ref={ref('ink')} data-sa="" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copy that appears once the photo has slid aside */}
        <div className="hero__copy" ref={ref('copy')} data-sa="">
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
        </div>
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
