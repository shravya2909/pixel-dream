import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Window98 from './Window98'
import GlossyButton from './GlossyButton'
import MiniGrid from './MiniGrid'
import Cell from './Cell'
import { tutorialPuzzle } from '../game/puzzles'
import { useGameStore } from '../game/store'
import { getRowClues, type CellState } from '../game/logic'
import { sfxFill, sfxTutorialStep } from '../audio/sfx'

interface TutorialStep {
  row: number
  hint: string
}

const rowClues = getRowClues(tutorialPuzzle.solution)

const STEPS: TutorialStep[] = [
  { row: 0, hint: `row 1's clue is "${rowClues[0].join(' ')}" — fill the single glowing square.` },
  { row: 1, hint: `row 2's clue is "${rowClues[1].join(' ')}" — fill three squares in a row.` },
  { row: 2, hint: `row 3's clue is "${rowClues[2].join(' ')}" — the whole row lights up!` },
  { row: 3, hint: `row 4's clue is "${rowClues[3].join(' ')}" — just the middle square again.` },
  { row: 4, hint: `last row! clue "${rowClues[4].join(' ')}" — you know what to do.` },
]

const mascot: CellState[][] = [
  ['empty', 'filled', 'empty', 'filled', 'empty'],
  ['empty', 'filled', 'empty', 'filled', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty'],
  ['filled', 'empty', 'empty', 'empty', 'filled'],
  ['empty', 'filled', 'filled', 'filled', 'empty'],
] as CellState[][]

function noop() {}

interface TutorialProps {
  onSkip: () => void
  onComplete: () => void
}

export default function Tutorial({ onSkip, onComplete }: TutorialProps) {
  const board = useGameStore((s) => s.board)
  const setCell = useGameStore((s) => s.setCell)
  const markTutorialComplete = useGameStore((s) => s.markTutorialComplete)
  const [stepIndex, setStepIndex] = useState(0)
  const [wobble, setWobble] = useState<[number, number] | null>(null)
  const [done, setDone] = useState(false)

  const step = STEPS[stepIndex]
  const targetCols = useMemo(() => {
    const cols: number[] = []
    tutorialPuzzle.solution[step.row].forEach((v, c) => {
      if (v === 1) cols.push(c)
    })
    return cols
  }, [step.row])

  function handleCellClick(r: number, c: number) {
    if (done || r !== step.row) return
    const shouldBeFilled = targetCols.includes(c)
    if (!shouldBeFilled) {
      setWobble([r, c])
      setTimeout(() => setWobble(null), 420)
      return
    }
    const current = board[r]?.[c]
    const next: CellState = current === 'filled' ? 'empty' : 'filled'
    setCell(r, c, next)
    sfxFill()

    const updatedRow = board[r].map((v, ci) => (ci === c ? next : v))
    const rowComplete = updatedRow.every((v, ci) => (targetCols.includes(ci) ? v === 'filled' : v !== 'filled'))
    if (rowComplete) {
      sfxTutorialStep()
      if (stepIndex === STEPS.length - 1) {
        setDone(true)
        markTutorialComplete()
      } else {
        setTimeout(() => setStepIndex((i) => i + 1), 500)
      }
    }
  }

  const size = tutorialPuzzle.size

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3">
      <Window98 title="tutorial.exe" className="w-full max-w-lg">
        <div className="flex flex-col items-center gap-4">
          {!done ? (
            <>
              <div className="flex items-start gap-2 self-start bg-white border-2 border-deep-purple p-2 rounded-lg relative max-w-full">
                <MiniGrid grid={mascot} cellSize={8} label="sparkle mascot" />
                <AnimatePresence mode="wait">
                  <motion.p
                    key={stepIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="font-bubbly text-xs sm:text-sm text-deep-purple"
                  >
                    {step.hint}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div
                role="grid"
                aria-label="tutorial puzzle grid"
                className="grid border-2 border-deep-purple bg-white/40"
                style={{ gridTemplateColumns: `repeat(${size}, 34px)` }}
              >
                {board.map((row, r) =>
                  row.map((state, c) => {
                    const active = r === step.row
                    const isWobbling = wobble?.[0] === r && wobble?.[1] === c
                    return (
                      <motion.div
                        key={`${r}-${c}`}
                        animate={isWobbling ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={{ duration: 0.4 }}
                        className={active ? 'ring-2 ring-cyber-blue ring-inset animate-pulse' : ''}
                      >
                        <Cell
                          r={r}
                          c={c}
                          state={state}
                          wrong={false}
                          focused={false}
                          dimmed={!active}
                          size={34}
                          onPointerDownCell={() => handleCellClick(r, c)}
                          onPointerEnterCell={noop}
                          onPointerUpCell={noop}
                          onKeyDownCell={(rr, cc, e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault()
                              handleCellClick(rr, cc)
                            }
                          }}
                        />
                      </motion.div>
                    )
                  }),
                )}
              </div>

              <GlossyButton size="sm" color="lavender" onClick={onSkip}>
                skip tutorial
              </GlossyButton>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 text-center py-4"
            >
              <div className="font-pixel text-3xl text-lime bg-deep-purple px-3 py-1 rounded">
                tutorial complete! ✦
              </div>
              <p className="font-bubbly text-sm text-deep-purple">
                nice work — you solved it with pure logic. ready for a real puzzle?
              </p>
              <GlossyButton size="lg" color="bubblegum" onClick={onComplete}>
                pick my first puzzle
              </GlossyButton>
            </motion.div>
          )}
        </div>
      </Window98>
    </div>
  )
}
