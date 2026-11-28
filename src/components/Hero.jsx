import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from 'framer-motion'
import { profile } from '../data.js'
import { ease, easeOut, useClock, useReducedMotion, scrollToId } from '../lib.js'
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

// AHAMED and ASRI are both centred. AHAMED takes about four fifths of the width; ASRI, in the
// same heavy face but outlined, is sized as large as the height left over allows, so the whole
// hero still fits one screen. If ASRI would get too small, AHAMED gives a little back instead.
const TUCK = 0.04
const A_WIDTH = 0.8 // phones use the full width, see below
const B_MAX = 0.92
const B_MIN = 0.6

function useNameBlock() {
  const box = useRef(null)
  const first = useRef(null)
  const second = useRef(null)
  const [fit, setFit] = useState({ fa: 0, fb: 0, w: 0 })

  useLayoutEffect(() => {
    const run = () => {
      const h1 = box.current
      const l1 = first.current
      const l2 = second.current
      if (!h1 || !l1 || !l2) return
      const inner = h1.parentElement
      const cs = getComputedStyle(inner)
      const kids = [...inner.children]
      const others = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
        + (parseFloat(cs.rowGap) || 0) * (kids.length - 1)
        + kids.filter((k) => k !== h1).reduce((sum, k) => sum + k.offsetHeight, 0)
      const keep = [l1, l2].map((l) => [l.style.fontSize, l.style.width, l.style.display])
      l1.style.fontSize = '100px'
      l1.style.width = 'max-content'
      l1.style.display = 'inline-flex'
      const w100 = l1.getBoundingClientRect().width
      const hA = l1.getBoundingClientRect().height / 100
      l2.style.fontSize = '100px'
      const hB = l2.getBoundingClientRect().height / 100 - TUCK
      ;[l1, l2].forEach((l, k) => { [l.style.fontSize, l.style.width, l.style.display] = keep[k] })
      if (!w100 || !hA || !hB) return
      // A little slack so the bottom row never kisses the screen edge, whatever the font metrics.
      const budget = Math.max(160, window.innerHeight - others - 16)
      let fa = (h1.clientWidth / w100) * 100 * (window.innerWidth <= 760 ? 0.98 : A_WIDTH)
      let fb = Math.min(fa * B_MAX, (budget - hA * fa) / hB)
      if (fb < fa * B_MIN) {
        fa = budget / (hA + hB * B_MIN)
        fb = fa * B_MIN
      }
      setFit({ fa, fb, w: (w100 * fa) / 100 })
    }
    run()
    document.fonts?.ready.then(run)
    // Re-fit whenever anything else in the hero changes height too (late font swaps can make the
    // bottom row taller after the first pass), not just when the name's own box changes.
    document.fonts?.addEventListener?.('loadingdone', run)
    const ro = new ResizeObserver(run)
    ro.observe(box.current)
    ;[...(box.current?.parentElement?.children || [])].forEach((k) => { if (k !== box.current) ro.observe(k) })
    window.addEventListener('resize', run)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', run)
      document.fonts?.removeEventListener?.('loadingdone', run)
    }
  }, [])

  return { box, first, second, fit }
}

// A scan line that sweeps across the outlined surname, filling it with colour as it passes.
// Idle: it sweeps on its own. Pointer over the hero: it follows the cursor.
function useScan(ready) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 90, damping: 22 })
  const hovering = useRef(false)
  useEffect(() => {
    if (!ready || reduced) { x.set(reduced ? 100 : 0); return }
    let ctl
    let stop = false
    const wait = (ms) => new Promise((r) => setTimeout(r, ms))
    const loop = async () => {
      await wait(1500)
      while (!stop) {
        if (!hovering.current) {
          ctl = animate(x, [0, 100], { duration: 3.2, ease: [0.65, 0, 0.35, 1] })
          await ctl
          await wait(1800)
          if (!hovering.current) {
            ctl = animate(x, 0, { duration: 1.6, ease: [0.65, 0, 0.35, 1] })
            await ctl
          }
          await wait(900)
        } else {
          await wait(400)
        }
      }
    }
    loop()
    return () => { stop = true; ctl?.stop() }
  }, [ready, reduced, x])

  const bind = (el) => ({
    onPointerMove: (e) => {
      const t = el.current
      if (!t || e.pointerType !== 'mouse') return
      hovering.current = true
      const r = t.getBoundingClientRect()
      x.stop()
      x.set(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)))
    },
    onPointerLeave: () => { hovering.current = false },
  })
  const clip = useTransform(sx, (v) => `inset(-0.2em ${100 - v}% -0.2em -0.2em)`)
  const left = useTransform(sx, (v) => `${v}%`)
  // Fully hidden at rest (no glow left hanging off the first letter), fading in over the first few %.
  const fill = useTransform(sx, [0.5, 4], [0, 1])
  const beam = useTransform(sx, [0.5, 4, 96, 99.5], [0, 1, 1, 0])
  return { clip, left, beam, fill, bind }
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const { box, first, second, fit } = useNameBlock()
  const word = useRef(null)
  const scan = useScan(ready)

  const [a, b] = profile.name.toUpperCase().split(' ')
  const total = a.length + b.length
  const lineA = fit.fa ? { fontSize: `${fit.fa}px`, width: `${fit.w}px` } : undefined
  const lineB = fit.fb ? { fontSize: `${fit.fb}px`, width: `${fit.w}px` } : undefined
  const yB = useTransform(scrollYProgress, [0, 1], [0, 120])

  const fade = (d) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1, ease: easeOut, delay: d },
  })

  const letters = (word, offset) =>
    word.split('').map((ch, k) => (
      <Letter key={k} ch={ch} i={offset + k} total={total} ready={ready} progress={scrollYProgress} />
    ))

  return (
    <section className="hero" id="top" ref={ref} {...scan.bind(word)}>
      <Aurora />
      <motion.div className="hero-inner" style={{ scale, opacity }}>
        <div className="hero-meta">
          <motion.span {...fade(0.5)}>(Portfolio · 2026)</motion.span>
          <motion.span {...fade(0.6)} className="hide-sm">Based in {profile.city}</motion.span>
          <motion.span {...fade(0.7)} className="tnum">{time} local</motion.span>
        </div>

        <h1 className="hero-name" aria-label={profile.name} ref={box}>
          <span className="hero-block" aria-hidden="true">
            <span className="hero-line hero-line-1" ref={first} style={lineA}>
              {letters(a, 0)}
            </span>
            <motion.span className="hero-line hero-line-2" ref={second} style={{ ...lineB, y: yB }}>
              <motion.span className="hl2-side" {...fade(1.3)}>
                <span className="hl2-k">(Security × AI)</span>
                <i className="hl2-rule" />
              </motion.span>
              <span className="hl2" ref={word}>
                <span className="hl2-outline">{letters(b, a.length)}</span>
                <motion.span className="hl2-fill" style={{ clipPath: scan.clip, opacity: scan.fill }}>{letters(b, a.length)}</motion.span>
                <motion.span className="hl2-beam" style={{ left: scan.left, opacity: scan.beam }} />
              </span>
              <motion.span className="hl2-side hl2-side-r" {...fade(1.4)}>
                <i className="hl2-rule" />
                <span>Security engineer<br />&amp; AI builder</span>
              </motion.span>
            </motion.span>
          </span>
        </h1>

        <div className="hero-bottom">
          <motion.p className="hero-role" {...fade(0.9)}>
            <em>Security engineering</em>
            <br />with AI at its core
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
