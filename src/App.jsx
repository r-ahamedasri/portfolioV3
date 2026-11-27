import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'
import { Analytics } from '@vercel/analytics/react'
import { useReducedMotion } from './lib.js'
import Preloader from './components/Preloader.jsx'
import Cursor from './components/Cursor.jsx'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Marquee from './components/Marquee.jsx'
import About from './components/About.jsx'
import Skills from './components/Skills.jsx'
import Projects from './components/Projects.jsx'
import Journey from './components/Journey.jsx'
import Certifications from './components/Certifications.jsx'
import Contact from './components/Contact.jsx'

export default function App() {
  const reduced = useReducedMotion()
  const [loading, setLoading] = useState(!reduced)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    window.__lenis = lenis
    let id
    const raf = (t) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
      window.__lenis = undefined
    }
  }, [reduced])

  useEffect(() => {
    if (loading) window.__lenis?.stop()
    else window.__lenis?.start()
    document.documentElement.classList.toggle('is-loading', loading)
  }, [loading])

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <AnimatePresence mode="wait">{loading && <Preloader key="pre" onDone={() => setLoading(false)} />}</AnimatePresence>
      <Nav ready={!loading} />
      <main>
        <Hero ready={!loading} />
        <Marquee />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Certifications />
        <Contact />
      </main>
      <Analytics />
    </>
  )
}
