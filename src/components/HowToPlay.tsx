import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Window98 from './Window98'
import Tabs98 from './Tabs98'
import GlossyButton from './GlossyButton'
import MiniGrid from './MiniGrid'
import ConfirmDialog from './ConfirmDialog'
import { useGameStore } from '../game/store'
import type { CellState } from '../game/logic'
import { sfxTick } from '../audio/sfx'

const E: CellState = 'empty'
const F: CellState = 'filled'
const M: CellState = 'marked'

const TABS = [
  { id: 'basics', label: 'basics' },
  { id: 'controls', label: 'controls' },
  { id: 'strategy', label: 'strategy' },
  { id: 'tutorial', label: 'tutorial' },
  { id: 'scoring', label: 'scoring & extras' },
]

interface HowToPlayProps {
  onStartTutorial: () => void
  triggerRef?: RefObject<HTMLElement | null>
}

function useLoop(frames: CellState[][][], intervalMs: number, resetKey: number) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    setFrame(0)
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % frames.length)
    }, intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, frames.length, intervalMs])
  return frames[frame]
}

export default function HowToPlay({ onStartTutorial, triggerRef }: HowToPlayProps) {
  const isOpen = useGameStore((s) => s.howToPlayOpen)
  const activeTab = useGameStore((s) => s.howToPlayTab)
  const setActiveTab = useGameStore((s) => s.setHowToPlayTab)
  const closeHowToPlay = useGameStore((s) => s.closeHowToPlay)
  const dontShow = useGameStore((s) => s.progress.dontShowHowToPlay)
  const setDontShow = useGameStore((s) => s.setDontShowHowToPlay)
  const resetAllProgress = useGameStore((s) => s.resetAllProgress)
  const [confirmReset, setConfirmReset] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus()
    } else {
      triggerRef?.current?.focus()
    }
  }, [isOpen, triggerRef])

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeHowToPlay()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, closeHowToPlay])

  if (!isOpen) return null

  function goNext() {
    sfxTick()
    setActiveTab(Math.min(TABS.length - 1, activeTab + 1))
  }
  function goBack() {
    sfxTick()
    setActiveTab(Math.max(0, activeTab - 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <Window98
        title="how_to_play.txt"
        onClose={closeHowToPlay}
        draggable
        className="w-full h-full sm:h-auto sm:w-full sm:max-w-2xl sm:max-h-[85vh]"
        footer={
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 font-bubbly text-xs text-deep-purple">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="accent-bubblegum"
              />
              don't show this again
            </label>
            <div className="flex gap-2">
              <GlossyButton size="sm" color="lavender" onClick={goBack} disabled={activeTab === 0}>
                {'<'} back
              </GlossyButton>
              <GlossyButton size="sm" color="cyber-blue" onClick={goNext} disabled={activeTab === TABS.length - 1}>
                next {'>'}
              </GlossyButton>
            </div>
          </div>
        }
      >
        <div ref={panelRef} tabIndex={-1} className="flex flex-col gap-2 outline-none">
          <Tabs98 tabs={TABS} activeIndex={activeTab} onChange={setActiveTab} idPrefix="htp" />
          <div className="bg-white/70 border-2 border-t-0 border-black p-3 min-h-[280px] max-h-[55vh] overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                role="tabpanel"
                id={`htp-panel-${TABS[activeTab].id}`}
                aria-labelledby={`htp-tab-${TABS[activeTab].id}`}
              >
                {activeTab === 0 && <BasicsTab />}
                {activeTab === 1 && <ControlsTab />}
                {activeTab === 2 && <StrategyTab />}
                {activeTab === 3 && (
                  <TutorialTab
                    onStartTutorial={() => {
                      closeHowToPlay()
                      onStartTutorial()
                    }}
                  />
                )}
                {activeTab === 4 && <ScoringTab onReset={() => setConfirmReset(true)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Window98>
      {confirmReset && (
        <ConfirmDialog
          title="reset_progress.exe"
          message="reset ALL progress? this clears every solved puzzle, best time, and setting. this can't be undone."
          onConfirm={() => {
            resetAllProgress()
            setConfirmReset(false)
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </div>
  )
}

function BasicsTab() {
  return (
    <div className="flex flex-col gap-3 font-bubbly text-sm text-deep-purple">
      <p>
        a nonogram is a picture-logic puzzle: fill in the right squares on a grid to reveal a
        hidden pixel picture.
      </p>
      <p>
        each row and column has clue numbers. every number is a block of filled squares in that
        line, in order, with at least one empty square between blocks.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-start bg-lavender/10 p-2 border border-deep-purple/30">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-lg text-lavender w-6 text-right">3</span>
          <MiniGrid grid={[[E, F, F, F, E]]} label="a row with clue three, showing three filled squares together" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-lg text-lavender w-8 text-right">1 1</span>
          <MiniGrid grid={[[F, E, E, F, E]]} label="a row with clue one, one, showing two separate single squares" />
        </div>
      </div>
      <p>a clue of "0" means the whole line stays empty.</p>
    </div>
  )
}

function ControlsTab() {
  const fillFrames: CellState[][][] = [[[E]], [[F]]]
  const markFrames: CellState[][][] = [[[E]], [[M]]]
  const fill = useLoop(fillFrames, 700, 0)
  const mark = useLoop(markFrames, 700, 0)

  return (
    <div className="grid sm:grid-cols-2 gap-4 font-bubbly text-sm text-deep-purple">
      <div>
        <h3 className="font-bold mb-2">🖥️ desktop</h3>
        <ul className="space-y-2">
          <ControlRow demo={<MiniGrid grid={fill} label="cell popping filled" />} text="left-click: fill a square" />
          <ControlRow demo={<MiniGrid grid={mark} label="x mark appearing" />} text="right-click: mark with an X" />
          <li className="text-xs opacity-80">drag across a row or column to paint a whole line</li>
          <li className="text-xs opacity-80">arrow keys move the focus ring, space fills, x marks</li>
          <li className="text-xs opacity-80">ctrl+z / ctrl+y to undo / redo</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2">📱 mobile</h3>
        <ul className="space-y-2">
          <li className="text-xs opacity-80">tap a square to apply the current mode (fill or mark)</li>
          <li className="text-xs opacity-80">use the fill / mark toggle button to switch modes</li>
          <li className="text-xs opacity-80">pinch to zoom on bigger boards</li>
        </ul>
      </div>
    </div>
  )
}

function ControlRow({ demo, text }: { demo: ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3">
      {demo}
      <span>{text}</span>
    </li>
  )
}

function StrategyTab() {
  const [replayKey, setReplayKey] = useState(0)
  const tips = [
    {
      title: 'big numbers first',
      body: 'in a 5-wide row with clue "4", the middle 3 squares must always be filled no matter where the block sits.',
      frames: [
        [[E, F, F, F, F] as CellState[]],
        [[F, F, F, F, E] as CellState[]],
      ],
    },
    {
      title: "mark what's impossible",
      body: "put an X on squares that can't possibly be filled, to keep track as you deduce.",
      frames: [
        [[E, E, E, E, E] as CellState[]],
        [[M, E, F, E, M] as CellState[]],
      ],
    },
    {
      title: 'finished lines',
      body: "once a line's clue is fully satisfied, X out the rest of that line.",
      frames: [
        [[F, F, E, E, E] as CellState[]],
        [[F, F, M, M, M] as CellState[]],
      ],
    },
    {
      title: 'cross-check',
      body: 'use row clues and column clues together — a deduction in one often unlocks the other.',
      frames: [
        [
          [E, F, E],
          [E, E, E],
          [E, F, E],
        ] as CellState[][],
        [
          [E, F, E],
          [F, F, F],
          [E, F, E],
        ] as CellState[][],
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-3 font-bubbly text-sm text-deep-purple">
      {tips.map((tip, i) => (
        <TipCard key={i} tip={tip} replayKey={replayKey} onReplay={() => setReplayKey((k) => k + 1)} />
      ))}
    </div>
  )
}

function TipCard({
  tip,
  replayKey,
  onReplay,
}: {
  tip: { title: string; body: string; frames: CellState[][][] }
  replayKey: number
  onReplay: () => void
}) {
  const frame = useLoop(tip.frames, 900, replayKey)
  return (
    <div className="flex flex-wrap items-center gap-3 bg-lavender/10 p-2 border border-deep-purple/30">
      <MiniGrid grid={frame} cellSize={18} label={tip.title} />
      <div className="flex-1 min-w-[140px]">
        <p className="font-bold">{tip.title}</p>
        <p className="text-xs opacity-80">{tip.body}</p>
      </div>
      <GlossyButton size="sm" color="cyber-blue" onClick={onReplay} className="shrink-0">
        try a demo
      </GlossyButton>
    </div>
  )
}

function TutorialTab({ onStartTutorial }: { onStartTutorial: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center font-bubbly text-sm text-deep-purple py-6">
      <p>ready to try it yourself? the tutorial walks you through a tiny 5x5 puzzle, step by step.</p>
      <GlossyButton size="lg" color="bubblegum" onClick={onStartTutorial}>
        start tutorial
      </GlossyButton>
    </div>
  )
}

function ScoringTab({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col gap-3 font-bubbly text-sm text-deep-purple">
      <p>the timer starts on your first move and pauses while this window is open or the tab is hidden.</p>
      <p>hitting "check" flashes any wrongly-filled squares in red — but costs you a 30 second penalty.</p>
      <p>your best time per puzzle is saved automatically, and in-progress boards resume right where you left off.</p>
      <p>solving a puzzle unlocks its full-color pixel art on the puzzle select screen.</p>
      <GlossyButton size="sm" color="lavender" onClick={onReset} className="self-start mt-1">
        reset all progress
      </GlossyButton>
    </div>
  )
}
