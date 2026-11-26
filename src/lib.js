import { useEffect, useState } from 'react'

export const ease = [0.76, 0, 0.24, 1]
export const easeOut = [0.16, 1, 0.3, 1]

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduced(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduced
}

export function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const fn = () => setMatch(mq.matches)
    fn()
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [query])
  return match
}

export function useClock(timeZone) {
  const fmt = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone }).format(new Date())
  const [t, setT] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 1000)
    return () => clearInterval(id)
  }, [timeZone])
  return t
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
