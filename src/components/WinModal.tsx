import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Window98 from './Window98'
import GlossyButton from './GlossyButton'
import { formatTime } from '../hooks/useTimer'
import type { Puzzle } from '../game/puzzles'
import { sfxWin } from '../audio/sfx'

interface WinModalProps {
  puzzle: Puzzle
  timeMs: number
  bestMs: number
  onNextPuzzle: () => void
  onBackToMenu: () => void
  hasNext: boolean
}

interface Sparkle {
  id: number
  x: number
  y: number
  delay: number
}

export default function WinModal({ puzzle, timeMs, bestMs, onNextPuzzle, onBackToMenu, hasNext }: WinModalProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const playedRef = useRef(false)

  useEffect(() => {
    if (playedRef.current) return
    playedRef.current = true
    sfxWin()
    setSparkles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.6,
      })),
    )
  }, [])

  const isNewBest = timeMs <= bestMs

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], rotate: 180 }}
            transition={{ duration: 1.4, delay: s.delay, repeat: 1 }}
            className="absolute text-2xl"
            style={{ left: `${s.x}%`, top: `${s.y}%`, color: puzzle.color }}
          >
            ✦
          </motion.span>
        ))}
      </div>
      <Window98 title="u_did_it.exe" className="w-full max-w-sm" footer={null}>
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
            className="grid gap-0.5 p-2 bg-white/60 border border-deep-purple"
            style={{ gridTemplateColumns: `repeat(${puzzle.size}, 6px)` }}
          >
            {puzzle.solution.flat().map((v, i) => (
              <span
                key={i}
                className="block rounded-[1px]"
                style={{ width: 6, height: 6, background: v ? puzzle.color : 'transparent' }}
              />
            ))}
          </motion.div>
          <h2 className="font-chrome text-xl text-deep-purple">u did it!! 🎉</h2>
          <p className="font-bubbly text-sm text-deep-purple/80">"{puzzle.name}" complete</p>
          <div className="font-pixel text-2xl text-win98-navy">{formatTime(timeMs)}</div>
          {isNewBest ? (
            <p className="font-bubbly text-xs text-bubblegum font-bold">new best time!! ✨</p>
          ) : (
            <p className="font-bubbly text-xs text-deep-purple/60">best: {formatTime(bestMs)}</p>
          )}
          <div className="flex gap-3 mt-2">
            <GlossyButton color="lavender" onClick={onBackToMenu}>
              back to menu
            </GlossyButton>
            {hasNext && (
              <GlossyButton color="bubblegum" onClick={onNextPuzzle}>
                next puzzle
              </GlossyButton>
            )}
          </div>
        </div>
      </Window98>
    </div>
  )
}
