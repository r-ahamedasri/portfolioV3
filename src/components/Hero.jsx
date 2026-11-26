import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '../data.js'
import { ease, easeOut, useClock, useMedia, scrollToId } from '../lib.js'
import Aurora from './Aurora.jsx'
import Magnetic from './Magnetic.jsx'

function Letter({ ch, i, total, ready, progress }) {
  const dir = i - (total - 1) / 2
  const y = useTransform(progress, [0, 1], [0, (Math.abs(dir) + 1) * -40])
  const rotate = useTransform(progress, [0, 1], [0, dir * 3])
  return (
    <span className="mask">
      <motion.span
        className="letter"
        style={{ y, rotate }}
        initial={{ y: '105%' }}
        animate={ready ? { y: 0 } : {}}
        transition={{ duration: 1.2, ease, delay: 0.1 + i * 0.05 }}
      >
        {ch}
      </motion.span>
    </span>
  )
}

// Sizes each line so it spans the full width of the hero, never more.
function useFitLines(lines) {
  const box = useRef(null)
  const refs = useRef([])
  const [sizes, setSizes] = useState([])

  useLayoutEffect(() => {
    const fit = () => {
      const el = box.current
      if (!el) return
      const avail = el.clientWidth
      const maxByHeight = window.innerHeight * (lines.length > 1 ? 0.24 : 0.36)
      const next = refs.current.slice(0, lines.length).map((line) => {
        if (!line) return 0
        const prev = line.style.fontSize
        line.style.fontSize = '100px'
        const w = line.scrollWidth
        line.style.fontSize = prev
        return w ? Math.min((avail / w) * 100 * 0.985, maxByHeight) : 0
      })
      setSizes(next)
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(box.current)
    window.addEventListener('resize', fit)
    return () => { ro.disconnect(); window.removeEventListener('resize', fit) }
  }, [lines.join('|')])

  return { box, refs, sizes }
}

function ScrollBadge() {
  return (
    <Magnetic strength={0.5}>
      <button id="hero-scroll" type="button" className="scroll-badge" onClick={() => scrollToId('about')} data-cursor="Go" aria-label="Scroll to About">
        <svg viewBox="0 0 120 120" className="spin" aria-hidden="true">
          <defs>
            <path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
          </defs>
          <text>
            <textPath href="#circ">SCROLL TO EXPLORE · SCROLL TO EXPLORE · </textPath>
          </text>
        </svg>
        <span className="arrow">↓</span>
      </button>
    </Magnetic>
  )
}

export default function Hero({ ready }) {
  const ref = useRef(null)
  const time = useClock(profile.timeZone)
  const narrow = useMedia('(max-aspect-ratio: 5/4)')
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const words = profile.name.toUpperCase().split(' ')
  const lines = narrow ? words : [words.join(' ')]
  const { box, refs, sizes } = useFitLines(lines)
  const total = words.join('').length
  let n = 0
  const glyphs = lines.map((line) => line.split('').map((ch) => (ch === ' ' ? { ch, i: -1 } : { ch, i: n++ })))

  const fade = (d) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1, ease: easeOut, delay: d },
  })

  return (
    <section className="hero" id="top" ref={ref}>
      <Aurora />
      <motion.div className="hero-inner" style={{ scale, opacity }}>
        <div className="hero-meta">
          <motion.span {...fade(0.5)}>(Portfolio · 2026)</motion.span>
          <motion.span {...fade(0.6)} className="hide-sm">Based in {profile.city}</motion.span>
          <motion.span {...fade(0.7)} className="tnum">{time} local</motion.span>
        </div>

        <h1 className="hero-name" aria-label={profile.name} ref={box}>
          {lines.map((line, li) => (
            <span
              key={line}
              className="hero-line"
              ref={(el) => (refs.current[li] = el)}
              style={sizes[li] ? { fontSize: `${sizes[li]}px` } : undefined}
              aria-hidden="true"
            >
              {glyphs[li].map((g, k) =>
                g.i < 0 ? (
                  <span key={`sp${k}`} className="hero-space" />
                ) : (
                  <Letter key={g.i} ch={g.ch} i={g.i} total={total} ready={ready} progress={scrollYProgress} />
                )
              )}
            </span>
          ))}
        </h1>

        <div className="hero-bottom">
          <motion.p className="hero-role" {...fade(0.9)}>
            Cybersecurity <em>meets</em>
            <br />artificial intelligence
          </motion.p>
          <motion.p className="hero-tag" {...fade(1)}>{profile.tagline}</motion.p>
          <motion.div {...fade(1.1)} className="hero-badge">
            <ScrollBadge />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
