import { create } from 'zustand'
import type { CellState } from './logic'
import { createEmptyBoard, isPuzzleSolved } from './logic'
import { allPuzzles, tutorialPuzzle, type Puzzle } from './puzzles'
import { loadProgress, saveProgress, clearProgress, type ProgressData } from '../hooks/useLocalStorage'

interface HistoryEntry {
  board: CellState[][]
}

interface GameState {
  // navigation
  screen: 'boot' | 'menu' | 'game' | 'tutorial'
  currentPuzzleId: string | null

  // board state
  board: CellState[][]
  history: HistoryEntry[]
  historyIndex: number
  mode: 'fill' | 'mark'

  // timer
  elapsedMs: number
  timerRunning: boolean

  // check feedback
  wrongCells: [number, number][]
  won: boolean

  // persisted progress
  progress: ProgressData

  // ui
  howToPlayOpen: boolean
  howToPlayTab: number
  soundOn: boolean

  // actions
  goToMenu: () => void
  startPuzzle: (id: string) => void
  startTutorial: () => void
  setCell: (r: number, c: number, state: CellState) => void
  applyDrag: (r: number, c: number) => void
  setMode: (mode: 'fill' | 'mark') => void
  undo: () => void
  redo: () => void
  checkBoard: () => void
  resetBoard: () => void
  tick: (deltaMs: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  finishPuzzle: () => void
  openHowToPlay: (tab?: number) => void
  closeHowToPlay: () => void
  setHowToPlayTab: (tab: number) => void
  toggleSound: () => void
  markTutorialComplete: () => void
  setDontShowHowToPlay: (value: boolean) => void
  persistInProgress: () => void
  resetAllProgress: () => void
}

function getPuzzleById(id: string): Puzzle | undefined {
  if (id === 'tutorial') return tutorialPuzzle
  return allPuzzles.find((p) => p.id === id)
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'boot',
  currentPuzzleId: null,
  board: [],
  history: [],
  historyIndex: -1,
  mode: 'fill',
  elapsedMs: 0,
  timerRunning: false,
  wrongCells: [],
  won: false,
  progress: loadProgress(),
  howToPlayOpen: false,
  howToPlayTab: 0,
  soundOn: loadProgress().soundOn,

  goToMenu: () => {
    set({ screen: 'menu', currentPuzzleId: null, timerRunning: false })
  },

  startPuzzle: (id) => {
    const puzzle = getPuzzleById(id)
    if (!puzzle) return
    const saved = get().progress.inProgress[id]
    const board = saved ? saved.board : createEmptyBoard(puzzle.size)
    set({
      screen: 'game',
      currentPuzzleId: id,
      board,
      history: [{ board }],
      historyIndex: 0,
      elapsedMs: saved ? saved.elapsedMs : 0,
      timerRunning: false,
      wrongCells: [],
      won: false,
    })
  },

  startTutorial: () => {
    const board = createEmptyBoard(tutorialPuzzle.size)
    set({
      screen: 'tutorial',
      currentPuzzleId: 'tutorial',
      board,
      history: [{ board }],
      historyIndex: 0,
      elapsedMs: 0,
      timerRunning: false,
      wrongCells: [],
      won: false,
    })
  },

  setCell: (r, c, state) => {
    const { board, history, historyIndex, currentPuzzleId } = get()
    if (board[r][c] === state) return
    const newBoard = board.map((row) => row.slice())
    newBoard[r][c] = state
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ board: newBoard })
    const puzzle = currentPuzzleId ? getPuzzleById(currentPuzzleId) : undefined
    const won = puzzle ? isPuzzleSolved(newBoard, puzzle.solution) : false
    set({
      board: newBoard,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      timerRunning: !won,
      wrongCells: [],
      won,
    })
    if (won && currentPuzzleId && currentPuzzleId !== 'tutorial') get().finishPuzzle()
    get().persistInProgress()
  },

  applyDrag: (r, c) => {
    const { board, mode } = get()
    const current = board[r][c]
    const target: CellState = mode === 'fill' ? (current === 'filled' ? 'empty' : 'filled') : current === 'marked' ? 'empty' : 'marked'
    get().setCell(r, c, target)
  },

  setMode: (mode) => set({ mode }),

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({ board: history[newIndex].board, historyIndex: newIndex, wrongCells: [] })
    get().persistInProgress()
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({ board: history[newIndex].board, historyIndex: newIndex, wrongCells: [] })
    get().persistInProgress()
  },

  checkBoard: () => {
    const { board, currentPuzzleId, elapsedMs } = get()
    const puzzle = currentPuzzleId ? getPuzzleById(currentPuzzleId) : undefined
    if (!puzzle) return
    const wrong: [number, number][] = []
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (board[r][c] === 'filled' && puzzle.solution[r][c] === 0) {
          wrong.push([r, c])
        }
      }
    }
    set({ wrongCells: wrong, elapsedMs: elapsedMs + 30000 })
    setTimeout(() => {
      set({ wrongCells: [] })
    }, 1200)
    get().persistInProgress()
  },

  resetBoard: () => {
    const { currentPuzzleId } = get()
    const puzzle = currentPuzzleId ? getPuzzleById(currentPuzzleId) : undefined
    if (!puzzle) return
    const board = createEmptyBoard(puzzle.size)
    set({
      board,
      history: [{ board }],
      historyIndex: 0,
      elapsedMs: 0,
      timerRunning: false,
      wrongCells: [],
      won: false,
    })
    get().persistInProgress()
  },

  tick: (deltaMs) => {
    const { timerRunning, elapsedMs } = get()
    if (!timerRunning) return
    set({ elapsedMs: elapsedMs + deltaMs })
  },

  pauseTimer: () => set({ timerRunning: false }),
  resumeTimer: () => {
    const { historyIndex } = get()
    if (historyIndex > 0) set({ timerRunning: true })
  },

  finishPuzzle: () => {
    const { currentPuzzleId, elapsedMs, progress } = get()
    if (!currentPuzzleId) return
    const prevBest = progress.bestTimes[currentPuzzleId]
    const best = prevBest ? Math.min(prevBest, elapsedMs) : elapsedMs
    const newProgress: ProgressData = {
      ...progress,
      solved: { ...progress.solved, [currentPuzzleId]: true },
      bestTimes: { ...progress.bestTimes, [currentPuzzleId]: best },
      inProgress: { ...progress.inProgress },
    }
    delete newProgress.inProgress[currentPuzzleId]
    saveProgress(newProgress)
    set({ progress: newProgress, timerRunning: false })
  },

  persistInProgress: () => {
    const { currentPuzzleId, board, elapsedMs, progress } = get()
    if (!currentPuzzleId || currentPuzzleId === 'tutorial') return
    const newProgress: ProgressData = {
      ...progress,
      inProgress: { ...progress.inProgress, [currentPuzzleId]: { board, elapsedMs } },
    }
    saveProgress(newProgress)
    set({ progress: newProgress })
  },

  openHowToPlay: (tab) => set({ howToPlayOpen: true, howToPlayTab: tab ?? get().howToPlayTab }),
  closeHowToPlay: () => set({ howToPlayOpen: false }),
  setHowToPlayTab: (tab) => set({ howToPlayTab: tab }),

  toggleSound: () => {
    const soundOn = !get().soundOn
    const progress = { ...get().progress, soundOn }
    saveProgress(progress)
    set({ soundOn, progress })
  },

  markTutorialComplete: () => {
    const progress = { ...get().progress, tutorialComplete: true }
    saveProgress(progress)
    set({ progress })
  },

  setDontShowHowToPlay: (value) => {
    const progress = { ...get().progress, dontShowHowToPlay: value }
    saveProgress(progress)
    set({ progress })
  },

  resetAllProgress: () => {
    const progress = clearProgress()
    set({ progress, screen: 'menu', currentPuzzleId: null, timerRunning: false })
  },
}))
