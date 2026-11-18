import './Marquee.css'

export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="marquee" data-nav="dark" role="presentation">
      <p className="sr-only">{items.join(', ')}</p>
      <div className="marquee__track" aria-hidden="true">
        {[0, 1].map((k) => (
          <div className="marquee__group" key={k}>
            {items.map((t, i) => (
              <span className="marquee__item" key={t} data-alt={i % 3 === 2 || undefined}>
                {t}
                <span className="marquee__dot" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
