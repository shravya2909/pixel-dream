import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import Cell from './Cell'
import { RowClues, ColClues } from './Clues'
import { getRowClues, getColClues, isLineSatisfied, type CellState } from '../game/logic'
import type { Puzzle } from '../game/puzzles'
import { sfxFill, sfxMark, sfxLineComplete } from '../audio/sfx'

interface BoardProps {
  puzzle: Puzzle
  board: CellState[][]
  wrongCells: [number, number][]
  mode: 'fill' | 'mark'
  onSetCell: (r: number, c: number, state: CellState) => void
  dimmedMask?: boolean[][]
  highlightRow?: number | null
  highlightCol?: number | null
}

function nextState(current: CellState, action: 'fill' | 'mark'): CellState {
  if (action === 'fill') return current === 'filled' ? 'empty' : 'filled'
  return current === 'marked' ? 'empty' : 'marked'
}

export default function Board({
  puzzle,
  board,
  wrongCells,
  mode,
  onSetCell,
  dimmedMask,
  highlightRow,
  highlightCol,
}: BoardProps) {
  const size = puzzle.size
  const rowClues = useMemo(() => getRowClues(puzzle.solution), [puzzle])
  const colClues = useMemo(() => getColClues(puzzle.solution), [puzzle])

  const satisfiedRows = useMemo(
    () => rowClues.map((clue, i) => isLineSatisfied(clue, board[i] ?? [])),
    [rowClues, board],
  )
  const satisfiedCols = useMemo(
    () =>
      colClues.map((clue, j) => {
        const col = board.map((row) => row[j])
        return isLineSatisfied(clue, col)
      }),
    [colClues, board],
  )

  const prevSatisfied = useRef<{ rows: boolean[]; cols: boolean[] }>({
    rows: satisfiedRows.map(() => false),
    cols: satisfiedCols.map(() => false),
  })
  useEffect(() => {
    const prev = prevSatisfied.current
    const newlyRow = satisfiedRows.some((v, i) => v && !prev.rows[i])
    const newlyCol = satisfiedCols.some((v, i) => v && !prev.cols[i])
    if (newlyRow || newlyCol) sfxLineComplete()
    prevSatisfied.current = { rows: satisfiedRows, cols: satisfiedCols }
  }, [satisfiedRows, satisfiedCols])

  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(32)
  const maxRowClueLen = useMemo(() => Math.max(1, ...rowClues.map((c) => c.length)), [rowClues])
  // row-clue gutter width in px: each clue number is ~0.55em wide plus its gap, plus right padding
  const gutterFor = useCallback(
    (cell: number) => Math.ceil(maxRowClueLen * (Math.max(16, cell * 0.6) * 0.6 + 6) + 14),
    [maxRowClueLen],
  )
  const gutter = gutterFor(cellSize)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const minCell = 24
    const maxCell = size <= 5 ? 60 : size <= 10 ? 48 : 38
    function recompute() {
      const width = el!.clientWidth
      let cell = Math.min(maxCell, Math.floor((width - 8) / (size + 2.4)))
      while (cell > minCell && cell * size + gutterFor(cell) + 8 > width) cell--
      setCellSize(Math.max(minCell, cell))
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [size, gutterFor])

  const [focused, setFocused] = useState({ r: 0, c: 0 })
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null)
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const dragRef = useRef<{
    active: boolean
    action: 'fill' | 'mark'
    startR: number
    startC: number
    axis: 'row' | 'col' | null
  } | null>(null)

  function applyToggle(r: number, c: number, action: 'fill' | 'mark') {
    const target = nextState(board[r][c], action)
    onSetCell(r, c, target)
    if (action === 'fill') sfxFill()
    else sfxMark()
  }

  function handlePointerDownCell(r: number, c: number, e: PointerEvent) {
    e.preventDefault()
    const action: 'fill' | 'mark' =
      e.pointerType === 'touch' ? mode : e.button === 2 ? 'mark' : 'fill'
    dragRef.current = { active: true, action, startR: r, startC: c, axis: null }
    applyToggle(r, c, action)
    setFocused({ r, c })
  }

  function handlePointerEnterCell(r: number, c: number, e: PointerEvent) {
    setHover({ r, c })
    const drag = dragRef.current
    if (!drag?.active) return
    if (e.pointerType === 'touch') return
    if (drag.axis === null) {
      if (r === drag.startR && c !== drag.startC) drag.axis = 'row'
      else if (c === drag.startC && r !== drag.startR) drag.axis = 'col'
    }
    if (drag.axis === 'row' && r === drag.startR) {
      applyToggle(r, c, drag.action)
    } else if (drag.axis === 'col' && c === drag.startC) {
      applyToggle(r, c, drag.action)
    }
  }

  function handlePointerUp() {
    if (dragRef.current) dragRef.current.active = false
  }

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  }, [])

  useEffect(() => {
    const key = `${focused.r}-${focused.c}`
    cellRefs.current.get(key)?.focus()
  }, [focused])

  function handleKeyDownCell(r: number, c: number, e: KeyboardEvent) {
    let nr = r
    let nc = c
    if (e.key === 'ArrowUp') nr = Math.max(0, r - 1)
    else if (e.key === 'ArrowDown') nr = Math.min(size - 1, r + 1)
    else if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1)
    else if (e.key === 'ArrowRight') nc = Math.min(size - 1, c + 1)
    else if (e.key === ' ') {
      e.preventDefault()
      applyToggle(r, c, 'fill')
      return
    } else if (e.key.toLowerCase() === 'x') {
      e.preventDefault()
      applyToggle(r, c, 'mark')
      return
    } else return
    e.preventDefault()
    setFocused({ r: nr, c: nc })
  }

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-auto touch-pan-y flex" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="inline-flex flex-col m-auto p-1" style={{ minWidth: cellSize * size + gutter }}>
        <div className="flex" style={{ marginLeft: gutter }}>
          <ColClues clues={colClues} satisfied={satisfiedCols} cellSize={cellSize} />
        </div>
        <div className="flex">
          <div style={{ width: gutter }}>
            <RowClues clues={rowClues} satisfied={satisfiedRows} cellSize={cellSize} />
          </div>
          <div
            role="grid"
            aria-label={`${puzzle.name} puzzle grid, ${size} by ${size}`}
            className="grid border-2 border-deep-purple bg-white/40"
            style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {board.map((row, r) =>
              row.map((state, c) => {
                const wrong = wrongCells.some(([wr, wc]) => wr === r && wc === c)
                const dimmed = dimmedMask ? !dimmedMask[r][c] : false
                const highlighted =
                  (highlightRow != null && highlightRow === r) ||
                  (highlightCol != null && highlightCol === c) ||
                  (hover != null && (hover.r === r || hover.c === c))
                return (
                  <Cell
                    key={`${r}-${c}`}
                    ref={(el) => {
                      if (el) cellRefs.current.set(`${r}-${c}`, el)
                      else cellRefs.current.delete(`${r}-${c}`)
                    }}
                    r={r}
                    c={c}
                    state={state}
                    wrong={wrong}
                    focused={focused.r === r && focused.c === c}
                    dimmed={dimmed}
                    highlighted={highlighted}
                    size={cellSize}
                    onPointerDownCell={handlePointerDownCell}
                    onPointerEnterCell={handlePointerEnterCell}
                    onPointerUpCell={handlePointerUp}
                    onKeyDownCell={handleKeyDownCell}
                  />
                )
              }),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
