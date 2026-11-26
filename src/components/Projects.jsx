import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion'
import { projects, profile } from '../data.js'
import { useMedia, easeOut } from '../lib.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'

function Art({ p, i }) {
  if (p.image) {
    return (
      <div className="art art-img">
        <img src={p.image} alt={`${p.title} preview`} loading="lazy" decoding="async" />
        <span className="art-num tnum">{String(i + 1).padStart(2, '0')}</span>
      </div>
    )
  }
  const [a, b] = p.hue
  return (
    <div
      className={`art pat-${p.pattern}`}
      style={{
        '--h1': a,
        '--h2': b,
      }}
    >
      <div className="art-glow" />
      <div className="art-pattern" />
      <div className="art-window">
        <div className="aw-bar"><i /><i /><i /><span>{p.title.toLowerCase().replace(/\s/g, '')}.app</span></div>
        <div className="aw-body">
          <div className="aw-side">
            <span /><span /><span /><span />
          </div>
          <div className="aw-main">
            <span className="aw-h" />
            <span className="aw-l" />
            <span className="aw-l short" />
            <div className="aw-blocks"><span /><span /><span /></div>
          </div>
        </div>
      </div>
      <span className="art-num tnum">{String(i + 1).padStart(2, '0')}</span>
    </div>
  )
}

function Card({ p, i }) {
  return (
    <article className="proj" data-cursor="View">
      <div className="proj-art-wrap">
        <Art p={p} i={i} />
      </div>
      <div className="proj-info">
        <div className="proj-top">
          <span className="eyebrow">{p.kind}</span>
          <span className="eyebrow tnum">{p.status || p.year}</span>
        </div>
        <h3>{p.title}</h3>
        <p className="muted">{p.description}</p>
        <div className="proj-foot">
          <ul className="pills small">
            {p.stack.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <div className="proj-links">
            {p.links.code && <a href={p.links.code} target="_blank" rel="noreferrer">Code ↗</a>}
            {p.links.live && <a href={p.links.live} target="_blank" rel="noreferrer">Live ↗</a>}
          </div>
        </div>
      </div>
    </article>
  )
}

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
  const bar = smooth
  useMotionValueEvent(slide, 'change', (v) => setActive(Math.min(projects.length - 1, Math.round(v * (projects.length - 1)))))

  return (
    <div className="hz" ref={section} style={{ height: `calc(100vh + ${range}px)` }}>
      <div className="hz-sticky">
        <div className="container hz-head">
          <div>
            <Eyebrow index="Security × AI">Selected work</Eyebrow>
            <RevealLines className="h-xl" lines={[<>Things I've <em>built</em></>]} />
          </div>
          <div className="hz-progress">
            <span className="tnum">{String(active + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
            <div className="hz-bar"><motion.span style={{ scaleX: bar }} /></div>
          </div>
        </div>
        <motion.div className="hz-track" ref={track} style={{ x }}>
          {projects.map((p, i) => <Card key={p.title} p={p} i={i} />)}
          <div className="hz-end">
            <p>More on GitHub</p>
            <a href={profile.github} target="_blank" rel="noreferrer" className="link-arrow">github.com/r-ahamedasri ↗</a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Stacked() {
  return (
    <div className="container">
      <Eyebrow index="Security × AI">Selected work</Eyebrow>
      <RevealLines className="h-xl" lines={[<>Things I've <em>built</em></>]} />
      <div className="stack-list">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ duration: 0.9, ease: easeOut }}
          >
            <Card p={p} i={i} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Projects() {
  const wide = useMedia('(min-width: 900px) and (min-height: 600px)')
  return (
    <section className="section work" id="work">
      {wide ? <Horizontal /> : <Stacked />}
    </section>
  )
}
