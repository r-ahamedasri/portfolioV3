import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import { certificates, badges } from '../data.js'
import { Eyebrow, RevealLines, FadeUp } from './Reveal.jsx'
import { ease, easeOut, useMedia } from '../lib.js'

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

/* ---------- badges: a hairline credential grid ---------- */
// Each cell tracks the pointer for a soft spotlight, and a scan line passes over it on hover.
const spot = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

const reveal = (i) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-8% 0px' },
  transition: { duration: 0.9, ease: easeOut, delay: 0.06 * i },
})

const Check = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" /></svg>
)

function FeaturedBadge({ b, courses }) {
  return (
    <motion.div className="cred-cell cred-feat" onPointerMove={spot} {...reveal(0)}>
      <span className="cred-scan" aria-hidden="true" />
      <div className="cred-top">
        <span className="cred-no tnum">01</span>
        <span className="cred-tag is-hot"><i />Career path complete</span>
      </div>
      <div className="cred-feat-body">
        <div className="cred-feat-img">
          <span className="cred-ring" aria-hidden="true" />
          <img src={b.image} alt="" loading="lazy" decoding="async" draggable="false" />
        </div>
        <div className="cred-feat-copy">
          <h3>{b.title.replace(' Career Path', '')}</h3>
          <p className="muted">Cisco Networking Academy career path. Seven courses across threat management, network defense, endpoint security and networking, each one verified.</p>
          <div className="cred-progress" aria-label={`${courses} of ${courses} courses complete`}>
            <div className="cred-segs">
              {Array.from({ length: courses }, (_, i) => (
                <motion.i
                  key={i}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: easeOut, delay: 0.5 + i * 0.09 }}
                />
              ))}
            </div>
            <span className="tnum">{courses} / {courses} courses</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Badge({ b, i }) {
  const Tag = b.link ? motion.a : motion.div
  return (
    <Tag
      className="cred-cell"
      onPointerMove={spot}
      data-cursor={b.link ? 'Verify' : undefined}
      {...(b.link ? { href: b.link, target: '_blank', rel: 'noreferrer' } : {})}
      {...reveal(i + 1)}
    >
      <span className="cred-scan" aria-hidden="true" />
      <div className="cred-top">
        <span className="cred-no tnum">{String(i + 2).padStart(2, '0')}</span>
        <span className="cred-tag"><Check />Verified</span>
      </div>
      <div className="cred-img"><img src={b.image} alt="" loading="lazy" decoding="async" draggable="false" /></div>
      <div className="cred-copy">
        <h4>{b.title}</h4>
        <span>Cisco Networking Academy</span>
      </div>
    </Tag>
  )
}

function BadgeGrid() {
  const [featured, ...rest] = badges
  return (
    <div className="cred">
      <FeaturedBadge b={featured} courses={rest.length} />
      {rest.map((b, i) => <Badge key={b.title} b={b} i={i} />)}
      <motion.div className="cred-cell cred-sum" {...reveal(rest.length + 1)}>
        <b className="tnum"><Count to={badges.length} /></b>
        <span className="cred-sum-k">Verified badges</span>
        <span className="cred-sum-note muted">One issuer, one complete career path.</span>
      </motion.div>
    </div>
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

        <BadgeGrid />

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
