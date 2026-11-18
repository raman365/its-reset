import { ingredients } from '../content'
import { IngredientArt } from './IngredientArt'
import { Reveal, RevealWords } from './Reveal'
import './Ingredients.css'

export function Ingredients() {
  return (
    <section id="inside" className="section ing" data-nav="light">
      <div className="wrap">
        <div className="ing__head">
          <div className="ing__head-l">
            <span className="eyebrow">What’s inside</span>
            <RevealWords as="h2" className="display ing__title" text="A short list, chosen on purpose" />
          </div>
          <Reveal delay={0.15}>
            <p className="lede">
              BARRIER is built around four ingredients. Here’s what each one is, where it comes from and why it’s in
              the jar.
            </p>
          </Reveal>
        </div>

        <div className="ing__grid">
          {ingredients.map((g, i) => (
            <Reveal key={g.no} delay={i * 0.08} className="ing__cell">
              <article className="ing__card" tabIndex={0}>
                <header className="ing__top">
                  <span>No. {g.no}</span>
                  <span className="ing__tag">{g.knownFor}</span>
                </header>
                <div className="ing__art">
                  <IngredientArt kind={g.art} />
                </div>
                <div className="ing__text">
                  <h3 className="ing__name">{g.name}</h3>
                  <p className="ing__latin">{g.latin}</p>
                  <p className="ing__body">{g.body}</p>
                </div>
                <footer className="ing__origin">
                  <span>Origin</span>
                  {g.origin}
                </footer>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="ing__free">
          <span>Fragrance free</span>
          <span>Cruelty free</span>
          <span>Made in the UK</span>
          <span>50ml frosted glass</span>
        </Reveal>
      </div>
    </section>
  )
}
