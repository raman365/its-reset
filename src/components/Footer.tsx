import { links, nav } from '../content'
import { handleAnchorClick, scrollToTarget } from '../hooks/smoothScroll'
import { ArrowUpRight } from './Icons'
import './Footer.css'

export function Footer() {
  return (
    <footer className="foot" data-nav="dark">
      <div className="wrap">
        <div className="foot__cols">
          <div className="foot__lead">
            <p className="foot__line">A balm for long days, hard workouts and everyday stress.</p>
            <a className="foot__mail" href={`mailto:${links.email}`}>
              {links.email}
            </a>
          </div>
          <nav className="foot__col" aria-label="Explore">
            <p>Explore</p>
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={handleAnchorClick}>
                {n.label}
              </a>
            ))}
          </nav>
          <nav className="foot__col" aria-label="Company">
            <p>Company</p>
            <a href={links.contact} target="_blank" rel="noopener">
              Contact
            </a>
            <a href={links.privacy} target="_blank" rel="noopener">
              Privacy
            </a>
            <a href={links.terms} target="_blank" rel="noopener">
              Terms
            </a>
            <a href={links.refunds} target="_blank" rel="noopener">
              Refunds
            </a>
          </nav>
          <nav className="foot__col" aria-label="Follow">
            <p>Follow</p>
            <a href={links.instagram} target="_blank" rel="noopener">
              Instagram <ArrowUpRight size={12} />
            </a>
            <a href={links.tiktok} target="_blank" rel="noopener">
              TikTok <ArrowUpRight size={12} />
            </a>
          </nav>
        </div>
      </div>

      <div className="foot__mark mark" aria-hidden="true">
        <span>re</span>
        <button
          className="foot__dot"
          tabIndex={-1}
          data-cursor="Top"
          onClick={() => scrollToTarget(document.body)}
          aria-label="Back to top"
        />
        <span>set</span>
      </div>

      <div className="wrap foot__base">
        <span>© 2026 Reset Gilead Ltd. Made in the UK.</span>
        <button className="foot__top" onClick={() => scrollToTarget(document.body)}>
          Back to the start
        </button>
      </div>
    </footer>
  )
}
