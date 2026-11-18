import { useEffect, useRef, useState } from 'react'
import { useMedia } from '../hooks/useMedia'

const INTERACTIVE = 'a, button, summary, label, [role="slider"], [data-cursor]'

/** The brand dot as a cursor. Desktop pointers only. */
export function Cursor() {
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const reduce = useMedia('(prefers-reduced-motion: reduce)')
  const enabled = fine && !reduce
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!enabled) return
    const root = rootRef.current!
    const dot = dotRef.current!
    const ring = ringRef.current!
    document.documentElement.classList.add('has-cursor')

    let x = -100
    let y = -100
    let rx = x
    let ry = y
    let raf = 0

    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.classList.remove('is-hidden')
    }
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (!t || !t.closest) return
      const isText = !!t.closest('input, textarea')
      const hit = t.closest<HTMLElement>(INTERACTIVE)
      root.classList.toggle('is-text', isText)
      root.classList.toggle('is-hover', !!hit && !isText)
      const l = hit?.dataset.cursor ?? ''
      root.classList.toggle('has-label', !!l)
      setLabel(l)
    }
    const leave = () => root.classList.add('is-hidden')
    const loop = () => {
      rx += (x - rx) * 0.18
      ry += (y - ry) * 0.18
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={rootRef} className="cursor is-hidden" aria-hidden="true">
      <div ref={ringRef} className="cursor__ring">
        <span className="cursor__label">{label}</span>
      </div>
      <div ref={dotRef} className="cursor__dot" />
    </div>
  )
}
