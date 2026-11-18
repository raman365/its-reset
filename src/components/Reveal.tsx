import { useRef, type ElementType, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1] as const

export function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Splits a line into words that rise out of a mask, one after another. */
export function RevealWords({
  text,
  as = 'h2',
  className = '',
  delay = 0,
  stagger = 0.05,
}: {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
  stagger?: number
}) {
  const Tag = as as ElementType
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' })
  const reduce = useReducedMotion()
  const words = text.split(' ')
  return (
    <Tag ref={ref} className={`rw ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="rw__mask" aria-hidden="true">
            <motion.span
              className="rw__word"
              initial={reduce ? false : { y: '115%' }}
              animate={inView || reduce ? { y: '0%' } : undefined}
              transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
