import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { profile } from '../data.js'
import { ease, easeOut, scrollToId } from '../lib.js'
import RollLink from './RollLink.jsx'
import Magnetic from './Magnetic.jsx'

const links = [
  ['about', 'About'],
  ['skills', 'Skills'],
  ['work', 'Work'],
  ['journey', 'Journey'],
  ['certifications', 'Certs'],
  ['contact', 'Contact'],
]

export default function Nav({ ready }) {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(v > prev && v > 400 && !open)
    setScrolled(v > 40)
  })

  useEffect(() => {
    if (open) window.__lenis?.stop()
    else window.__lenis?.start()
  }, [open])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => scrollToId(id), open ? 450 : 0)
  }

  return (
    <>
      <motion.header
        className={`nav${scrolled ? ' is-scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={ready ? { y: hidden ? -110 : 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: easeOut }}
      >
        <a href="#top" className="logo" onClick={go('top')} data-cursor="">
          <span className="logo-c">©</span>
          <span className="logo-wrap">
            <span className="logo-a">Code by</span>
            <span className="logo-b">{profile.name}</span>
          </span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {links.map(([id, label]) => (
            <RollLink key={id} href={`#${id}`} onClick={go(id)}>
              {label}
            </RollLink>
          ))}
        </nav>
        <div className="nav-right">
          <span className="avail"><i />Available</span>
          <Magnetic strength={0.4}>
            <button id="menu-toggle" type="button" className={`burger${open ? ' is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Menu">
              <span /><span />
            </button>
          </Magnetic>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 40px)' }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="menu-inner">
              <span className="eyebrow">Navigation</span>
              <ul>
                {links.map(([id, label], i) => (
                  <li key={id} className="menu-row">
                    <motion.a
                      href={`#${id}`}
                      onClick={go(id)}
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '110%' }}
                      transition={{ duration: 0.7, ease, delay: 0.15 + i * 0.06 }}
                    >
                      {label}
                    </motion.a>
                  </li>
                ))}
              </ul>
              <div className="menu-foot">
                <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                <span>{profile.email}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
