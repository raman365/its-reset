import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { story } from '../content'
import { Reveal } from './Reveal'
import './Story.css'

function Word({ children, p, range }: { children: string; p: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(p, range, [0.14, 1])
  return (
    <motion.span style={{ opacity }} className="story__w">
      {children}
    </motion.span>
  )
}

function TimelineItem({ item, i, n, p }: { item: (typeof story.timeline)[number]; i: number; n: number; p: MotionValue<number> }) {
  const at = i / (n - 1)
  const lit = useTransform(p, [at - 0.05, at + 0.02], [0, 1])
  const scale = useTransform(lit, [0, 1], [0.6, 1])
  const textO = useTransform(lit, [0, 1], [0.35, 1])
  return (
    <li className="tl__item">
      <motion.span className="tl__node" style={{ scale }}>
        <motion.span className="tl__node-fill" style={{ opacity: lit }} />
      </motion.span>
      <motion.div style={{ opacity: textO }}>
        <p className="tl__when">{item.when}</p>
        <p className="tl__body">{item.body}</p>
      </motion.div>
    </li>
  )
}

export function Story() {
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const tlRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress: qp } = useScroll({ target: quoteRef, offset: ['start 0.85', 'end 0.45'] })
  const { scrollYProgress: tp } = useScroll({ target: tlRef, offset: ['start 0.85', 'end 0.55'] })
  const words = story.quote.split(' ')

  const gx = useSpring(0, { stiffness: 40, damping: 20 })
  const gy = useSpring(0, { stiffness: 40, damping: 20 })
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    gx.set(e.clientX - r.left)
    gy.set(e.clientY - r.top)
  }

  return (
    <section id="story" className="story" data-nav="dark" onPointerMove={onMove}>
      <motion.div className="story__glow" style={{ x: gx, y: gy }} aria-hidden="true" />
      <div className="story__gilead" aria-hidden="true">
        Gilead
      </div>
      <div className="wrap story__inner">
        <span className="eyebrow">{story.eyebrow}</span>
        <blockquote ref={quoteRef} className="story__quote">
          <span className="story__mark" aria-hidden="true">
            “
          </span>
          <span className="sr-only">{story.quote}</span>
          <span aria-hidden="true">
            {words.map((w, i) => (
              <span key={i}>
                <Word p={qp} range={[i / words.length, (i + 1) / words.length]}>
                  {w}
                </Word>{' '}
              </span>
            ))}
          </span>
        </blockquote>
        <p className="story__cite">{story.cite}</p>

        <div className="story__cols">
          {[story.what, story.why].map((b, i) => (
            <Reveal key={b.title} delay={i * 0.12} className="story__col">
              <h3>{b.title}</h3>
              <p>{b.body}</p>
            </Reveal>
          ))}
        </div>

        <div className="tl">
          <p className="tl__title">The balm through history</p>
          <div className="tl__track">
            <span className="tl__line" aria-hidden="true">
              <motion.span style={{ scaleX: tp }} className="tl__line-fill tl__line-fill--x" />
              <motion.span style={{ scaleY: tp }} className="tl__line-fill tl__line-fill--y" />
            </span>
            <ol ref={tlRef} className="tl__list">
              {story.timeline.map((item, i) => (
                <TimelineItem key={item.when} item={item} i={i} n={story.timeline.length} p={tp} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
