import { useEffect, useRef, useState } from 'react'

interface Sparkle {
  id: number
  x: number
  y: number
}

let idCounter = 0

export default function SparkleCursor() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const lastSpawn = useRef(0)

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isTouch || reduced) return

    function handleMove(e: PointerEvent) {
      const now = performance.now()
      if (now - lastSpawn.current < 60) return
      lastSpawn.current = now
      const id = idCounter++
      setSparkles((prev) => [...prev.slice(-14), { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id))
      }, 600)
    }

    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]" aria-hidden="true">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute text-cyber-blue"
          style={{
            left: s.x,
            top: s.y,
            fontSize: 12,
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle-fade 0.6s ease-out forwards',
          }}
        >
          ✦
        </span>
      ))}
      <style>{`
        @keyframes sparkle-fade {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          100% { opacity: 0; transform: translate(-50%, -120%) scale(0.3) rotate(90deg); }
        }
      `}</style>
    </div>
  )
}
