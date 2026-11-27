import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../data.js'
import { useClock, scrollToId } from '../lib.js'
import { RevealLines, FadeUp } from './Reveal.jsx'
import Magnetic from './Magnetic.jsx'
import RollLink from './RollLink.jsx'

export default function Contact() {
  const ref = useRef(null)
  const time = useClock(profile.timeZone)
  const [copied, setCopied] = useState(false)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const bigY = useTransform(scrollYProgress, [0, 1], ['40%', '0%'])

  const copy = () => {
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
    try {
      navigator.clipboard.writeText(profile.email).then(done, () => selectEmail())
    } catch {
      selectEmail()
    }
  }
  const selectEmail = () => {
    const el = document.getElementById('contact-email')
    if (!el) return
    const r = document.createRange()
    r.selectNodeContents(el)
    const s = window.getSelection()
    s.removeAllRanges()
    s.addRange(r)
  }

  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="container">
        <div className="contact-top">
          <RevealLines as="h2" className="h-giant" lines={[<>Let's build</>, <>something <em>secure.</em></>]} />
          <FadeUp className="contact-cta" delay={0.2}>
            <Magnetic strength={0.45}>
              <button id="copy-email" type="button" className="big-btn" onClick={copy} data-cursor={copied ? 'Copied' : 'Copy'}>
                <span className="big-btn-fill" />
                <span className="big-btn-label">{copied ? 'Copied!' : 'Get in touch'}</span>
              </button>
            </Magnetic>
          </FadeUp>
        </div>

        <FadeUp className="contact-row">
          <div className="contact-cell">
            <span className="eyebrow">Email</span>
            <span id="contact-email" className="contact-email">{profile.email}</span>
          </div>
          <div className="contact-cell">
            <span className="eyebrow">Elsewhere</span>
            <div className="socials">
              <RollLink href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</RollLink>
              <RollLink href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</RollLink>
              <RollLink href={profile.tryhackme} target="_blank" rel="noreferrer">TryHackMe ↗</RollLink>
              <RollLink href={profile.resume} target="_blank" rel="noreferrer">Resume ↗</RollLink>
            </div>
          </div>
          <div className="contact-cell">
            <span className="eyebrow">Status</span>
            <span><i className="pulse" /> {profile.available}</span>
          </div>
        </FadeUp>
      </div>

      <div className="footer-big" aria-hidden="true">
        <motion.span style={{ y: bigY }}>{profile.short}</motion.span>
      </div>

      <footer className="container footer">
        <span>© 2026 {profile.name}. Designed &amp; built with React.</span>
        <span className="tnum">{profile.city} · {time}</span>
        <button id="back-top" type="button" className="back-top" onClick={() => scrollToId('top')}>Back to top ↑</button>
      </footer>
    </section>
  )
}
