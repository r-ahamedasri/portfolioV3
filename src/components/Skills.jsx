import { motion } from 'framer-motion'
import { skills } from '../data.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'
import { easeOut } from '../lib.js'

function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

export default function Skills() {
  return (
    <section className="section skills" id="skills">
      <div className="container">
        <Eyebrow index="What I work with">Skills</Eyebrow>
        <RevealLines className="h-xl" lines={[<>Built to break,</>, <>trained to <em>defend.</em></>]} />
        <div className="bento">
          {skills.map((s, i) => (
            <motion.article
              key={s.key}
              className={`card skill-card ${s.key}${s.span === 'wide' ? ' wide' : ''}`}
              onPointerMove={spotlight}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5% 0px' }}
              transition={{ duration: 0.9, ease: easeOut, delay: (i % 3) * 0.08 }}
            >
              <div className="card-head">
                <h3>{s.title}</h3>
                <span className="card-count tnum">{String(s.items.length).padStart(2, '0')} skills</span>
              </div>
              <p className="muted">{s.blurb}</p>
              <ul className="pills">
                {s.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
