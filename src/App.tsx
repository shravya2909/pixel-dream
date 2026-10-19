import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Background from './components/Background'
import SparkleCursor from './components/SparkleCursor'
import BootScreen from './components/BootScreen'
import Taskbar from './components/Taskbar'
import PuzzleSelect from './components/PuzzleSelect'
import Board from './components/Board'
import HowToPlay from './components/HowToPlay'
import Tutorial from './components/Tutorial'
import WinModal from './components/WinModal'
import GlossyButton from './components/GlossyButton'
import ConfirmDialog from './components/ConfirmDialog'
import { useGameStore } from './game/store'
import { useTimer } from './hooks/useTimer'
import { puzzles } from './game/puzzles'
import { setMuted } from './audio/sfx'
import './game/verifyPuzzles'

function GameScreen() {
  const currentPuzzleId = useGameStore((s) => s.currentPuzzleId)
  const board = useGameStore((s) => s.board)
  const wrongCells = useGameStore((s) => s.wrongCells)
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const setCell = useGameStore((s) => s.setCell)
  const undo = useGameStore((s) => s.undo)
  const redo = useGameStore((s) => s.redo)
  const checkBoard = useGameStore((s) => s.checkBoard)
  const resetBoard = useGameStore((s) => s.resetBoard)
  const goToMenu = useGameStore((s) => s.goToMenu)
  const openHowToPlay = useGameStore((s) => s.openHowToPlay)
  const won = useGameStore((s) => s.won)
  const elapsedMs = useGameStore((s) => s.elapsedMs)
  const progress = useGameStore((s) => s.progress)
  const startPuzzle = useGameStore((s) => s.startPuzzle)
  const [confirmReset, setConfirmReset] = useState(false)

  const puzzle = puzzles.find((p) => p.id === currentPuzzleId)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undo, redo])

  if (!puzzle) return null

  const idx = puzzles.findIndex((p) => p.id === puzzle.id)
  const nextPuzzle = puzzles[idx + 1]

  return (
    <div className="w-full max-w-4xl mx-auto p-3 pb-20 flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full flex-wrap gap-2">
        <GlossyButton size="sm" color="lavender" onClick={goToMenu}>
          {'<'} back
        </GlossyButton>
        <h2 className="font-chrome font-black text-lg sm:text-xl text-white [text-shadow:0_2px_0_rgba(26,11,61,0.75)] text-center flex-1 min-w-[120px]">
          {puzzle.name}
        </h2>
        <GlossyButton size="sm" color="cyber-blue" onClick={() => openHowToPlay()} aria-label="how to play">
          ?
        </GlossyButton>
      </div>

      <div className="bg-win98-grey shadow-win98out border-2 border-black p-2 sm:p-3 w-full">
        <div className="bg-gradient-to-r from-win98-navy to-cyber-blue px-2 py-1 mb-2 font-bubbly font-bold text-white text-sm">
          puzzle.exe
        </div>
        <Board key={puzzle.id} puzzle={puzzle} board={board} wrongCells={wrongCells} mode={mode} onSetCell={setCell} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <GlossyButton size="sm" onClick={undo} aria-label="undo">
          ↺ undo
        </GlossyButton>
        <GlossyButton size="sm" onClick={redo} aria-label="redo">
          ↻ redo
        </GlossyButton>
        <GlossyButton size="sm" color="lime" onClick={checkBoard} aria-label="check board, costs 30 seconds">
          ✓ check
        </GlossyButton>
        <GlossyButton size="sm" color="bubblegum" onClick={() => setConfirmReset(true)} aria-label="reset board">
          ⟲ reset
        </GlossyButton>
        <div className="sm:hidden flex gap-1" role="group" aria-label="fill or mark mode">
          <GlossyButton
            size="sm"
            color={mode === 'fill' ? 'bubblegum' : 'lavender'}
            onClick={() => setMode('fill')}
            aria-pressed={mode === 'fill'}
          >
            fill
          </GlossyButton>
          <GlossyButton
            size="sm"
            color={mode === 'mark' ? 'bubblegum' : 'lavender'}
            onClick={() => setMode('mark')}
            aria-pressed={mode === 'mark'}
          >
            mark x
          </GlossyButton>
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog
          message="reset this puzzle back to empty? your progress on it will be lost."
          onConfirm={() => {
            resetBoard()
            setConfirmReset(false)
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}

      {won && (
        <WinModal
          puzzle={puzzle}
          timeMs={elapsedMs}
          bestMs={progress.bestTimes[puzzle.id] ?? elapsedMs}
          hasNext={!!nextPuzzle}
          onNextPuzzle={() => nextPuzzle && startPuzzle(nextPuzzle.id)}
          onBackToMenu={goToMenu}
        />
      )}
    </div>
  )
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const goToMenu = useGameStore((s) => s.goToMenu)
  const startPuzzle = useGameStore((s) => s.startPuzzle)
  const startTutorial = useGameStore((s) => s.startTutorial)
  const openHowToPlay = useGameStore((s) => s.openHowToPlay)
  const soundOn = useGameStore((s) => s.soundOn)
  const progress = useGameStore((s) => s.progress)
  const resetAllProgress = useGameStore((s) => s.resetAllProgress)
  const [booted, setBooted] = useState(false)
  const [confirmResetTaskbar, setConfirmResetTaskbar] = useState(false)
  const helpTriggerRef = useRef<HTMLButtonElement>(null)

  useTimer()

  useEffect(() => {
    setMuted(!soundOn)
  }, [soundOn])

  function handleBootDone() {
    if (booted) return
    setBooted(true)
    goToMenu()
    if (!progress.dontShowHowToPlay) {
      openHowToPlay(0)
    }
  }

  return (
    <div className="min-h-screen w-full relative pb-12">
      <Background />
      <SparkleCursor />

      <AnimatePresence>
        {screen === 'boot' && !booted && <BootScreen onDone={handleBootDone} />}
      </AnimatePresence>

      {booted && (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-6">
          <AnimatePresence mode="wait">
            {screen === 'menu' && (
              <motion.div key="menu" exit={{ opacity: 0, scale: 0.98 }}>
                <div className="flex flex-col items-center gap-6 mb-4">
                  <h1 className="font-chrome text-4xl sm:text-5xl font-black text-white [text-shadow:0_3px_0_#1A0B3D,0_0_18px_rgba(255,110,199,0.9)] [-webkit-text-stroke:1.5px_#1A0B3D] animate-float">
                    pixel.dream
                  </h1>
                </div>
                <PuzzleSelect
                  onSelect={startPuzzle}
                  onOpenHowToPlay={() => openHowToPlay()}
                />
                {!progress.tutorialComplete && (
                  <div className="flex justify-center mb-8">
                    <GlossyButton color="lavender" onClick={startTutorial}>
                      try the tutorial
                    </GlossyButton>
                  </div>
                )}
              </motion.div>
            )}

            {screen === 'game' && (
              <motion.div key="game" exit={{ opacity: 0, scale: 0.98 }}>
                <GameScreen />
              </motion.div>
            )}

            {screen === 'tutorial' && (
              <motion.div key="tutorial" exit={{ opacity: 0, scale: 0.98 }}>
                <Tutorial onSkip={goToMenu} onComplete={() => startPuzzle(puzzles[0].id)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      )}

      <HowToPlay onStartTutorial={startTutorial} triggerRef={helpTriggerRef} />

      {confirmResetTaskbar && (
        <ConfirmDialog
          title="reset_progress.exe"
          message="reset ALL progress? this clears every solved puzzle, best time, and setting. this can't be undone."
          onConfirm={() => {
            resetAllProgress()
            setConfirmResetTaskbar(false)
          }}
          onCancel={() => setConfirmResetTaskbar(false)}
        />
      )}

      {booted && (
        <Taskbar
          onNewPuzzle={goToMenu}
          onHowToPlay={() => openHowToPlay()}
          onResetProgress={() => setConfirmResetTaskbar(true)}
        />
      )}

    </div>
  )
}
