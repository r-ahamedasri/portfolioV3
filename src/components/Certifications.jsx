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

/* ---------- certificates: 3D coverflow ---------- */
function Coverflow({ onOpen }) {
  const [active, setActive] = useState(0)
  const narrow = useMedia('(max-width: 700px)')
  const n = certificates.length
  const go = useCallback((d) => setActive((a) => Math.max(0, Math.min(n - 1, a + d))), [n])
  const c = certificates[active]
  const step = narrow ? 120 : 230

  return (
    <div className="flow">
      <motion.div
        className="flow-stage"
        tabIndex={0}
        role="listbox"
        aria-label="Certificates"
        aria-activedescendant={`cert-${active}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
          if (e.key === 'Enter') onOpen(c)
        }}
        onPanEnd={(_, info) => {
          if (info.offset.x < -50) go(1)
          else if (info.offset.x > 50) go(-1)
        }}
      >
        {certificates.map((cert, i) => {
          const off = i - active
          const abs = Math.abs(off)
          return (
            <motion.button
              key={cert.title}
              id={`cert-${i}`}
              type="button"
              role="option"
              aria-selected={off === 0}
              aria-label={`${cert.title}, ${cert.issuer}`}
              className={`flow-card${off === 0 ? ' is-active' : ''}`}
              onClick={() => (off === 0 ? onOpen(cert) : setActive(i))}
              data-cursor={off === 0 ? 'Open' : 'View'}
              initial={false}
              animate={{
                x: off * step,
                z: -abs * 160,
                rotateY: Math.max(-55, Math.min(55, -off * 38)),
                scale: 1 - Math.min(abs, 3) * 0.06,
                opacity: abs > 3 ? 0 : 1 - abs * 0.18,
              }}
              transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9 }}
              style={{ zIndex: 20 - abs }}
            >
              <img src={cert.image} alt="" loading="lazy" decoding="async" draggable="false" />
              <span className="flow-sheen" aria-hidden="true" />
            </motion.button>
          )
        })}
        <span className="flow-floor" aria-hidden="true" />
      </motion.div>

      <div className="flow-bar">
        <button id="cert-prev" type="button" className="flow-arrow" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous certificate">←</button>
        <div className="flow-info" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: easeOut }}
            >
              <div className="flow-meta">
                <span className="eyebrow">{c.issuer}</span>
                <span className="eyebrow tnum">{c.date}</span>
              </div>
              <h3>{c.title}</h3>
              {c.link ? (
                <a className="cert-link" href={c.link} target="_blank" rel="noreferrer">Verify credential ↗</a>
              ) : (
                <button id="cert-view" type="button" className="cert-link" onClick={() => onOpen(c)}>View certificate ↗</button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <button id="cert-next" type="button" className="flow-arrow" onClick={() => go(1)} disabled={active === n - 1} aria-label="Next certificate">→</button>
      </div>
      <div className="flow-dots" aria-hidden="true">
        {certificates.map((_, i) => (
          <button key={i} type="button" tabIndex={-1} className={i === active ? 'is-on' : ''} onClick={() => setActive(i)} />
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
          <span className="eyebrow muted hide-sm">Drag, use the arrows, or click to open</span>
        </div>
        <Coverflow onOpen={setOpen} />
      </div>
      <Lightbox cert={open} onClose={close} />
    </section>
  )
}
