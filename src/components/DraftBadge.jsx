import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DraftBadge() {
  const [open, setOpen] = useState(true)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="draft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 3 } }}
          exit={{ opacity: 0, y: 20 }}
        >
          <span className="draft-dot" />
          <span>Draft preview. A few details are still being confirmed.</span>
          <button id="draft-close" type="button" onClick={() => setOpen(false)} aria-label="Dismiss draft notice">×</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
