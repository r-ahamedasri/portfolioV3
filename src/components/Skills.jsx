import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { skills } from '../data.js'
import { brand } from '../skillIcons.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'
import { ease, easeOut, useMedia, useReducedMotion } from '../lib.js'

// Tool name -> brand mark (Simple Icons) or one of the line glyphs below for concepts with no logo.
const ICON = {
  'Burp Suite': 'burpsuite', 'OWASP Top 10': 'owasp', Nmap: ':radar', Metasploit: 'metasploit', Netcat: ':terminal',
  'Privilege Escalation': ':key', 'TryHackMe CTFs': 'tryhackme',
  PyTorch: 'pytorch', TensorFlow: 'tensorflow', 'scikit-learn': 'scikitlearn', NumPy: 'numpy', Pandas: 'pandas',
  'Google ADK': 'google', Gemini: 'googlegemini', Ollama: 'ollama', 'Hugging Face': 'huggingface', Embeddings: ':nodes',
  'Anomaly Detection': ':pulse', 'Phishing Detection': ':mail', 'Log Analysis': ':lines', 'Threat Detection': ':radar',
  'TCP/IP': ':network', Wireshark: 'wireshark', tcpdump: ':terminal', 'Firewalls & IDS': ':shield', VPNs: ':lock', SIEM: ':chart',
  Linux: 'linux', Bash: 'gnubash', Docker: 'docker', AWS: 'amazonwebservices', 'Cloud IAM': ':key',
  Python: 'python', Rust: 'rust', Java: 'openjdk', 'C / C++': 'cplusplus', TypeScript: 'typescript', React: 'react', FastAPI: 'fastapi', Git: 'git',
}

const GLYPH = {
  radar: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><path d="M12 12l6-6" /><circle cx="15.5" cy="9.5" r="1" fill="currentColor" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3M12 15h5" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l2 2M14 9l2 2" /></>,
  nodes: <><circle cx="6" cy="6" r="2.2" /><circle cx="18" cy="8" r="2.2" /><circle cx="10" cy="18" r="2.2" /><path d="M8 7l8 1M7 8l2 8M16.5 9.8L11.5 16.4" /></>,
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  lines: <path d="M4 6h16M4 10h10M4 14h16M4 18h7" />,
  network: <><rect x="9" y="3" width="6" height="5" rx="1" /><rect x="3" y="16" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><path d="M12 8v4M6 16v-4h12v4" /></>,
  shield: <><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
}

// Dark brand colours (Rust, Ollama...) would vanish on the dark tiles, so they glow in the text colour instead.
const dark = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255
  return 0.299 * r + 0.587 * g + 0.114 * b < 70
}

function Icon({ name }) {
  const key = ICON[name]
  if (key && !key.startsWith(':') && brand[key]) {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={brand[key].d} fill="currentColor" /></svg>
  }
  const g = GLYPH[(key || ':terminal').slice(1)] || GLYPH.terminal
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{g}</svg>
}

function tint(name) {
  const key = ICON[name]
  const b = key && brand[key]
  if (!b || dark(b.hex)) return undefined
  return b.hex
}

const pad2 = (n) => String(n).padStart(2, '0')

function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

// Seven category tabs on the left; the chosen one fills the wall on the right with its tools,
// one logo tile each. Switching tabs slides the indicator across and re-deals the tiles.
export default function Skills() {
  const reduced = useReducedMotion()
  const narrow = useMedia('(max-width: 900px)')
  const [cur, setCur] = useState(0)
  const tabs = useRef(null)
  const s = skills[cur]

  const pick = (i, e) => {
    setCur(i)
    if (narrow && e?.currentTarget) e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  const onKey = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    e.preventDefault()
    const next = (cur + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + skills.length) % skills.length
    setCur(next)
    tabs.current?.querySelectorAll('[role="tab"]')[next]?.focus()
  }

  return (
    <section className="section skills" id="skills">
      <div className="container">
        <Eyebrow index="What I work with">Skills</Eyebrow>
        <RevealLines className="h-xl" lines={[<><span className="h-lead">Skills</span> <em>I’m putting</em></>, <><em>to work</em></>]} />

        <motion.div
          className="skt"
          initial={reduced ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1, ease }}
        >
          <div className="skt-tabs" role="tablist" aria-label="Skill areas" aria-orientation={narrow ? 'horizontal' : 'vertical'} ref={tabs} onKeyDown={onKey}>
            {skills.map((g, i) => (
              <button
                key={g.key}
                type="button"
                role="tab"
                id={`skt-tab-${g.key}`}
                aria-selected={i === cur}
                aria-controls="skt-panel"
                tabIndex={i === cur ? 0 : -1}
                className={`skt-tab${i === cur ? ' is-on' : ''}`}
                onClick={(e) => pick(i, e)}
              >
                {i === cur && <motion.span layoutId="skt-ind" className="skt-ind" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                <span className="skt-n">{pad2(i + 1)}</span>
                <span className="skt-name">{g.title}</span>
                <span className="skt-c">{pad2(g.items.length)}</span>
              </button>
            ))}
          </div>

          <div className="skt-panel" id="skt-panel" role="tabpanel" aria-labelledby={`skt-tab-${s.key}`} onPointerMove={spotlight}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.key}
                className="skt-body"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.22 } }}
              >
                <header className="skt-head">
                  <motion.span className="skt-kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
                    {pad2(cur + 1)} / {pad2(skills.length)} · {pad2(s.items.length)} tools
                  </motion.span>
                  <motion.h3 initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.6, ease: easeOut, delay: 0.04 }}>
                    {s.title}
                  </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}>
                    {s.blurb}
                  </motion.p>
                </header>
                <ul className="skt-wall">
                  {s.items.map((it, k) => (
                    <motion.li
                      key={it}
                      style={tint(it) ? { '--c': tint(it) } : undefined}
                      initial={reduced ? false : { opacity: 0, y: 26, scale: 0.92, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      transition={{ duration: 0.6, ease: easeOut, delay: 0.12 + k * 0.05 }}
                    >
                      <span className="skt-ico"><Icon name={it} /></span>
                      <span className="skt-label">{it}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
