import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, animate, useMotionValue, useSpring } from 'framer-motion'
import { about, stats, profile, resumeBrief } from '../data.js'
import { Eyebrow, FadeUp } from './Reveal.jsx'
import RollLink from './RollLink.jsx'
import ResumeViewer from './ResumeViewer.jsx'

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

// Résumé card under the portrait: a small sheet of the real first page, the role from the CV,
// and separate Download / Preview buttons. The thumbnail (public/resume-thumb.webp) has the phone number painted out.

function ResumeCta() {
  const { role, year } = resumeBrief
  const [viewing, setViewing] = useState(false)
  const close = useCallback(() => setViewing(false), [])
  const preview = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return // let modifier-clicks open a real tab
    e.preventDefault()
    setViewing(true)
  }
  return (
    <div className="resume-cta">
      <div className="rb" id="about-resume">
        <div className="rb-head">
          <a className="rb-sheet" href={profile.resume} target="_blank" rel="noreferrer" onClick={preview} aria-label="Preview résumé" data-cursor="View">
            <img src="./resume-thumb.webp" alt="" width="320" height="453" loading="lazy" decoding="async" />
            <span className="rb-scan" aria-hidden="true" />
          </a>
          <div className="rb-id">
            <span className="rb-kicker"><i aria-hidden="true" />PDF · {year}</span>
            <span className="rb-title">Résumé</span>
            <span className="rb-role">{role}</span>
          </div>
        </div>
        <div className="rb-actions">
          <a className="rb-btn rb-btn--primary" href={profile.resume} download data-cursor="PDF">
            <span className="rb-btn-label">
              <span>Download résumé</span>
              <span aria-hidden="true">Download résumé</span>
            </span>
            <span className="rb-btn-icon" aria-hidden="true"><span>↓</span><span>↓</span></span>
          </a>
          <a className="rb-btn rb-btn--ghost" href={profile.resume} target="_blank" rel="noreferrer" onClick={preview} aria-haspopup="dialog">
            Preview <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="resume-sub">
        <RollLink href={profile.github} target="_blank" rel="noreferrer">View on GitHub ↗</RollLink>
      </div>
      <ResumeViewer open={viewing} onClose={close} src={profile.resume} title={`${profile.name} · Résumé`} />
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

// Sizes the About paragraph so it ends level with the photo column (photo + résumé card), leaving no dead
// space above the stats. Only on two-column layouts; the size stays within a readable range.
function useFitToSide(textRef, sideRef) {
  useLayoutEffect(() => {
    const text = textRef.current
    const side = sideRef.current
    if (!text || !side) return
    const mq = window.matchMedia('(min-width: 901px)')
    let raf = 0
    const fit = () => {
      text.style.lineHeight = ''
      if (!mq.matches) { text.style.fontSize = ''; return }
      const target = side.offsetHeight
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      let lo = 2.2 * rem
      let hi = 3.8 * rem
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2
        text.style.fontSize = `${mid}px`
        if (text.offsetHeight > target) hi = mid
        else lo = mid
      }
      const size = lo - 0.05 // stay just under the wrap point
      text.style.fontSize = `${size}px`
      // Ease the leftover (less than one line) into the line spacing so both columns end level.
      const lh = parseFloat(getComputedStyle(text).lineHeight)
      const lines = Math.round(text.offsetHeight / lh)
      if (lines > 0) {
        const want = target / lines
        text.style.lineHeight = `${Math.min(Math.max(want, size * 1.1), size * 1.3)}px`
      }
    }
    const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit) }
    const ro = new ResizeObserver(schedule)
    ro.observe(side)
    ro.observe(text.parentElement)
    mq.addEventListener('change', schedule)
    document.fonts?.ready.then(schedule)
    fit()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); mq.removeEventListener('change', schedule) }
  }, [textRef, sideRef])
}

export default function About() {
  const ref = useRef(null)
  const sideRef = useRef(null)
  useFitToSide(ref, sideRef)
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
          <FadeUp className="about-side-wrap" delay={0.1}>
            <div className="about-side" ref={sideRef}>
              <Portrait />
              <ResumeCta />
            </div>
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
