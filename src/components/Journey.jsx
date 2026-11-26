import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { journey } from '../data.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'
import { useReducedMotion } from '../lib.js'

const tints = ['67,97,255', '255,106,61', '139,92,246', '45,212,191', '255,106,61', '67,97,255']

// Each card pins under the one before it. As later cards slide over it,
// it shrinks and dims, so the stack reads like a deck being dealt.
function StackCard({ j, i, n, progress, reduced }) {
  const start = i / n
  const target = 1 - (n - i) * 0.035
  const scale = useTransform(progress, [start, 1], [1, reduced ? 1 : target])
  const dim = useTransform(progress, [start, Math.min(1, start + 1.4 / n)], [0, reduced ? 0 : 0.5])
  return (
    <li className="stk-slot" style={{ '--i': i, zIndex: i + 1 }}>
      <motion.article className="stk-card" style={{ scale, '--tint': tints[i % tints.length] }}>
        <motion.span className="stk-dim" style={{ opacity: dim }} aria-hidden="true" />
        <div className="stk-left">
          <span className="stk-num tnum">{String(i + 1).padStart(2, '0')}</span>
          <span className="stk-tag">{j.tag}</span>
        </div>
        <div className="stk-body">
          <span className="stk-when tnum">{j.when}</span>
          <h3>{j.title}</h3>
          <span className="stk-org">{j.org}</span>
          <p className="muted">{j.detail}</p>
        </div>
      </motion.article>
    </li>
  )
}

export default function Journey() {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section className="section journey" id="journey">
      <div className="container">
        <Eyebrow index="Education & milestones">Journey</Eyebrow>
        <RevealLines className="h-xl" lines={[<>The path <em>so far</em></>]} />
        <ol className="stk" ref={ref}>
          {journey.map((j, i) => (
            <StackCard key={j.title} j={j} i={i} n={journey.length} progress={scrollYProgress} reduced={reduced} />
          ))}
        </ol>
      </div>
    </section>
  )
}
