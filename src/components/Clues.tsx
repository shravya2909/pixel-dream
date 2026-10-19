interface RowCluesProps {
  clues: number[][]
  satisfied: boolean[]
  cellSize: number
}

export function RowClues({ clues, satisfied, cellSize }: RowCluesProps) {
  return (
    <div className="flex flex-col" aria-hidden="true">
      {clues.map((clue, i) => (
        <div
          key={i}
          style={{ height: cellSize }}
          className={`flex items-center justify-end gap-1.5 pr-2 font-pixel text-deep-purple leading-none
            ${satisfied[i] ? 'opacity-35' : 'opacity-100'}`}
        >
          {clue.map((n, j) => (
            <span key={j} style={{ fontSize: Math.max(16, cellSize * 0.6) }}>
              {n}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

interface ColCluesProps {
  clues: number[][]
  satisfied: boolean[]
  cellSize: number
}

export function ColClues({ clues, satisfied, cellSize }: ColCluesProps) {
  return (
    <div className="flex" aria-hidden="true">
      {clues.map((clue, i) => (
        <div
          key={i}
          style={{ width: cellSize }}
          className={`flex flex-col items-center justify-end pb-1 font-pixel text-deep-purple leading-tight
            ${satisfied[i] ? 'opacity-35' : 'opacity-100'}`}
        >
          {clue.map((n, j) => (
            <span key={j} style={{ fontSize: Math.max(16, cellSize * 0.6) }}>
              {n}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
