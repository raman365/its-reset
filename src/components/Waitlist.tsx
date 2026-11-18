import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import jarImg from '../assets/img/jar.webp'
import { waitlist } from '../content'
import { Reveal, RevealWords } from './Reveal'
import './Waitlist.css'

// Set VITE_SHOPIFY_STORE=https://itsreset.com to send sign-ups to the
// store's existing customer list. Without it the form runs in demo mode.
const STORE = (import.meta.env.VITE_SHOPIFY_STORE as string | undefined)?.replace(/\/$/, '')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Waitlist() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const sent = useRef(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget)
    const email = String(data.get('contact[email]') ?? '').trim()
    setName(String(data.get('contact[first_name]') ?? '').trim())
    if (!EMAIL.test(email)) {
      e.preventDefault()
      setError('That email doesn’t look quite right.')
      return
    }
    setError('')
    setStatus('sending')
    if (STORE) {
      // Let the browser post the form into the hidden frame below
      sent.current = true
      return
    }
    e.preventDefault()
    window.setTimeout(() => setStatus('done'), 900)
  }

  return (
    <section id="waitlist" className="waitlist" data-nav="dark">
      <div className="wrap waitlist__grid">
        <div className="waitlist__copy">
          <span className="eyebrow">{waitlist.eyebrow}</span>
          <RevealWords as="h2" className="display waitlist__title" text={waitlist.title} />
          <Reveal delay={0.1}>
            <p className="waitlist__body">{waitlist.body}</p>
          </Reveal>
          <Reveal delay={0.18}>
            <ul className="waitlist__perks">
              {waitlist.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="waitlist__formwrap">
              <AnimatePresence mode="wait" initial={false}>
                {status !== 'done' ? (
                  <motion.form
                    key="form"
                    className="waitlist__form"
                    method="post"
                    action={STORE ? `${STORE}/contact#contact_form` : undefined}
                    target={STORE ? 'waitlist-frame' : undefined}
                    acceptCharset="UTF-8"
                    onSubmit={onSubmit}
                    noValidate
                    exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                    transition={{ duration: 0.4 }}
                  >
                    <input type="hidden" name="form_type" value="customer" />
                    <input type="hidden" name="utf8" value="✓" />
                    <input type="hidden" name="contact[tags]" value="newsletter" />
                    <label className="field">
                      <span className="sr-only">First name</span>
                      <input name="contact[first_name]" placeholder="First name" autoComplete="given-name" />
                    </label>
                    <label className="field field--email">
                      <span className="sr-only">Email address</span>
                      <input
                        name="contact[email]"
                        type="email"
                        placeholder="name@email.com"
                        autoComplete="email"
                        required
                        aria-invalid={!!error}
                        aria-describedby="waitlist-note"
                      />
                    </label>
                    <button className="btn btn--light" type="submit" disabled={status === 'sending'}>
                      <span className="btn__dot" />
                      {status === 'sending' ? 'Adding you…' : waitlist.cta}
                    </button>
                    <p id="waitlist-note" className={`waitlist__note ${error ? 'is-error' : ''}`} role={error ? 'alert' : undefined}>
                      {error || waitlist.note}
                    </p>
                  </motion.form>
                ) : (
                  <motion.div
                    key="done"
                    className="waitlist__done"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    role="status"
                  >
                    <motion.span
                      className="waitlist__done-dot"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.15 }}
                    />
                    <div>
                      <p className="waitlist__done-title">{waitlist.success(name)}</p>
                      <p className="waitlist__done-body">{waitlist.successBody}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
          {STORE && (
            <iframe
              name="waitlist-frame"
              title="Waitlist sign up"
              className="sr-only"
              tabIndex={-1}
              onLoad={() => {
                if (sent.current) setStatus('done')
              }}
            />
          )}
        </div>

        <div className="waitlist__visual" aria-hidden="true">
          <div className="waitlist__halo" />
          <svg className="waitlist__ring" viewBox="0 0 400 400">
            <defs>
              <path id="ring-path" d="M200 200 m-170 0 a170 170 0 1 1 340 0 a170 170 0 1 1 -340 0" />
            </defs>
            <text>
              <textPath href="#ring-path" startOffset="0" textLength="1060" lengthAdjust="spacing">
                Founding member • Early access • Made in the UK • Founding member • Early access • Made in the UK •
              </textPath>
            </text>
          </svg>
          <img className="waitlist__jar" src={jarImg} alt="" width={631} height={595} loading="lazy" />
        </div>
      </div>
    </section>
  )
}
