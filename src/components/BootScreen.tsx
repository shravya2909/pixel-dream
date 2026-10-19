import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { initAudio, sfxBoot } from '../audio/sfx'

interface BootScreenProps {
  onDone: () => void
}

export default function BootScreen({ onDone }: BootScreenProps) {
  const [progress, setProgress] = useState(0)
  const playedChime = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const duration = 2400
    const start = performance.now()
    let raf: number
    function step() {
      const elapsed = performance.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct >= 100) {
        onDoneRef.current()
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // Intentionally run this timer exactly once on mount — it must not
    // restart just because the parent re-renders and passes a new onDone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFirstInteract() {
    if (playedChime.current) return
    playedChime.current = true
    initAudio()
    sfxBoot()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-deep-purple gap-6"
      onPointerDown={handleFirstInteract}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        onClick={onDone}
        className="absolute top-4 right-4 font-bubbly text-xs text-white/60 underline"
      >
        skip
      </button>
      <h1 className="font-chrome text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white via-cyber-blue to-lavender drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]">
        pixel.dream
      </h1>
      <p className="font-pixel text-lavender text-lg animate-pulse">loading pixel.dream...</p>
      <div className="w-64 h-5 border-2 border-white/60 bg-black/30 shadow-win98in p-0.5">
        <div
          className="h-full bg-gradient-to-r from-bubblegum via-cyber-blue to-lime transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  )
}
