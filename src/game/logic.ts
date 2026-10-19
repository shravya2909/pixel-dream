export type Grid = number[][]

export type CellState = 'empty' | 'filled' | 'marked'

export function getClueForLine(line: number[]): number[] {
  const clue: number[] = []
  let run = 0
  for (const cell of line) {
    if (cell === 1) {
      run += 1
    } else if (run > 0) {
      clue.push(run)
      run = 0
    }
  }
  if (run > 0) clue.push(run)
  return clue.length > 0 ? clue : [0]
}

export function getRowClues(solution: Grid): number[][] {
  return solution.map((row) => getClueForLine(row))
}

export function getColClues(solution: Grid): number[][] {
  const size = solution.length
  const clues: number[][] = []
  for (let c = 0; c < size; c++) {
    const col = solution.map((row) => row[c])
    clues.push(getClueForLine(col))
  }
  return clues
}

export function isLineSatisfied(clue: number[], line: CellState[]): boolean {
  const filled = line.map((s) => (s === 'filled' ? 1 : 0))
  const actual = getClueForLine(filled)
  if (clue.length === 1 && clue[0] === 0) {
    return actual.length === 1 && actual[0] === 0
  }
  if (actual.length !== clue.length) return false
  return actual.every((v, i) => v === clue[i])
}

export function isPuzzleSolved(board: CellState[][], solution: Grid): boolean {
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      const shouldBeFilled = solution[r][c] === 1
      const isFilled = board[r][c] === 'filled'
      if (shouldBeFilled !== isFilled) return false
    }
  }
  return true
}

export function createEmptyBoard(size: number): CellState[][] {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty' as CellState))
}
