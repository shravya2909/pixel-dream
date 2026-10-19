import Cell from './Cell'
import type { CellState } from '../game/logic'

interface MiniGridProps {
  grid: CellState[][]
  cellSize?: number
  label?: string
}

function noop() {
  // decorative illustration — not interactive
}

export default function MiniGrid({ grid, cellSize = 20, label }: MiniGridProps) {
  const cols = grid[0]?.length ?? 0
  return (
    <div role="img" aria-label={label ?? 'illustration'}>
      <div
        aria-hidden="true"
        className="inline-grid border border-deep-purple/60 bg-white/60"
        style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
      >
        {grid.map((row, r) =>
          row.map((state, c) => (
            <Cell
              key={`${r}-${c}`}
              r={r}
              c={c}
              state={state}
              wrong={false}
              focused={false}
              size={cellSize}
              onPointerDownCell={noop}
              onPointerEnterCell={noop}
              onPointerUpCell={noop}
              onKeyDownCell={noop}
            />
          )),
        )}
      </div>
    </div>
  )
}
