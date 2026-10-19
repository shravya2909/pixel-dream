import type { CellState } from '../game/logic'

export interface InProgressEntry {
  board: CellState[][]
  elapsedMs: number
}

export interface ProgressData {
  solved: Record<string, boolean>
  bestTimes: Record<string, number>
  inProgress: Record<string, InProgressEntry>
  soundOn: boolean
  tutorialComplete: boolean
  dontShowHowToPlay: boolean
}

const STORAGE_KEY = 'pixel-dream-progress-v1'

const defaultProgress: ProgressData = {
  solved: {},
  bestTimes: {},
  inProgress: {},
  soundOn: true,
  tutorialComplete: false,
  dontShowHowToPlay: false,
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultProgress }
    const parsed = JSON.parse(raw)
    return {
      solved: parsed.solved ?? {},
      bestTimes: parsed.bestTimes ?? {},
      inProgress: parsed.inProgress ?? {},
      soundOn: parsed.soundOn ?? true,
      tutorialComplete: parsed.tutorialComplete ?? false,
      dontShowHowToPlay: parsed.dontShowHowToPlay ?? false,
    }
  } catch {
    return { ...defaultProgress }
  }
}

export function saveProgress(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently.
  }
}

export function clearProgress(): ProgressData {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  return { ...defaultProgress }
}
