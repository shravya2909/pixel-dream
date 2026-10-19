// Line-solving nonogram solver used to verify that every puzzle has a
// unique solution derivable by pure logic (no guessing/backtracking).
// If constraint propagation can fully determine every cell, that
// assignment is provably the only one consistent with the clues, since
// every cell was a *forced* deduction, not a guess.

import { getRowClues, getColClues } from './logic'

export type LineCell = -1 | 0 | 1 // -1 = unknown, 0 = empty, 1 = filled

function generatePlacements(clue: number[], length: number): number[][] {
  const isEmpty = clue.length === 1 && clue[0] === 0
  if (isEmpty) return [Array(length).fill(0)]

  const placements: number[][] = []
  const blocks = clue
  const n = blocks.length

  function place(blockIndex: number, pos: number, current: number[]): void {
    if (blockIndex === n) {
      const finished = current.slice()
      for (let i = pos; i < length; i++) finished[i] = 0
      placements.push(finished)
      return
    }
    const blockLen = blocks[blockIndex]
    // remaining space needed for all following blocks + gaps between them
    let remaining = blockLen
    for (let i = blockIndex + 1; i < n; i++) remaining += blocks[i] + 1

    for (let start = pos; start + remaining <= length; start++) {
      const next = current.slice()
      for (let i = pos; i < start; i++) next[i] = 0
      for (let i = start; i < start + blockLen; i++) next[i] = 1
      const gapEnd = start + blockLen
      if (gapEnd < length) next[gapEnd] = 0
      place(blockIndex + 1, gapEnd + 1, next)
    }
  }

  place(0, 0, Array(length).fill(-1))
  return placements
}

export function solveLine(clue: number[], known: LineCell[]): LineCell[] | null {
  const length = known.length
  const placements = generatePlacements(clue, length)
  const consistent = placements.filter((p) =>
    p.every((v, i) => known[i] === -1 || known[i] === v),
  )
  if (consistent.length === 0) return null

  const result: LineCell[] = known.slice()
  for (let i = 0; i < length; i++) {
    if (result[i] !== -1) continue
    const first = consistent[0][i]
    if (consistent.every((p) => p[i] === first)) {
      result[i] = first as LineCell
    }
  }
  return result
}

export interface SolveResult {
  grid: LineCell[][]
  solved: boolean
  contradiction: boolean
}

export function solveByLogic(rowClues: number[][], colClues: number[][], size: number): SolveResult {
  let grid: LineCell[][] = Array.from({ length: size }, () => Array(size).fill(-1) as LineCell[])

  let changed = true
  while (changed) {
    changed = false

    for (let r = 0; r < size; r++) {
      const result = solveLine(rowClues[r], grid[r])
      if (result === null) return { grid, solved: false, contradiction: true }
      for (let c = 0; c < size; c++) {
        if (result[c] !== grid[r][c]) {
          grid[r][c] = result[c]
          changed = true
        }
      }
    }

    for (let c = 0; c < size; c++) {
      const col = grid.map((row) => row[c])
      const result = solveLine(colClues[c], col)
      if (result === null) return { grid, solved: false, contradiction: true }
      for (let r = 0; r < size; r++) {
        if (result[r] !== grid[r][c]) {
          grid[r][c] = result[r]
          changed = true
        }
      }
    }
  }

  const solved = grid.every((row) => row.every((cell) => cell !== -1))
  return { grid, solved, contradiction: false }
}

export function verifyUniqueSolution(
  solution: number[][],
  rowClues: number[][],
  colClues: number[][],
): { ok: boolean; reason?: string } {
  const size = solution.length
  const { grid, solved, contradiction } = solveByLogic(rowClues, colClues, size)
  if (contradiction) return { ok: false, reason: 'contradiction during propagation' }
  if (!solved) return { ok: false, reason: 'not fully solvable by logic alone (ambiguous)' }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== solution[r][c]) {
        return { ok: false, reason: `mismatch at row ${r}, col ${c}` }
      }
    }
  }
  return { ok: true }
}

/** Dev-only sanity check: every shipped puzzle must be uniquely solvable by logic alone. */
export function verifyAllPuzzles(puzzleList: { id: string; solution: number[][] }[]): void {
  for (const p of puzzleList) {
    const rowClues = getRowClues(p.solution)
    const colClues = getColClues(p.solution)
    const result = verifyUniqueSolution(p.solution, rowClues, colClues)
    if (result.ok) {
      console.log(`[pixel.dream] puzzle "${p.id}" verified unique + logic-solvable.`)
    } else {
      console.error(`[pixel.dream] puzzle "${p.id}" failed uniqueness check: ${result.reason}`)
    }
  }
}
