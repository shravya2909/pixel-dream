import type { Grid } from './logic'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Puzzle {
  id: string
  name: string
  size: number
  difficulty: Difficulty
  solution: Grid
  color: string
}

function parse(rows: string[]): Grid {
  return rows.map((row) => row.split('').map((ch) => (ch === '1' ? 1 : 0)))
}

export const tutorialPuzzle: Puzzle = {
  id: 'tutorial',
  name: 'tutorial star',
  size: 5,
  difficulty: 'easy',
  color: '#3DDCFF',
  solution: parse(['00100', '01110', '11111', '00100', '00100']),
}

export const puzzles: Puzzle[] = [
  // ---------- 5x5 easy ----------
  {
    id: 'heart-5',
    name: 'heart',
    size: 5,
    difficulty: 'easy',
    color: '#FF6EC7',
    solution: parse(['01010', '11111', '11111', '01110', '00100']),
  },
  {
    id: 'smiley-5',
    name: 'smiley',
    size: 5,
    difficulty: 'easy',
    color: '#B8FF3D',
    solution: parse(['01110', '10101', '11111', '10001', '01110']),
  },
  {
    id: 'star-5',
    name: 'star',
    size: 5,
    difficulty: 'easy',
    color: '#C9A7FF',
    solution: parse(['00100', '01110', '11111', '01010', '10001']),
  },
  {
    id: 'note-5',
    name: 'music note',
    size: 5,
    difficulty: 'easy',
    color: '#3DDCFF',
    solution: parse(['00011', '00001', '00001', '11101', '11110']),
  },
  // ---------- 10x10 medium ----------
  {
    id: 'flipphone-10',
    name: 'flip phone',
    size: 10,
    difficulty: 'medium',
    color: '#FF6EC7',
    solution: parse([
      '0011111000',
      '0111111100',
      '0111111100',
      '0111111100',
      '0111111100',
      '0100000100',
      '0101110100',
      '0101110100',
      '0111111100',
      '0011111000',
    ]),
  },
  {
    id: 'disc-10',
    name: 'CD disc',
    size: 10,
    difficulty: 'medium',
    color: '#3DDCFF',
    solution: parse([
      '0011111100',
      '0111111110',
      '1111111111',
      '1100000011',
      '1100000011',
      '1100000011',
      '1100000011',
      '1111111111',
      '0111111110',
      '0011111100',
    ]),
  },
  {
    id: 'butterfly-10',
    name: 'butterfly',
    size: 10,
    difficulty: 'medium',
    color: '#C9A7FF',
    solution: parse([
      '0110000110',
      '1111001111',
      '1111111111',
      '1111111111',
      '0111001110',
      '0011001100',
      '1111001111',
      '1111111111',
      '1111111111',
      '0110000110',
    ]),
  },
  {
    id: 'lipgloss-10',
    name: 'lip gloss',
    size: 10,
    difficulty: 'medium',
    color: '#FF6EC7',
    solution: parse([
      '0001111000',
      '0011111100',
      '0011111100',
      '0011111100',
      '0011111100',
      '0011111100',
      '0001111000',
      '0000110000',
      '0000110000',
      '0000110000',
    ]),
  },
  {
    id: 'imac-10',
    name: 'iMac G3',
    size: 10,
    difficulty: 'medium',
    color: '#B8FF3D',
    solution: parse([
      '0111111100',
      '1111111110',
      '1111111110',
      '1100000110',
      '1100000110',
      '1111111110',
      '0111111100',
      '0001111000',
      '0011111100',
      '0111111110',
    ]),
  },
  // ---------- 15x15 hard ----------
  {
    id: 'tamagotchi-15',
    name: 'tamagotchi',
    size: 15,
    difficulty: 'hard',
    color: '#B8FF3D',
    solution: parse([
      '000011111100000',
      '000111111111000',
      '001111111111100',
      '011111111111110',
      '011111111111110',
      '111110000111111',
      '111110000111111',
      '111111111111111',
      '111110110111111',
      '111110000111111',
      '011111111111110',
      '011111111111110',
      '001111111111100',
      '000111111111000',
      '000001111000000',
    ]),
  },
  {
    id: 'cassette-15',
    name: 'cassette tape',
    size: 15,
    difficulty: 'hard',
    color: '#C9A7FF',
    solution: parse([
      '111111111111111',
      '111111111111111',
      '110000000000011',
      '110111111111011',
      '110111111111011',
      '110111111111011',
      '110111111111011',
      '110000000000011',
      '110011111100011',
      '110110000110011',
      '110110000110011',
      '110011111100011',
      '110000000000011',
      '111111111111111',
      '111111111111111',
    ]),
  },
  {
    id: 'y2k-15',
    name: 'y2k logo',
    size: 15,
    difficulty: 'hard',
    color: '#3DDCFF',
    solution: parse([
      '110001100011000',
      '110001100011000',
      '011010100010000',
      '011010100010000',
      '001110100010000',
      '001110100010000',
      '000110100010000',
      '000110100010000',
      '000110100010000',
      '000110111110000',
      '000000000000000',
      '011111000011100',
      '000010000101000',
      '000100000101000',
      '011111000111100',
    ]),
  },
]

export const allPuzzles = puzzles
