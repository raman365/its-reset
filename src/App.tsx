import { useEffect } from 'react'
import { marquee } from './content'
import { pauseOffscreen } from './hooks/pauseOffscreen'
import { startSmoothScroll } from './hooks/smoothScroll'
import { BarrierLab } from './components/BarrierLab'
import { Cursor } from './components/Cursor'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Founder } from './components/Founder'
import { Hero } from './components/Hero'
import { Ingredients } from './components/Ingredients'
import { Journal } from './components/Journal'
import { Marquee } from './components/Marquee'
import { Nav } from './components/Nav'
import { Ritual } from './components/Ritual'
import { Spotlight } from './components/Spotlight'
import { Story } from './components/Story'
import { Waitlist } from './components/Waitlist'
import './components/shared.css'

export default function App() {
  useEffect(() => startSmoothScroll(), [])
  useEffect(() => pauseOffscreen(), [])
  return (
    <>
      <a className="skip" href="#cream">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Marquee items={marquee} />
        <Spotlight />
        <Ingredients />
        <BarrierLab />
        <Ritual />
        <Story />
        <Founder />
        <Journal />
        <Waitlist />
        <Faq />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
      <Cursor />
    </>
  )
}
