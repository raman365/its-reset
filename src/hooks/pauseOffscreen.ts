/**
 * Pauses CSS (and SVG) animations in sections that are off screen, so the
 * page only ever animates what you can see. Without this, looping effects
 * further down keep the browser busy while you scroll the hero.
 */
export function pauseOffscreen() {
  const targets = document.querySelectorAll<HTMLElement>('main > section, main > .marquee, footer.foot')
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        if (e.isIntersecting) el.removeAttribute('data-offscreen')
        else el.setAttribute('data-offscreen', '')
        el.querySelectorAll<SVGSVGElement>('svg[data-smil]').forEach((svg) => {
          if (e.isIntersecting) svg.unpauseAnimations()
          else svg.pauseAnimations()
        })
      }
    },
    { rootMargin: '15% 0px' },
  )
  targets.forEach((t) => io.observe(t))
  return () => io.disconnect()
}
