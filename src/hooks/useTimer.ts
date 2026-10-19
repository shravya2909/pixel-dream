import { useEffect, useRef } from 'react'
import { useGameStore } from '../game/store'

export function useTimer(): void {
  const tick = useGameStore((s) => s.tick)
  const timerRunning = useGameStore((s) => s.timerRunning)
  const howToPlayOpen = useGameStore((s) => s.howToPlayOpen)
  const lastRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    function frame(now: number): void {
      if (lastRef.current !== null) {
        const delta = now - lastRef.current
        if (!document.hidden && !howToPlayOpen && timerRunning) {
          tick(delta)
        }
      }
      lastRef.current = now
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      lastRef.current = null
    }
  }, [tick, timerRunning, howToPlayOpen])
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
