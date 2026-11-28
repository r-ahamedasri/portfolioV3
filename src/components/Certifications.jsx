import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, animate, useMotionValue, useTransform, useAnimationFrame, useMotionValueEvent, useSpring, useVelocity } from 'framer-motion'
import { certificates, badges } from '../data.js'
import { Eyebrow, RevealLines, FadeUp } from './Reveal.jsx'
import { ease, easeOut, useMedia, useReducedMotion } from '../lib.js'

/* ---------- counters ---------- */
function Count({ to }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.6, ease: easeOut, onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref} className="tnum">{String(v).padStart(2, '0')}</span>
}

/* ---------- badges: a slow 3D orbit ---------- */
// All badges ride one tilted ring. The one at the front is lit and named underneath;
// the rest recede, dim and drift behind. Hover slows it to a stop, drag spins it,
// and clicking a badge (or a dot) brings it to the front.
const TAU = Math.PI * 2
const SPEED = 0.00022 // radians per ms, roughly one lap every 28s

function OrbitBadge({ b, i, n, angle, radius, onPick }) {
  const at = (a) => a + (i * TAU) / n
  const depth = useTransform(angle, (a) => (Math.cos(at(a)) + 1) / 2)
  const x = useTransform(angle, (a) => Math.sin(at(a)) * radius)
  const y = useTransform(depth, (d) => (1 - d) * -radius * 0.18 + d ** 4 * radius * 0.04)
  const scale = useTransform(depth, (d) => 0.42 + 0.58 * d ** 3)
  const opacity = useTransform(depth, (d) => 0.3 + 0.7 * d)
  const zIndex = useTransform(depth, (d) => Math.round(d * 100))
  const filter = useTransform(depth, (d) => `brightness(${0.4 + 0.6 * d}) saturate(${0.5 + 0.5 * d}) blur(${((1 - d) * 1.6).toFixed(2)}px)`)
  return (
    <motion.button
      type="button"
      className="orb-item"
      style={{ x, y, scale, opacity, zIndex, filter }}
      onClick={() => onPick(i)}
      aria-label={b.title}
      data-cursor="View"
    >
      <img src={b.image} alt="" loading="lazy" decoding="async" draggable="false" />
    </motion.button>
  )
}

function BadgeOrbit() {
  const stage = useRef(null)
  const n = badges.length
  const step = TAU / n
  const reduced = useReducedMotion()
  const inView = useInView(stage, { margin: '10% 0px' })
  const angle = useMotionValue(0)
  const speed = useRef(SPEED)
  const hover = useRef(false)
  const drag = useRef(null)
  const tween = useRef(null)
  const [radius, setRadius] = useState(420)
  const [front, setFront] = useState(0)

  useLayoutEffect(() => {
    const el = stage.current
    const measure = () => setRadius(Math.min(el.clientWidth * 0.38, 540))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useAnimationFrame((_, dt) => {
    if (reduced || !inView || drag.current || tween.current) return
    const target = hover.current ? 0 : SPEED
    speed.current += (target - speed.current) * Math.min(1, dt / 400)
    angle.set(angle.get() - speed.current * Math.min(dt, 50))
  })

  useMotionValueEvent(angle, 'change', (a) => {
    const i = (((Math.round(-a / step)) % n) + n) % n
    setFront((f) => (f === i ? f : i))
  })

  const pick = (i) => {
    const a = angle.get()
    let target = -i * step
    target += Math.round((a - target) / TAU) * TAU // shortest way round
    tween.current?.stop()
    tween.current = animate(angle, target, { duration: 1.1, ease: [0.65, 0, 0.35, 1], onComplete: () => { tween.current = null } })
  }

  const onDown = (e) => {
    tween.current?.stop(); tween.current = null
    drag.current = { x: e.clientX, a: angle.get(), t: performance.now(), moved: false }
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    angle.set(d.a + dx * 0.006)
  }
  const onUp = () => { drag.current = null }

  const b = badges[front]

  return (
    <motion.div
      className="orb"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.2, ease: easeOut }}
    >
      <div
        className="orb-stage"
        ref={stage}
        style={{ '--r': `${radius}px` }}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') hover.current = true }}
        onPointerLeave={() => { hover.current = false; onUp() }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onClickCapture={(e) => { if (drag.current?.moved) e.stopPropagation() }}
      >
        <span className="orb-bg tnum" aria-hidden="true">{String(n).padStart(2, '0')}</span>
        <span className="orb-ring orb-ring-back" aria-hidden="true" />
        <span className="orb-glow" aria-hidden="true" />
        {badges.map((badge, i) => (
          <OrbitBadge key={badge.title} b={badge} i={i} n={n} angle={angle} radius={radius} onPick={pick} />
        ))}
        <span className="orb-ring orb-ring-front" aria-hidden="true" />
      </div>

      <div className="orb-caption" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={front}
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <span className="eyebrow">Cisco Networking Academy · Verified</span>
            <h3>{b.title}</h3>
          </motion.div>
        </AnimatePresence>
        <div className="orb-dots">
          {badges.map((badge, i) => (
            <button key={badge.title} type="button" className={i === front ? 'is-on' : ''} onClick={() => pick(i)} aria-label={`Show ${badge.title}`} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ---------- certificates: one big showcase with a thumbnail strip ---------- */
// One certificate is on display at a time, large, with its details beside it. The strip of
// thumbnails underneath picks which: hover or click one and it wipes into the big spot. While
// the section is on screen and nobody is pointing at it, it moves on by itself every few seconds.
const pad2 = (n) => String(n).padStart(2, '0')
const DWELL = 6 // seconds per certificate when advancing on its own

function CertShowcase({ onOpen }) {
  const root = useRef(null)
  const inView = useInView(root, { margin: '-20% 0px' })
  const reduced = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [paused, setPaused] = useState(false)
  const n = certificates.length
  const c = certificates[idx]
  const playing = inView && !paused && !reduced

  const go = useCallback((next) => {
    setIdx((cur) => {
      const to = ((next % n) + n) % n
      if (to !== cur) setDir(to > cur || (cur === n - 1 && to === 0) ? 1 : -1)
      return to
    })
  }, [n])

  // On phones the strip scrolls sideways: keep the current thumbnail in view.
  const strip = useRef(null)
  useEffect(() => {
    const el = strip.current
    if (!el || el.scrollWidth <= el.clientWidth) return
    const t = el.children[idx]
    if (t) el.scrollTo({ left: t.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft || 0), behavior: 'smooth' })
  }, [idx])

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => go(idx + 1), DWELL * 1000)
    return () => clearTimeout(t)
  }, [playing, idx, go])

  return (
    <div className="show" ref={root}>
      <div className="show-main" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
        <button type="button" className="show-stage" data-cursor="Open" aria-label={`Open ${c.title} certificate full size`} onClick={() => onOpen(c)}>
          <AnimatePresence initial={false}>
            <motion.img
              key={`bg-${idx}`}
              className="show-backdrop"
              src={c.image}
              alt=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
          <AnimatePresence initial={false} custom={dir}>
            <motion.span
              key={idx}
              className="show-doc"
              custom={dir}
              variants={{
                enter: (d) => ({ clipPath: d > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', scale: 1.06, opacity: 1 }),
                center: { clipPath: 'inset(0 0% 0 0%)', scale: 1, opacity: 1 },
                exit: { opacity: 0, scale: 0.97 },
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 1, ease }}
            >
              <img src={c.image} alt="" />
            </motion.span>
          </AnimatePresence>
          <span className="show-zoom">View full size ↗</span>
        </button>

        <div className="show-info">
          <div className="show-count">
            <span className="tnum">{pad2(idx + 1)}</span>
            <i />
            <span className="tnum muted">{pad2(n)}</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={idx}
              className="show-text"
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(8px)', transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <span className="show-issuer">{c.issuer}</span>
              <h3 className="show-title">{c.title}</h3>
              <span className="show-date">Issued {c.date}</span>
              {c.link && <a className="show-link" href={c.link} target="_blank" rel="noreferrer">Verify credential <span aria-hidden="true">↗</span></a>}
            </motion.div>
          </AnimatePresence>
          <div className="show-nav">
            <button type="button" aria-label="Previous certificate" onClick={() => go(idx - 1)}>←</button>
            <button type="button" aria-label="Next certificate" onClick={() => go(idx + 1)}>→</button>
          </div>
        </div>
      </div>

      <div className="show-strip" ref={strip} role="tablist" aria-label="Certificates">
        {certificates.map((cert, i) => (
          <button
            key={cert.title}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={cert.title}
            className={`show-thumb${i === idx ? ' is-on' : ''}`}
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') { setPaused(true); go(i) } }}
            onPointerLeave={() => setPaused(false)}
            onClick={() => go(i)}
          >
            <span className="show-thumb-img"><img src={cert.image} alt="" loading="lazy" decoding="async" /></span>
            <span className="show-thumb-t">{cert.issuer}</span>
            <span className="show-bar">
              {i === idx && (
                <motion.i
                  key={`${idx}-${playing}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: playing ? 1 : 0 }}
                  transition={{ duration: playing ? DWELL : 0.3, ease: 'linear' }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- lightbox ---------- */
function Lightbox({ cert, onClose }) {
  useEffect(() => {
    if (!cert) return
    window.__lenis?.stop()
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => { window.__lenis?.start(); window.removeEventListener('keydown', key) }
  }, [cert, onClose])
  return (
    <AnimatePresence>
      {cert && (
        <motion.div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={cert.title}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.figure
            initial={{ y: 60, rotateX: 18, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.7, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={cert.image} alt={`${cert.title} certificate`} />
            <figcaption>
              <span>{cert.title} · <span className="muted">{cert.issuer}</span></span>
              <button id="lightbox-close" type="button" onClick={onClose}>Close ×</button>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Certifications() {
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  const issuers = new Set([...certificates.map((c) => c.issuer), 'Cisco Networking Academy']).size

  return (
    <section className="section certs" id="certifications">
      <div className="certs-bg" aria-hidden="true"><span /><span /></div>
      <div className="container">
        <Eyebrow index="Verified">Certifications</Eyebrow>
        <div className="certs-head">
          <RevealLines className="h-xl" lines={[<>Credentials <em>that</em></>, <><em>track my progress</em></>]} />
          <FadeUp delay={0.1} className="certs-stats">
            <div><b><Count to={badges.length} /></b><span>Badges</span></div>
            <div><b><Count to={certificates.length} /></b><span>Certificates</span></div>
            <div><b><Count to={issuers} /></b><span>Issuers</span></div>
          </FadeUp>
        </div>

        <BadgeOrbit />

        <div className="certs-sub">
          <span className="eyebrow">Certificates</span>
          <span className="eyebrow muted hide-sm">Pick one below · click to enlarge</span>
        </div>
        <CertShowcase onOpen={setOpen} />
      </div>
      <Lightbox cert={open} onClose={close} />
    </section>
  )
}
