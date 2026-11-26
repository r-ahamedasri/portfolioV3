import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { certificates, badges } from '../data.js'
import { Eyebrow, RevealLines, FadeUp } from './Reveal.jsx'
import { easeOut } from '../lib.js'

function Badge({ b, i }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 14 })
  const sry = useSpring(ry, { stiffness: 200, damping: 14 })
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 26)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 26)
  }
  const Tag = b.link ? motion.a : motion.div
  return (
    <Tag
      className={`badge${b.featured ? ' is-featured' : ''}`}
      href={b.link}
      target={b.link ? '_blank' : undefined}
      rel={b.link ? 'noreferrer' : undefined}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.8, ease: easeOut, delay: i * 0.06 }}
      onPointerMove={move}
      onPointerLeave={() => { rx.set(0); ry.set(0) }}
      data-cursor="Verified"
    >
      <motion.div className="badge-face" style={{ rotateX: srx, rotateY: sry }}>
        <img src={b.image} alt="" loading="lazy" decoding="async" />
        <span className="badge-shine" aria-hidden="true" />
      </motion.div>
      <span className="badge-title">{b.title}</span>
    </Tag>
  )
}

function CertCard({ c, i, onOpen }) {
  return (
    <motion.article
      className="cert"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5% 0px' }}
      transition={{ duration: 0.9, ease: easeOut, delay: (i % 3) * 0.08 }}
    >
      <button type="button" className="cert-thumb" onClick={() => onOpen(c)} data-cursor="View" aria-label={`View ${c.title} certificate`}>
        <img src={c.image} alt="" loading="lazy" decoding="async" />
      </button>
      <div className="cert-info">
        <div className="cert-meta">
          <span className="eyebrow">{c.issuer}</span>
          <span className="eyebrow tnum">{c.date}</span>
        </div>
        <h3>{c.title}</h3>
        {c.link ? (
          <a className="cert-link" href={c.link} target="_blank" rel="noreferrer">Verify credential ↗</a>
        ) : (
          <span className="cert-link is-muted">Issued certificate</span>
        )}
      </div>
    </motion.article>
  )
}

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
            initial={{ y: 40, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
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
  return (
    <section className="section certs" id="certifications">
      <div className="container">
        <Eyebrow index={`${certificates.length} credentials · ${badges.length} badges`}>Certifications</Eyebrow>
        <div className="certs-head">
          <RevealLines className="h-xl" lines={[<>Proof, <em>verified.</em></>]} />
          <FadeUp delay={0.1}>
            <p className="muted certs-lede">
              Badges from Cisco Networking Academy's Junior Cybersecurity Analyst path, plus the certificates picked up along the way.
            </p>
          </FadeUp>
        </div>

        <div className="badges">
          {badges.map((b, i) => <Badge key={b.title} b={b} i={i} />)}
        </div>

        <div className="cert-grid">
          {certificates.map((c, i) => <CertCard key={c.title} c={c} i={i} onOpen={setOpen} />)}
        </div>
      </div>
      <Lightbox cert={open} onClose={close} />
    </section>
  )
}
