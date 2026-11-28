import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import { journey } from '../data.js'
import { useMedia, easeOut } from '../lib.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'

const tints = ['67,97,255', '255,106,61', '139,92,246', '45,212,191', '255,106,61', '67,97,255', '45,212,191']

function Milestone({ j, i }) {
  return (
    <article className="jcard" style={{ '--tint': tints[i % tints.length] }}>
      <span className="jcard-node" aria-hidden="true" />
      <div className="jcard-top">
        <span className="jcard-num tnum">{String(i + 1).padStart(2, '0')}</span>
        <span className="stk-tag">{j.tag}</span>
      </div>
      <div className="jcard-body">
        <span className="stk-when tnum">{j.when}</span>
        <h3>{j.title}</h3>
        <span className="stk-org">{j.org}</span>
        <p className="muted">{j.detail}</p>
      </div>
    </article>
  )
}

const Head = () => (
  <>
    <Eyebrow index="Education & milestones">Journey</Eyebrow>
    <RevealLines className="h-xl" lines={[<>Path <em>so far</em></>]} />
  </>
)

// Fraction of a viewport the section stays pinned and still before and after sliding.
const HOLD = 0.4

function Horizontal() {
  const section = useRef(null)
  const track = useRef(null)
  const [dist, setDist] = useState(0)
  const [hold, setHold] = useState(0)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth))
      setHold(Math.round(window.innerHeight * HOLD))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track.current)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  // Scroll range = hold + slide + hold. Map it to 0..1 slide progress with flat ends.
  const range = dist + hold * 2
  const toSlide = (v) => (dist ? Math.min(1, Math.max(0, (v * range - hold) / dist)) : 0)

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const slide = useTransform(scrollYProgress, toSlide)
  const smooth = useSpring(slide, { stiffness: 120, damping: 30, mass: 0.3 })
  const x = useTransform(smooth, (v) => -v * dist)
  useMotionValueEvent(slide, 'change', (v) => setActive(Math.min(journey.length - 1, Math.round(v * (journey.length - 1)))))

  return (
    <div className="hz" ref={section} style={{ height: `calc(100vh + ${range}px)` }}>
      <div className="hz-sticky">
        <div className="container hz-head">
          <div><Head /></div>
          <div className="hz-progress">
            <span className="tnum">{String(active + 1).padStart(2, '0')} / {String(journey.length).padStart(2, '0')}</span>
            <div className="hz-bar"><motion.span style={{ scaleX: smooth }} /></div>
          </div>
        </div>
        <motion.div className="hz-track jtrack" ref={track} style={{ x }}>
          <span className="jrail" aria-hidden="true"><motion.span style={{ scaleX: smooth }} /></span>
          {journey.map((j, i) => <Milestone key={j.title} j={j} i={i} />)}
          <div className="hz-end">
            <p>Still writing it.</p>
            <a href="#certifications" className="link-arrow">See the certifications →</a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Stacked() {
  return (
    <div className="container">
      <Head />
      <div className="jlist">
        {journey.map((j, i) => (
          <motion.div
            key={j.title}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ duration: 0.9, ease: easeOut }}
          >
            <Milestone j={j} i={i} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Journey() {
  const wide = useMedia('(min-width: 900px) and (min-height: 600px)')
  return (
    <section className="section journey" id="journey">
      {wide ? <Horizontal /> : <Stacked />}
    </section>
  )
}
