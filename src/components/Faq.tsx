import { useState } from 'react'
import { faq, links } from '../content'
import { Reveal, RevealWords } from './Reveal'
import './Faq.css'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="section faq" data-nav="light">
      <div className="wrap faq__grid">
        <div className="faq__side">
          <span className="eyebrow">Questions</span>
          <RevealWords as="h2" className="display faq__title" text="Good to know" />
          <p className="faq__mail">
            Something else on your mind?
            <br />
            <a href={`mailto:${links.email}`}>{links.email}</a>
          </p>
        </div>
        <Reveal className="faq__list">
          {faq.map((f, i) => {
            const isOpen = open === i
            return (
              <div className="faq__item" key={f.q} data-open={isOpen}>
                <h3 className="faq__q">
                  <button aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                    <span className="faq__n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq__qt">{f.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-${i}`} className="faq__a" role="region" aria-hidden={!isOpen}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
