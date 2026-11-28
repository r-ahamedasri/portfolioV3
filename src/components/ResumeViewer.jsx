import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

// In-page résumé viewer. It draws the PDF itself with pdf.js (loaded only when opened), so it shows the
// résumé even in browsers set to download PDFs instead of opening them.
const ez = [0.22, 1, 0.36, 1]

// The phone number stays off the site: paint over it (and the "·" before it) in the preview.
// pdf.js can split the number across text runs, so each line is rebuilt with per-character positions first.
// The downloadable PDF itself is unchanged.
const PHONE = /\s*·?\s*\+?\d[\d ()-]{8,}\d/
async function hidePhone(page, vp, ctx) {
  const { items } = await page.getTextContent()
  const lines = new Map()
  for (const it of items) {
    if (!it.str) continue
    const [, , , d, e, f] = it.transform
    const key = Math.round(f)
    const line = lines.get(key) || { h: Math.abs(d), y: f, chars: [] }
    // Proportional offsets inside the run, measured in a similar serif face and scaled to the run's real width.
    ctx.font = '100px "Times New Roman", Times, serif'
    const full = ctx.measureText(it.str).width || 1
    const at = (i) => e + (it.width * ctx.measureText(it.str.slice(0, i)).width) / full
    for (let i = 0; i < it.str.length; i++) line.chars.push({ c: it.str[i], x: at(i), w: at(i + 1) - at(i) })
    lines.set(key, line)
  }
  for (const { h, y, chars } of lines.values()) {
    chars.sort((p, q) => p.x - q.x)
    const m = chars.map((ch) => ch.c).join('').match(PHONE)
    if (!m) continue
    const first = chars[m.index]
    const last = chars[m.index + m[0].length - 1]
    const [ax, ay] = vp.convertToViewportPoint(first.x, y - h * 0.3)
    const [bx, by] = vp.convertToViewportPoint(last.x + last.w, y + h * 1.0)
    ctx.fillStyle = '#fff'
    ctx.fillRect(Math.min(ax, bx), Math.min(ay, by) - 1, Math.abs(bx - ax) + 1, Math.abs(by - ay) + 2)
  }
}

function Pages({ src }) {
  const box = useRef(null)
  const [state, setState] = useState('loading')
  useEffect(() => {
    let dead = false
    let doc
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        const worker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
        pdfjs.GlobalWorkerOptions.workerSrc = worker
        doc = await pdfjs.getDocument(src).promise
        const host = box.current
        if (dead || !host) return
        host.innerHTML = ''
        const width = host.clientWidth
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n)
          if (dead) return
          const base = page.getViewport({ scale: 1 })
          const vp = page.getViewport({ scale: (width / base.width) * dpr })
          const c = document.createElement('canvas')
          c.width = vp.width
          c.height = vp.height
          c.className = 'rv-page'
          c.setAttribute('aria-label', `Résumé page ${n}`)
          host.appendChild(c)
          const ctx = c.getContext('2d')
          await page.render({ canvasContext: ctx, viewport: vp }).promise
          await hidePhone(page, vp, ctx)
        }
        if (!dead) setState('ready')
      } catch (e) {
        if (!dead) setState('error')
      }
    })()
    return () => { dead = true; doc?.destroy() }
  }, [src])
  return (
    <div className="rv-pages" data-state={state}>
      <div ref={box} className="rv-canvas" />
      {state === 'loading' && <div className="rv-status"><span className="rv-spin" />Loading résumé…</div>}
      {state === 'error' && (
        <div className="rv-status">Couldn’t display the résumé here. <a href={src} target="_blank" rel="noreferrer">Open it in a new tab ↗</a></div>
      )}
    </div>
  )
}

export default function ResumeViewer({ open, onClose, src, title }) {
  const closeBtn = useRef(null)
  useEffect(() => {
    if (!open) return
    window.__lenis?.stop()
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const key = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    const t = setTimeout(() => closeBtn.current?.focus(), 50)
    return () => {
      clearTimeout(t)
      document.documentElement.style.overflow = prev
      window.__lenis?.start()
      window.removeEventListener('keydown', key)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="rv"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="rv-panel"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 70, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.7, ease: ez }}
          >
            <header className="rv-bar">
              <span className="rv-name"><i aria-hidden="true" />{title}</span>
              <span className="rv-tools">
                <a className="rv-tool rv-tool--accent" href={src} download>Download ↓</a>
                <a className="rv-tool" href={src} target="_blank" rel="noreferrer" aria-label="Open in new tab">New tab ↗</a>
                <button ref={closeBtn} className="rv-tool rv-close" type="button" onClick={onClose} aria-label="Close preview">×</button>
              </span>
            </header>
            <div className="rv-scroll" data-lenis-prevent>
              <Pages src={src} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
