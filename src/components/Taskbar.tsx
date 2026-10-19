import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../game/store'
import { formatTime } from '../hooks/useTimer'

interface TaskbarProps {
  onNewPuzzle: () => void
  onHowToPlay: () => void
  onResetProgress: () => void
}

export default function Taskbar({ onNewPuzzle, onHowToPlay, onResetProgress }: TaskbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const menuRef = useRef<HTMLDivElement>(null)
  const screen = useGameStore((s) => s.screen)
  const elapsedMs = useGameStore((s) => s.elapsedMs)
  const soundOn = useGameStore((s) => s.soundOn)
  const toggleSound = useGameStore((s) => s.toggleSound)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const timeLabel = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-2 px-2 py-1 bg-win98-grey border-t-2 border-white shadow-[0_-2px_0_#808080]">
      <div className="relative" ref={menuRef}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          className="flex items-center gap-1 px-3 py-1 font-bubbly font-bold text-sm rounded-full
            bg-gradient-to-b from-lime/90 to-green-400/90 border border-white/60
            shadow-[0_2px_6px_rgba(0,0,0,0.25),inset_0_2px_3px_rgba(255,255,255,0.7)]"
        >
          ✦ start
        </motion.button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              role="menu"
              className="absolute bottom-full left-0 mb-1 w-48 bg-win98-grey border-2 border-black shadow-win98out py-1"
            >
              <MenuItem
                label="new puzzle"
                onClick={() => {
                  setMenuOpen(false)
                  onNewPuzzle()
                }}
              />
              <MenuItem
                label="how to play"
                onClick={() => {
                  setMenuOpen(false)
                  onHowToPlay()
                }}
              />
              <MenuItem
                label={soundOn ? 'sound: on' : 'sound: off'}
                onClick={() => {
                  toggleSound()
                }}
              />
              <MenuItem
                label="reset all progress"
                onClick={() => {
                  setMenuOpen(false)
                  onResetProgress()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        {screen === 'game' && (
          <span className="font-pixel text-base text-deep-purple px-2 py-0.5 bg-white/60 border border-black">
            {formatTime(elapsedMs)}
          </span>
        )}
        <span className="font-pixel text-base text-deep-purple px-2 py-0.5 bg-white/60 border border-black">
          {timeLabel}
        </span>
      </div>
    </div>
  )
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 font-bubbly text-sm hover:bg-win98-navy hover:text-white"
    >
      {label}
    </button>
  )
}
