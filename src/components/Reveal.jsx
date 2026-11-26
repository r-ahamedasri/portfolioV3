import { motion } from 'framer-motion'
import { ease, easeOut } from '../lib.js'

// Line-by-line masked heading reveal.
export function RevealLines({ lines, as = 'h2', className = '', delay = 0 }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-8% 0px' }}
    >
      {lines.map((l, i) => (
        <span className="mask block" key={i}>
          <motion.span
            className="block"
            variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
            transition={{ duration: 1.1, ease, delay: delay + i * 0.08 }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </M>
  )
}

export function FadeUp({ children, delay = 0, className = '', y = 40, as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1, ease: easeOut, delay }}
    >
      {children}
    </M>
  )
}

export function Eyebrow({ index, children }) {
  return (
    <div className="eyebrow-row">
      <span className="eyebrow">{children}</span>
      <motion.span
        className="eyebrow-line"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease }}
      />
      {index && <span className="eyebrow">{index}</span>}
    </div>
  )
}
