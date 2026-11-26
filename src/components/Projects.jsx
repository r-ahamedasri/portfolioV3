import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { projects } from '../data.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'
import { useReducedMotion } from '../lib.js'

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
          <img src={p.image} alt={`${p.title} preview`} loading="lazy" decoding="async" />
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
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  return (
    <section className="section work" id="work">
      <div className="container">
        <Eyebrow index="Security × AI">Selected work</Eyebrow>
        <RevealLines className="h-xl" lines={[<>Things I've <em>built</em></>]} />
        <ol className="stk" ref={ref}>
          {projects.map((p, i) => (
            <ProjectCard key={p.title} p={p} i={i} n={projects.length} progress={scrollYProgress} reduced={reduced} />
          ))}
        </ol>
      </div>
    </section>
  )
}
