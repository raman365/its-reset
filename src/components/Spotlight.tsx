import { useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react'
import jarImg from '../assets/img/jar.webp'
import { cream } from '../content'
import { DappledLight } from './DappledLight'
import { Reveal, RevealWords } from './Reveal'
import './Spotlight.css'

export function Spotlight() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const wordX = useTransform(scrollYProgress, [0, 1], ['10%', '-14%'])
  const jarY = useTransform(scrollYProgress, [0, 1], [90, -90])

  const mx = useSpring(0, { stiffness: 50, damping: 16 })
  const my = useSpring(0, { stiffness: 50, damping: 16 })
  const jarX = useTransform(mx, (v) => v * 18)
  const jarTilt = useTransform(mx, (v) => v * 3)
  const jarYm = useTransform(my, (v) => v * 10)
  const wordMX = useTransform(mx, (v) => v * -30)

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
    my.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }

  return (
    <section
      ref={ref}
      id="cream"
      className="cream"
      data-nav="light"
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <DappledLight />

      <div className="wrap cream__head">
        <span className="eyebrow">{cream.eyebrow}</span>
        <span className="cream__meta hero-dots">
          <span>50ml</span>
          <span>Fragrance free</span>
          <span>Made in the UK</span>
        </span>
      </div>

      <div className="cream__stage">
        <motion.div className="cream__word" style={{ x: wordX }} aria-hidden="true">
          <motion.span style={{ x: wordMX }}>BARRIER</motion.span>
        </motion.div>

        <motion.div
          className="cream__jar"
          style={{ y: jarY }}
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div className="cream__float" style={{ x: jarX, y: jarYm, rotate: jarTilt }}>
            <div className="cream__bob">
              <img src={jarImg} alt="re•set BARRIER ceramide face cream, 50ml frosted glass jar" width={631} height={595} />
              {cream.hotspots.map((h, i) => (
                <div className="spot" key={h.title} style={{ left: `${h.x}%`, top: `${h.y}%` }}>
                  <button
                    className="spot__btn"
                    aria-expanded={active === i}
                    aria-label={h.title}
                    data-cursor="Look"
                    onClick={() => setActive(active === i ? null : i)}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                    onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
                    onBlur={() => setActive(null)}
                  >
                    <span />
                  </button>
                  <AnimatePresence>
                    {active === i && (
                      <motion.div
                        className={`spot__card ${h.x > 50 ? 'spot__card--r' : 'spot__card--l'}`}
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        role="note"
                      >
                        <strong>{h.title}</strong>
                        <span>{h.body}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
          <div className="cream__shadow" />
        </motion.div>
        {/* Small screens: the note sits under the jar instead of beside it */}
        <div className="cream__mcard" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {active === null ? (
              <motion.p
                key="hint"
                className="cream__hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="cream__hint-dot" /> Tap the dots on the jar
              </motion.p>
            ) : (
              <motion.div
                key={active}
                className="cream__note"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                <strong>{cream.hotspots[active].title}</strong>
                <span>{cream.hotspots[active].body}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="wrap cream__body">
        <div className="cream__intro">
          <RevealWords as="h2" className="display cream__title" text={cream.title} />
          <Reveal delay={0.2}>
            <p className="lede">{cream.sub}</p>
          </Reveal>
        </div>
        <ol className="cream__benefits">
          {cream.benefits.map((b, i) => (
            <Reveal key={b.title} delay={0.1 * i}>
              <li>
                <span className="cream__num">0{i + 1}</span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
