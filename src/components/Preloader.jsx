import { Component, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ease } from '../lib.js'

// Greetings cycled by the preloader, in a mixed order.
const words = [
  { t: 'Hello' },
  { t: 'Bonjour', lang: 'fr' },
  { t: 'ආයුබෝවන්', lang: 'si' },
  { t: 'Hola', lang: 'es' },
  { t: 'السلام عليكم', lang: 'ar', dir: 'rtl' },
  { t: 'こんにちは', lang: 'ja' },
  { t: 'வணக்கம்', lang: 'ta' },
  { t: 'Hello' },
]

// If anything inside the intro fails (for example a browser extension or auto-translate rewriting the
// greeting text), skip the intro instead of taking the whole page down.
class SkipOnError extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onDone?.() }
  render() { return this.state.failed ? null : this.props.children }
}

export default function Preloader(props) {
  return (
    <SkipOnError onDone={props.onDone}>
      <PreloaderInner {...props} />
    </SkipOnError>
  )
}

function PreloaderInner({ onDone }) {
  const [n, setN] = useState(0)
  const [w, setW] = useState(0)
  const cur = words[w] ?? words[0]

  useEffect(() => {
    const start = performance.now()
    const dur = 2400
    let id
    const tick = (t) => {
      const p = Math.max(0, Math.min(1, (t - start) / dur))
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * 100))
      setW(Math.max(0, Math.min(words.length - 1, Math.floor(p * words.length))))
      if (p < 1) id = requestAnimationFrame(tick)
      else setTimeout(onDone, 250)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [onDone])

  return (
    <motion.div
      className="preloader notranslate"
      translate="no"
      initial={{ y: 0 }}
      exit={{ y: '-100%', borderBottomLeftRadius: '50% 12vh', borderBottomRightRadius: '50% 12vh' }}
      transition={{ duration: 1.1, ease }}
    >
      <div className="pre-top">
        <span>Ahamed Asri©</span>
        <span>Portfolio 2026</span>
      </div>
      <div className="pre-word" aria-live="polite">
        <span className="pre-dot" />
        <motion.span key={w} lang={cur.lang} dir={cur.dir} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {cur.t}
        </motion.span>
      </div>
      <div className="pre-bottom">
        <div className="pre-bar"><span style={{ transform: `scaleX(${n / 100})` }} /></div>
        <div className="pre-count">{String(n).padStart(3, '0')}</div>
      </div>
    </motion.div>
  )
}
