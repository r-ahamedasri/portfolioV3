import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, animate, useMotionValue, useTransform, useAnimationFrame, useMotionValueEvent } from 'framer-motion'
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

/* ---------- certificates: a scattered paper stack ---------- */
// The certificates are dealt out from one neat pile into a loose, overlapping spread.
// Hovering one lifts it off the table, straightens it and scales it up to full size;
// clicking opens it in the lightbox. On touch screens a tap opens it straight away.
const SPREAD = [
  { x: -0.31, y: 18, r: -8 },
  { x: -0.18, y: -16, r: 5 },
  { x: -0.06, y: 14, r: -3 },
  { x: 0.07, y: -12, r: 6 },
  { x: 0.19, y: 16, r: -5 },
  { x: 0.31, y: -8, r: 7 },
]

function CertStack({ onOpen }) {
  const stage = useRef(null)
  const inView = useInView(stage, { once: true, margin: '-15% 0px' })
  const narrow = useMedia('(max-width: 760px)')
  const [size, setSize] = useState({ w: 1200, h: 560, card: 380 })
  const [hover, setHover] = useState(null)
  const [top, setTop] = useState(null)
  // Each sheet keeps its own shape, so portrait certificates are never cropped.
  const [ratios, setRatios] = useState(() => certificates.map(() => 1.414))

  useEffect(() => {
    let live = true
    certificates.forEach((cert, i) => {
      const im = new Image()
      im.onload = () => {
        if (!live || !im.naturalWidth) return
        const r = im.naturalWidth / im.naturalHeight
        setRatios((prev) => prev.map((v, k) => (k === i ? r : v)))
      }
      im.src = cert.image
    })
    return () => { live = false }
  }, [])

  useLayoutEffect(() => {
    const el = stage.current
    const measure = () => {
      const widest = Math.max(0, ...[...el.querySelectorAll('.cstack-card')].map((c) => c.offsetWidth))
      setSize({ w: el.clientWidth, h: el.clientHeight, card: widest || 380 })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const spread = narrow ? 0.62 : 1
  // Landscape sheets are --cw wide; portrait ones are a little taller than a landscape sheet.
  const widthOf = (r) => (r >= 1 ? 1 : 0.82 * r)
  const liftOf = (r) => {
    const cw = size.card * widthOf(r)
    const ch = cw / r
    return Math.max(1.15, Math.min(1.9, (size.w * 0.6) / cw, (size.h * 0.95) / ch))
  }
  const shown = hover ?? top
  const c = shown == null ? null : certificates[shown]

  return (
    <div className="cstack">
      <div className="cstack-stage" ref={stage} onPointerLeave={() => setHover(null)}>
        {certificates.map((cert, i) => {
          const p = SPREAD[i % SPREAD.length]
          const on = hover === i
          const x = p.x * size.w * spread
          const r = ratios[i]
          const lift = liftOf(r)
          return (
            <motion.button
              key={cert.title}
              type="button"
              className={`cstack-card${on ? ' is-on' : ''}`}
              aria-label={`Open ${cert.title} certificate`}
              data-cursor="Open"
              style={{ zIndex: on ? 50 : top === i ? 30 : 10 + i, '--ar': r, '--k': widthOf(r) }}
              initial={{ x: 0, y: 40, rotate: 0, scale: 0.9, opacity: 0 }}
              animate={
                !inView
                  ? { x: 0, y: 40, rotate: 0, scale: 0.9, opacity: 0 }
                  : on
                    ? { x: x * 0.55, y: -10, rotate: 0, scale: lift, opacity: 1 }
                    : { x, y: p.y, rotate: p.r, scale: 1, opacity: 1 }
              }
              transition={
                on || hover != null
                  ? { type: 'spring', stiffness: 170, damping: 22, mass: 0.8 }
                  : { type: 'spring', stiffness: 90, damping: 18, mass: 1, delay: hover == null && top == null ? 0.25 + i * 0.09 : 0 }
              }
              onPointerEnter={(e) => { if (e.pointerType === 'mouse') { setHover(i); setTop(i) } }}
              onFocus={() => { setHover(i); setTop(i) }}
              onBlur={() => setHover(null)}
              onClick={() => onOpen(cert)}
            >
              <span className="cstack-paper">
                <img src={cert.image} alt="" loading="lazy" decoding="async" draggable="false" />
                <span className="cstack-sheen" aria-hidden="true" />
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="cstack-caption" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={c ? c.title : 'hint'}
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: easeOut }}
          >
            {c ? (
              <>
                <span className="eyebrow">{c.issuer} · {c.date}</span>
                <h3>{c.title}</h3>
                {c.link && <a className="cert-link" href={c.link} target="_blank" rel="noreferrer">Verify credential ↗</a>}
              </>
            ) : (
              <>
                <span className="eyebrow">{certificates.length} certificates</span>
                <h3 className="muted">{narrow ? 'Tap one to read it' : 'Hover the pile to pull one out'}</h3>
              </>
            )}
          </motion.div>
        </AnimatePresence>
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
          <RevealLines className="h-xl" lines={[<>Proof, <em>verified.</em></>]} />
          <FadeUp delay={0.1} className="certs-stats">
            <div><b><Count to={badges.length} /></b><span>Badges</span></div>
            <div><b><Count to={certificates.length} /></b><span>Certificates</span></div>
            <div><b><Count to={issuers} /></b><span>Issuers</span></div>
          </FadeUp>
        </div>

        <BadgeOrbit />

        <div className="certs-sub">
          <span className="eyebrow">Certificates</span>
          <span className="eyebrow muted hide-sm">Hover to lift · click to open</span>
        </div>
        <CertStack onOpen={setOpen} />
      </div>
      <Lightbox cert={open} onClose={close} />
    </section>
  )
}
