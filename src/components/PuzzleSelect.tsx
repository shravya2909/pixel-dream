import { motion } from 'framer-motion'
import { puzzles, type Puzzle } from '../game/puzzles'
import { formatTime } from '../hooks/useTimer'
import GlossyButton from './GlossyButton'
import { useGameStore } from '../game/store'

interface PuzzleSelectProps {
  onSelect: (id: string) => void
  onOpenHowToPlay: () => void
}

const difficultyLabels: Record<string, string> = {
  easy: 'easy · 5x5',
  medium: 'medium · 10x10',
  hard: 'hard · 15x15',
}

function PuzzleCard({ puzzle, solved, bestTime, onSelect }: {
  puzzle: Puzzle
  solved: boolean
  bestTime: number | undefined
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -3, rotate: -0.5 }}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col items-center gap-1.5 p-2.5 bg-win98-grey shadow-win98out border border-black w-28 sm:w-32"
      aria-label={`${puzzle.name}${solved ? `, solved, best time ${formatTime(bestTime ?? 0)}` : ', not solved yet'}`}
    >
      <div
        className="grid gap-px p-1 bg-deep-purple/85 border border-black"
        style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`, width: '100%', aspectRatio: '1' }}
      >
        {puzzle.solution.flat().map((v, i) => (
          <span
            key={i}
            className="block"
            style={{ background: solved && v ? puzzle.color : 'transparent' }}
          />
        ))}
      </div>
      <span className="font-bubbly text-xs text-deep-purple font-bold truncate w-full text-center">
        {solved ? puzzle.name : '???'}
      </span>
      <span className="font-pixel text-xs text-deep-purple/70">
        {solved ? formatTime(bestTime ?? 0) : 'unsolved'}
      </span>
    </motion.button>
  )
}

export default function PuzzleSelect({ onSelect, onOpenHowToPlay }: PuzzleSelectProps) {
  const progress = useGameStore((s) => s.progress)
  const groups: Record<string, Puzzle[]> = { easy: [], medium: [], hard: [] }
  for (const p of puzzles) groups[p.difficulty].push(p)

  return (
    <div className="w-full max-w-3xl mx-auto p-4 relative">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-5">
        <span />
        <h2 className="font-chrome font-black text-lg sm:text-xl text-white [text-shadow:0_2px_0_rgba(26,11,61,0.75)]">choose ur puzzle</h2>
        <GlossyButton className="justify-self-end" color="cyber-blue" size="sm" onClick={onOpenHowToPlay} aria-label="how to play">
          ?
        </GlossyButton>
      </div>

      {(['easy', 'medium', 'hard'] as const).map((diff) => (
        <section key={diff} className="mb-6">
          <h3 className="font-bubbly text-sm font-bold text-white mb-2 pl-1 text-center [text-shadow:0_1px_0_rgba(26,11,61,0.75)]">{difficultyLabels[diff]}</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {groups[diff].map((p) => (
              <PuzzleCard
                key={p.id}
                puzzle={p}
                solved={!!progress.solved[p.id]}
                bestTime={progress.bestTimes[p.id]}
                onSelect={() => onSelect(p.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
