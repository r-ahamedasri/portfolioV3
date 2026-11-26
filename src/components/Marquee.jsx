import { useRef } from 'react'
import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion'
import { marqueeA, marqueeB } from '../data.js'

const wrap = (min, max, v) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

function Row({ items, base = 3, outline = false }) {
  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(vel, [0, 1000], [0, 4], { clamp: false })
  const dir = useRef(base > 0 ? 1 : -1)
  const tx = useTransform(x, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    let move = dir.current * Math.abs(base) * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = base > 0 ? -1 : 1
    else if (f > 0) dir.current = base > 0 ? 1 : -1
    move += move * Math.abs(f)
    x.set(x.get() - move)
  })

  const seq = [...items, ...items]
  return (
    <div className={`mq-row${outline ? ' outline' : ''}`}>
      <motion.div className="mq-track" style={{ x: tx }}>
        {[0, 1].map((k) => (
          <div className="mq-group" key={k} aria-hidden={k === 1}>
            {seq.map((t, i) => (
              <span className="mq-item" key={i}>
                {t}
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section className="marquee" aria-label="Technologies">
      <Row items={marqueeA} base={2.2} />
      <Row items={marqueeB} base={-1.6} outline />
    </section>
  )
}
