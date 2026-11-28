import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { projects } from '../data.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'
import { useReducedMotion } from '../lib.js'
import Cover from './Covers.jsx'

const NAV_H = 76 // height of the nav bar once scrolled
const tints = ['139,92,246', '67,97,255', '255,106,61', '45,212,191']

// Each project pins under the one before it. As the next card slides over,
// the one underneath shrinks and dims, so the stack reads like a deck being dealt.
function ProjectCard({ p, i, n, progress, reduced }) {
  const start = i / n
  const scale = useTransform(progress, [start, 1], [1, reduced ? 1 : 1 - (n - i) * 0.04])
  const dim = useTransform(progress, [start, Math.min(1, start + 1.2 / n)], [0, reduced || i === n - 1 ? 0 : 0.55])
  return (
    <li className="stk-slot" style={{ '--i': i, zIndex: i + 1 }}>
      <motion.article className="pcard" style={{ scale, '--tint': tints[i % tints.length] }} data-cursor="View">
        <motion.span className="stk-dim" style={{ opacity: dim }} aria-hidden="true" />
        <div className="pcard-art">
          <Cover title={p.title} />
          <span className="pcard-num tnum">{String(i + 1).padStart(2, '0')}</span>
        </div>
        <div className="pcard-info">
          <div className="pcard-top">
            <span className="stk-tag">{p.kind}</span>
            <span className="eyebrow">{p.status}</span>
          </div>
          <h3>{p.title}</h3>
          <p className="muted">{p.description}</p>
          <div className="proj-foot">
            <ul className="pills small">
              {p.stack.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <div className="proj-links">
              {p.links.code && <a href={p.links.code} target="_blank" rel="noreferrer">Code ↗</a>}
              {p.links.live && <a href={p.links.live} target="_blank" rel="noreferrer">Live ↗</a>}
            </div>
          </div>
        </div>
      </motion.article>
    </li>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const head = useRef(null)
  const reduced = useReducedMotion()
  // The title pins under the nav while the cards stack below it. It only pins when the screen is
  // tall enough to fit the title plus a whole card; otherwise it scrolls away as before.
  const [pin, setPin] = useState(null)
  useLayoutEffect(() => {
    const measure = () => {
      const h = head.current
      const card = ref.current?.querySelector('.pcard')
      if (!h || !card) return
      const top = NAV_H + h.offsetHeight + 8
      const room = top + card.offsetHeight + (projects.length - 1) * 20 + 24
      setPin(window.innerWidth > 900 && window.innerHeight >= room ? top : null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(head.current)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  // When the last card stops being pinned and the stack scrolls away, take the title with it,
  // so the cards never slide up over it.
  useLayoutEffect(() => {
    const h = head.current
    if (!pin) { if (h) h.style.transform = ''; return }
    let raf = 0
    const sync = () => {
      raf = 0
      const slots = ref.current?.querySelectorAll('.stk-slot')
      const last = slots?.[slots.length - 1]
      if (!last) return
      const stuck = pin + (slots.length - 1) * 20
      const d = Math.min(0, last.getBoundingClientRect().top - stuck)
      h.style.transform = d ? `translate3d(0, ${d}px, 0)` : ''
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(sync) }
    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); h.style.transform = '' }
  }, [pin])
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section className="section work" id="work" style={pin ? { '--stk-top': `${pin}px` } : undefined}>
      <div className="container">
        <Eyebrow index="Security × AI">Selected work</Eyebrow>
        <div className={`work-head${pin ? ' is-pinned' : ''}`} ref={head}>
          <RevealLines className="h-xl" lines={[<>Ideas I’ve turned</>, <>into <em>action</em></>]} />
        </div>
        <ol className="stk" ref={ref}>
          {projects.map((p, i) => (
            <ProjectCard key={p.title} p={p} i={i} n={projects.length} progress={scrollYProgress} reduced={reduced} />
          ))}
        </ol>
      </div>
    </section>
  )
}
