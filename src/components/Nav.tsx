import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { nav } from '../content'
import { handleAnchorClick, resumeScroll, stopScroll } from '../hooks/smoothScroll'
import { Wordmark } from './Wordmark'
import './Nav.css'

export function Nav() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const update = () => {
      ticking = false
      const y = window.scrollY
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 400)
        last = y
      }
      setScrolled(y > 40)
      // Which section sits under the bar decides light or dark styling
      const els = document.elementsFromPoint(window.innerWidth / 2, 36)
      const section = els.find((el) => !el.closest('.nav') && el.closest('[data-nav]'))
      const theme = section?.closest<HTMLElement>('[data-nav]')?.dataset.nav
      setDark(theme === 'dark')
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (open) stopScroll()
    else resumeScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    resumeScroll()
    handleAnchorClick(e)
  }

  return (
    <header
      className="nav"
      data-hidden={hidden && !open}
      data-scrolled={scrolled}
      data-dark={dark && !open}
      data-open={open}
    >
      <div className="nav__bar">
        <a href="#top" className="nav__mark" onClick={go} aria-label="re•set, back to top">
          <Wordmark />
        </a>
        <nav className="nav__links" aria-label="Sections">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={go}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="nav__end">
          <a href="#waitlist" className="nav__cta" onClick={go}>
            <span className="nav__cta-dot" />
            Early access
          </a>
          <button
            className="nav__burger"
            aria-expanded={open}
            aria-controls="menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="menu"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          >
            <nav className="menu__links" aria-label="Menu">
              {[...nav, { label: 'Questions', href: '#faq' }].map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={go}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="menu__no">0{i + 1}</span>
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <motion.a
              href="#waitlist"
              className="btn"
              onClick={go}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="btn__dot" />
              Join the waitlist
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
