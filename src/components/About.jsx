import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, animate, useMotionValue, useSpring } from 'framer-motion'
import { about, stats, profile } from '../data.js'
import { Eyebrow, FadeUp } from './Reveal.jsx'
import Magnetic from './Magnetic.jsx'
import RollLink from './RollLink.jsx'

function Word({ children, range, progress }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <span className="word">
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </span>
  )
}

function Counter({ value, decimals = 0, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView || value == null) return
    const c = animate(0, value, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: setV })
    return () => c.stop()
  }, [inView, value])
  return (
    <span ref={ref} className="tnum">
      {value == null ? '—' : v.toFixed(decimals)}
      {suffix}
    </span>
  )
}

// Résumé download under the portrait: a wide pill with an ember wipe, plus a quiet GitHub link.
function ResumeCta() {
  return (
    <div className="resume-cta">
      <Magnetic strength={0.18} className="resume-mag">
        <a id="about-resume" className="resume-btn" href={profile.resume} download data-cursor="PDF">
          <span className="resume-btn-fill" />
          <span className="resume-btn-text">
            <span className="resume-btn-label">Download résumé</span>
            <span className="resume-btn-meta">PDF · 1 page</span>
          </span>
          <span className="resume-btn-icon" aria-hidden="true">
            <span>↓</span>
            <span>↓</span>
          </span>
        </a>
      </Magnetic>
      <div className="resume-sub">
        <RollLink href={profile.github} target="_blank" rel="noreferrer">View on GitHub ↗</RollLink>
      </div>
    </div>
  )
}

function Portrait() {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 15 })
  const sry = useSpring(ry, { stiffness: 150, damping: 15 })
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14)
  }
  return (
    <motion.figure
      className="portrait"
      style={{ rotateX: srx, rotateY: sry }}
      onPointerMove={move}
      onPointerLeave={() => { rx.set(0); ry.set(0) }}
      data-cursor="Hi!"
    >
      <div className="portrait-art">
        {profile.portrait ? (
          <img src={profile.portrait} alt={`Portrait of ${profile.name}`} loading="lazy" decoding="async" />
        ) : (
          <span className="portrait-initial">{profile.name[0]}</span>
        )}
      </div>
      <figcaption>
        <span>{profile.name}</span>
        <span className="muted">{profile.city}</span>
      </figcaption>
    </motion.figure>
  )
}

export default function About() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })
  const words = about.split(' ')
  return (
    <section className="section about" id="about">
      <div className="container">
        <Eyebrow index="Who I am">About</Eyebrow>
        <div className="about-grid">
          <p className="about-text" ref={ref}>
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                {w}
              </Word>
            ))}
          </p>
          <FadeUp className="about-side" delay={0.1}>
            <Portrait />
            <ResumeCta />
          </FadeUp>
        </div>
        <div className="stats">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08} className="stat">
              <div className="stat-n"><Counter {...s} /></div>
              <div className="stat-l">{s.label}</div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
