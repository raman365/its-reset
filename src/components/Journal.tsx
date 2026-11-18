import { journal, links, type Article } from '../content'
import { ArrowUpRight } from './Icons'
import { Reveal, RevealWords } from './Reveal'
import './Journal.css'

function Cover({ kind }: { kind: Article['cover'] }) {
  if (kind === 'gilead')
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="300" fill="#2b231d" />
        <circle cx="262" cy="150" r="46" fill="#d8bf91" className="cover-sun" />
        <circle cx="262" cy="150" r="90" fill="#d8bf91" opacity="0.08" />
        <path d="M0 210 Q70 160 140 196 T280 186 T400 200 V300 H0Z" fill="#3a2f27" />
        <path d="M0 236 Q90 200 170 230 T330 222 T400 232 V300 H0Z" fill="#4a3c31" />
        <path d="M0 262 Q110 240 210 258 T400 256 V300 H0Z" fill="#5a4a3c" />
        {[60, 90, 118].map((x, i) => (
          <circle key={x} cx={x} cy={252 - i * 2} r="2.4" fill="#d8bf91" opacity="0.8" />
        ))}
      </svg>
    )
  if (kind === 'routine')
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="300" fill="#ece1d3" />
        <path d="M40 220 Q200 40 360 220" fill="none" stroke="#1b1815" strokeOpacity="0.25" strokeDasharray="2 7" strokeLinecap="round" />
        <line x1="0" x2="400" y1="220" y2="220" stroke="#1b1815" strokeOpacity="0.18" />
        <circle cx="72" cy="183" r="7" fill="#1b1815" />
        <circle cx="262" cy="139" r="7" fill="#1b1815" />
        <circle cx="331" cy="190" r="7" fill="#1b1815" />
        <circle cx="200" cy="130" r="26" fill="#d9a84e" className="cover-sun" />
      </svg>
    )
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill="#f3e4ca" />
      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * 76 - (r % 2 ? 38 : 0) - 10}
            y={r * 38 + 4}
            width="70"
            height="32"
            rx="8"
            fill={(r + c) % 3 === 0 ? '#dfbea2' : '#e7c8ad'}
          />
        )),
      )}
      <circle cx="200" cy="150" r="30" fill="#1b1815" className="cover-sun" />
    </svg>
  )
}

export function Journal() {
  return (
    <section id="journal" className="section journal" data-nav="light">
      <div className="wrap">
        <div className="journal__head">
          <div>
            <span className="eyebrow">From the journal</span>
            <RevealWords as="h2" className="display journal__title" text="Notes on skin, training and taking care" />
          </div>
          <a className="link-arrow" href={links.journal} target="_blank" rel="noopener">
            Read the journal <ArrowUpRight />
          </a>
        </div>
        <div className="journal__grid">
          {journal.map((a, i) => (
            <Reveal key={a.href} delay={i * 0.1}>
              <a className="post" href={a.href} target="_blank" rel="noopener" data-cursor="Read">
                <div className="post__cover">
                  <Cover kind={a.cover} />
                </div>
                <div className="post__meta">
                  <span>{a.date}</span>
                  <span>{a.minutes} min read</span>
                </div>
                <h3 className="post__title">{a.title}</h3>
                <p className="post__excerpt">{a.excerpt}</p>
                <span className="post__more">
                  Read article <ArrowUpRight />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
