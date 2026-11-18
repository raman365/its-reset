import jarSm from '../assets/img/jar-320.webp'
import { founder } from '../content'
import { Reveal, RevealWords } from './Reveal'
import './Founder.css'

export function Founder() {
  return (
    <section id="founder" className="section founder" data-nav="light">
      <div className="wrap founder__grid">
        <div className="founder__l">
          <span className="eyebrow">{founder.eyebrow}</span>
          <div className="founder__quote">
            <span className="founder__mark" aria-hidden="true">
              “
            </span>
            <RevealWords as="p" className="display founder__pull" text={founder.pull} stagger={0.035} />
          </div>
        </div>
        <Reveal className="founder__r" delay={0.15}>
          {founder.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <div className="founder__sign">
            <span className="founder__badge">
              <img src={jarSm} alt="" width={320} height={302} loading="lazy" />
            </span>
            <span>
              <span className="founder__sig">{founder.sign}</span>
              <span className="founder__sub">Reset Gilead Ltd, United Kingdom</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
