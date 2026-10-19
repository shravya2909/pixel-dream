import { verifyAllPuzzles } from './solver'
import { puzzles, tutorialPuzzle } from './puzzles'

if (import.meta.env.DEV) {
  verifyAllPuzzles([tutorialPuzzle, ...puzzles])
}
