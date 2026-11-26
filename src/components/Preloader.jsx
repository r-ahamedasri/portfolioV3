import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ease } from '../lib.js'

const words = ['Hello', 'Bonjour', 'Hola', 'Ciao', 'வணக்கம்', 'こんにちは', 'Hello']

export default function Preloader({ onDone }) {
  const [n, setN] = useState(0)
  const [w, setW] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const dur = 2000
    let id
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * 100))
      setW(Math.min(words.length - 1, Math.floor(p * words.length)))
      if (p < 1) id = requestAnimationFrame(tick)
      else setTimeout(onDone, 250)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [onDone])

  return (
    <motion.div
      className="preloader"
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
        <motion.span key={w} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {words[w]}
        </motion.span>
      </div>
      <div className="pre-bottom">
        <div className="pre-bar"><span style={{ transform: `scaleX(${n / 100})` }} /></div>
        <div className="pre-count">{String(n).padStart(3, '0')}</div>
      </div>
    </motion.div>
  )
}
