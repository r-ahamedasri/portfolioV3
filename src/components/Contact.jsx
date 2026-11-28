import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../data.js'
import { useClock, scrollToId } from '../lib.js'
import { RevealLines, FadeUp } from './Reveal.jsx'
import Magnetic from './Magnetic.jsx'
import { brand } from '../skillIcons.js'

// Contact links shown as icon pills: [label, link, icon]. Brand marks from Simple Icons; the résumé gets a plain document icon.
const socials = [
  ['GitHub', profile.github, 'github'],
  ['LinkedIn', profile.linkedin, 'linkedin'],
  ['WhatsApp', profile.whatsapp, 'whatsapp'],
  ['TryHackMe', profile.tryhackme, 'tryhackme'],
  ['Résumé', profile.resume, 'doc'],
]

function SocIcon({ name }) {
  if (brand[name]) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={brand[name].d} fill="currentColor" /></svg>
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  )
}

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
          <RevealLines as="h2" className="h-giant" lines={[<><span className="h-lead">Ready</span> <em>when</em></>, <><em>you are.</em></>]} />
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
            <a id="contact-email" className="contact-email" href={`mailto:${profile.email}`} data-cursor="Email">{profile.email}</a>
          </div>
          <div className="contact-cell">
            <span className="eyebrow">Elsewhere</span>
            <div className="socials">
              {socials.map(([label, href, icon]) => (
                <a key={label} className="soc-pill" href={href} target="_blank" rel="noreferrer">
                  <SocIcon name={icon} />
                  <span>{label}</span>
                </a>
              ))}
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
