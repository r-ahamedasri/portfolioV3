import { useState } from 'react'
import { flushSync } from 'react-dom'
import { motion } from 'framer-motion'
import Magnetic from './Magnetic.jsx'

const KEY = 'theme'
const DUR = 1150
const EASE = 'cubic-bezier(0.83, 0, 0.17, 1)'

// Glowing shockwave rings and sparks that ride the edge of the reveal.
function burst(x, y, radius, next) {
  const fx = document.createElement('div')
  fx.className = `theme-fx to-${next}`
  fx.setAttribute('aria-hidden', 'true')
  fx.style.setProperty('--x', `${x}px`)
  fx.style.setProperty('--y', `${y}px`)
  fx.style.setProperty('--r', `${radius}px`)
  fx.style.setProperty('--dur', `${DUR}ms`)
  fx.innerHTML = '<span class="fx-ring"></span><span class="fx-ring fx-ring-2"></span><span class="fx-flash"></span>'
  const n = 18
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i')
    s.className = 'fx-spark'
    s.style.setProperty('--a', `${(360 / n) * i + Math.random() * 14}deg`)
    s.style.setProperty('--d', `${140 + Math.random() * 260}px`)
    s.style.setProperty('--s', `${3 + Math.random() * 5}px`)
    s.style.setProperty('--t', `${600 + Math.random() * 500}ms`)
    s.style.setProperty('--c', ['var(--ember)', 'var(--cobalt)', 'var(--violet)', '#ffd27a'][i % 4])
    fx.appendChild(s)
  }
  return fx
}

function current() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function save(t) {
  try { localStorage.setItem(KEY, t) } catch { /* private mode: keep it for this visit only */ }
}

// Sun/moon switch. The new theme bursts out of the button as an expanding circle
// edged by glowing rings and sparks, while the old page sinks back and blurs.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(current)
  const light = theme === 'light'

  const [spin, setSpin] = useState(0)

  const toggle = (e) => {
    const next = light ? 'dark' : 'light'
    const root = document.documentElement
    const apply = () => {
      root.dataset.theme = next
      setTheme(next)
      save(next)
    }
    setSpin((s) => s + 1)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()

    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const fx = burst(x, y, radius, next)

    // Chrome, Edge, Safari 18+: the real page grows out of the button while the old one sinks away.
    if (document.startViewTransition) {
      const t = document.startViewTransition(() => {
        flushSync(apply)
        document.body.appendChild(fx)
      })
      t.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: DUR, easing: EASE, pseudoElement: '::view-transition-new(root)' }
        )
        root.animate(
          [
            { transform: 'scale(1)', filter: 'brightness(1) blur(0px)', transformOrigin: `${x}px ${y}px` },
            { transform: 'scale(0.9)', filter: 'brightness(0.45) blur(8px)', transformOrigin: `${x}px ${y}px` },
          ],
          { duration: DUR, easing: EASE, pseudoElement: '::view-transition-old(root)' }
        )
      }).catch(() => {})
      t.finished.finally(() => fx.remove())
      return
    }

    // Other browsers: a curtain in the new theme's colour sweeps out, then the page switches under it.
    const cover = document.createElement('div')
    cover.className = 'theme-cover'
    cover.style.background = next === 'light' ? '#f3f0e9' : '#08090d'
    document.body.append(cover, fx)
    const grow = cover.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: DUR, easing: EASE, fill: 'forwards' }
    )
    grow.finished.then(() => {
      apply()
      return cover.animate({ opacity: [1, 0] }, { duration: 450, easing: 'ease-out', fill: 'forwards' }).finished
    }).finally(() => { cover.remove(); fx.remove() })
  }

  return (
    <Magnetic strength={0.4}>
      <button
        id="theme-toggle"
        type="button"
        className={`theme-toggle${light ? ' is-light' : ''}`}
        onClick={toggle}
        aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
        aria-pressed={light}
        data-cursor={light ? 'Dark' : 'Light'}
      >
        <motion.svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          initial={false}
          animate={{ rotate: spin * 360 }}
          transition={{ duration: 1.1, ease: [0.83, 0, 0.17, 1] }}
        >
          <mask id="theme-moon">
            <rect width="24" height="24" fill="#fff" />
            <motion.circle
              r="9"
              fill="#000"
              initial={false}
              animate={light ? { cx: 30, cy: -6 } : { cx: 17, cy: 7 }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            />
          </mask>
          <motion.circle
            cx="12"
            cy="12"
            fill="currentColor"
            mask="url(#theme-moon)"
            initial={false}
            animate={{ r: light ? 5 : 9 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.g
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={false}
            animate={light ? { opacity: 1, rotate: 0, scale: 1 } : { opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            style={{ originX: '12px', originY: '12px' }}
          >
            <line x1="12" y1="1.5" x2="12" y2="3.5" />
            <line x1="12" y1="20.5" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="3.5" y2="12" />
            <line x1="20.5" y1="12" x2="22.5" y2="12" />
            <line x1="4.6" y1="4.6" x2="6" y2="6" />
            <line x1="18" y1="18" x2="19.4" y2="19.4" />
            <line x1="4.6" y1="19.4" x2="6" y2="18" />
            <line x1="18" y1="6" x2="19.4" y2="4.6" />
          </motion.g>
        </motion.svg>
      </button>
    </Magnetic>
  )
}
