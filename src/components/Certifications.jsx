import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView, animate } from 'framer-motion'
import { certificates, badges } from '../data.js'
import { Eyebrow, RevealLines, FadeUp } from './Reveal.jsx'
import { ease, easeOut, useMedia } from '../lib.js'

/* ---------- shared: pointer-driven 3D tilt with holographic glare ---------- */
function useHolo(strength = 22) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const px = useMotionValue(50)
  const py = useMotionValue(50)
  const srx = useSpring(rx, { stiffness: 180, damping: 16 })
  const sry = useSpring(ry, { stiffness: 180, damping: 16 })
  const glare = useTransform([px, py], ([x, y]) => `${x}% ${y}%`)
  const hue = useTransform(px, [0, 100], [180, 340])
  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    ry.set((x - 0.5) * strength)
    rx.set(-(y - 0.5) * strength)
    px.set(x * 100)
    py.set(y * 100)
  }
  const onPointerLeave = () => { rx.set(0); ry.set(0); px.set(50); py.set(50) }
  return { srx, sry, glare, hue, handlers: { onPointerMove, onPointerLeave } }
}

function Holo({ src, size = 'md' }) {
  const { srx, sry, glare, hue, handlers } = useHolo(size === 'lg' ? 18 : 26)
  return (
    <motion.div className={`holo holo-${size}`} style={{ rotateX: srx, rotateY: sry }} {...handlers}>
      <img src={src} alt="" loading="lazy" decoding="async" draggable="false" />
      <motion.span
        className="holo-foil"
        aria-hidden="true"
        style={{ '--glare': glare, '--hue': hue, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      />
    </motion.div>
  )
}

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

/* ---------- badges ---------- */
function FeaturedBadge({ b }) {
  return (
    <motion.div
      className="feat"
      initial={{ opacity: 0, scale: 0.8, rotateY: -40 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1.4, ease: easeOut }}
    >
      <div className="feat-stage">
        <svg className="feat-orbit o1" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" /></svg>
        <svg className="feat-orbit o2" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" /></svg>
        <span className="feat-glow" aria-hidden="true" />
        <div className="feat-float"><Holo src={b.image} size="lg" /></div>
      </div>
      <div className="feat-copy">
        <span className="feat-kicker"><i />Career path complete</span>
        <h3>{b.title.replace(' Career Path', '')}</h3>
        <p className="muted">Cisco Networking Academy. Seven courses across threat management, network defense, endpoint security and networking, verified.</p>
      </div>
    </motion.div>
  )
}

function SmallBadge({ b, i }) {
  const Tag = b.link ? 'a' : 'div'
  return (
    <motion.div
      className="sbadge"
      initial={{ opacity: 0, rotateY: 100, y: 40 }}
      whileInView={{ opacity: 1, rotateY: 0, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 1.1, ease: easeOut, delay: 0.2 + i * 0.08 }}
    >
      <Tag
        className="sbadge-in"
        style={{ animationDelay: `${-i * 0.9}s` }}
        {...(b.link ? { href: b.link, target: '_blank', rel: 'noreferrer' } : {})}
        data-cursor="Verified"
      >
        <Holo src={b.image} />
        <span className="sbadge-title">{b.title}</span>
      </Tag>
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
  const [featured, ...rest] = badges
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

        <div className="badge-panel">
          <span className="badge-beam" aria-hidden="true" />
          <FeaturedBadge b={featured} />
          <div className="badge-grid">
            {rest.map((b, i) => <SmallBadge key={b.title} b={b} i={i} />)}
          </div>
        </div>

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
