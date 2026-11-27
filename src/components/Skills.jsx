import { motion } from 'framer-motion'
import { skills } from '../data.js'
import { brand } from '../skillIcons.js'
import { Eyebrow, RevealLines } from './Reveal.jsx'
import { ease, easeOut, useReducedMotion } from '../lib.js'

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

function spotlight(e) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function Radar() {
  return (
    <svg className="sk-radar" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <linearGradient id="sk-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--ember)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--ember)" stopOpacity=".55" />
        </linearGradient>
      </defs>
      {[90, 66, 42, 18].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}
      <path d="M100 10v180M10 100h180" />
      <g className="sk-radar-arm"><path d="M100 100L190 100A90 90 0 0 0 163.6 36.4Z" fill="url(#sk-sweep)" stroke="none" /></g>
      <circle className="sk-blip" cx="142" cy="70" r="3.5" />
      <circle className="sk-blip b2" cx="62" cy="128" r="2.5" />
    </svg>
  )
}

function Pulse() {
  return (
    <svg className="sk-pulse" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true">
      <path className="sk-pulse-base" d="M0 52 L60 52 L80 46 L100 54 L130 50 L160 52 L190 48 L215 52 L235 14 L252 70 L268 40 L290 52 L330 50 L360 53 L400 51" />
      <path className="sk-pulse-run" d="M0 52 L60 52 L80 46 L100 54 L130 50 L160 52 L190 48 L215 52 L235 14 L252 70 L268 40 L290 52 L330 50 L360 53 L400 51" />
    </svg>
  )
}

export default function Skills() {
  const reduced = useReducedMotion()
  return (
    <section className="section skills" id="skills">
      <div className="container">
        <Eyebrow index="What I work with">Skills</Eyebrow>
        <RevealLines className="h-xl" lines={[<>Built to break,</>, <>trained to <em>defend.</em></>]} />
        <div className="sk-grid">
          {skills.map((s, i) => (
            <motion.article
              key={s.key}
              className={`sk-tile sk-${s.key}`}
              onPointerMove={spotlight}
              initial={reduced ? false : { opacity: 0, y: 60, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ duration: 1, ease, delay: (i % 3) * 0.09 }}
            >
              {s.key === 'offense' && <Radar />}
              {s.key === 'aisec' && <Pulse />}
              <span className="sk-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>

              <header className="sk-head">
                <span className="sk-kicker">
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <i />
                  <span>{String(s.items.length).padStart(2, '0')} tools</span>
                </span>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
              </header>

              <ul className="sk-tools">
                {s.items.map((it, k) => (
                  <motion.li
                    key={it}
                    style={tint(it) ? { '--c': tint(it) } : undefined}
                    initial={reduced ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                    transition={{ duration: 0.6, ease: easeOut, delay: 0.35 + (i % 3) * 0.09 + k * 0.045 }}
                  >
                    <span className="sk-ico"><Icon name={it} /></span>
                    <span className="sk-label">{it}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
