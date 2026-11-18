import Lenis from 'lenis'

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (typeof window === 'undefined') return () => {}
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Touch scrolling is already smooth and Lenis doesn't touch it, so on phones
  // it would only add a loop running every frame. Leave it off there.
  const touch = window.matchMedia('(pointer: coarse)').matches
  if (reduce || touch) return () => {}
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, autoRaf: true })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

/** Scroll to a selector or element, smoothly when Lenis is running. */
export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.6 })
  } else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

export function stopScroll() {
  lenis?.stop()
  if (!lenis) document.documentElement.style.overflow = 'hidden'
}

export function resumeScroll() {
  lenis?.start()
  document.documentElement.style.overflow = ''
}

/** Intercept in-page anchor clicks so they use the smooth scroller. */
export function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href')
  if (!href || !href.startsWith('#')) return
  e.preventDefault()
  scrollToTarget(href === '#top' ? document.body : href)
  history.replaceState(null, '', href)
}
