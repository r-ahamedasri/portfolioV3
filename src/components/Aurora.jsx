import { useEffect, useRef } from 'react'

// Soft moving light blobs that drift on their own and lean toward the pointer.
const ORBS = [
  { c: [67, 97, 255], r: 0.55, sx: 0.22, sy: 0.35, ax: 0.18, ay: 0.12, s: 0.00011 },
  { c: [255, 106, 61], r: 0.45, sx: 0.78, sy: 0.3, ax: 0.15, ay: 0.18, s: 0.00014 },
  { c: [139, 92, 246], r: 0.5, sx: 0.55, sy: 0.75, ax: 0.22, ay: 0.1, s: 0.00009 },
  { c: [20, 184, 166], r: 0.3, sx: 0.1, sy: 0.85, ax: 0.1, ay: 0.12, s: 0.00017 },
]

export default function Aurora() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, id
    const scale = 0.35
    const mouse = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 }
    const resize = () => {
      w = canvas.width = Math.max(1, Math.floor(canvas.offsetWidth * scale))
      h = canvas.height = Math.max(1, Math.floor(canvas.offsetHeight * scale))
    }
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = (e.clientY - r.top) / r.height
    }
    const draw = (t) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04
      mouse.y += (mouse.ty - mouse.y) * 0.04
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const m = Math.max(w, h)
      ORBS.forEach((o, i) => {
        const pull = i === 0 ? 0.35 : i === 1 ? -0.2 : 0.12
        const x = (o.sx + Math.sin(t * o.s + i) * o.ax + (mouse.x - 0.5) * pull) * w
        const y = (o.sy + Math.cos(t * o.s * 1.3 + i * 2) * o.ay + (mouse.y - 0.5) * pull) * h
        const r = o.r * m
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `rgba(${o.c.join(',')},0.55)`)
        g.addColorStop(0.5, `rgba(${o.c.join(',')},0.16)`)
        g.addColorStop(1, `rgba(${o.c.join(',')},0)`)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      })
      if (!reduced) id = requestAnimationFrame(draw)
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    id = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
  return <canvas ref={ref} className="aurora" aria-hidden="true" />
}
