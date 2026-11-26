import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useMedia } from '../lib.js'

export default function Cursor() {
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.6 })
  const [label, setLabel] = useState('')
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('has-cursor')
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target.closest?.('[data-cursor], a, button')
      setHover(!!t)
      setLabel(t?.getAttribute?.('data-cursor') || '')
    }
    const d = () => setDown(true)
    const u = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', d)
    window.addEventListener('pointerup', u)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', d)
      window.removeEventListener('pointerup', u)
    }
  }, [fine, x, y])

  if (!fine) return null
  const size = label ? 96 : hover ? 56 : 14
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} animate={{ opacity: label ? 0 : 1 }} />
      <motion.div
        className={`cursor-ring${label ? ' has-label' : ''}`}
        style={{ x: rx, y: ry }}
        animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      >
        {label && <span>{label}</span>}
      </motion.div>
    </>
  )
}
