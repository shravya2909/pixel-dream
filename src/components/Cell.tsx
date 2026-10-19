import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { CellState } from '../game/logic'
import type { PointerEvent, KeyboardEvent } from 'react'

interface CellProps {
  r: number
  c: number
  state: CellState
  wrong: boolean
  focused: boolean
  dimmed?: boolean
  highlighted?: boolean
  size: number
  onPointerDownCell: (r: number, c: number, e: PointerEvent) => void
  onPointerEnterCell: (r: number, c: number, e: PointerEvent) => void
  onPointerUpCell: () => void
  onKeyDownCell: (r: number, c: number, e: KeyboardEvent) => void
}

const Cell = forwardRef<HTMLButtonElement, CellProps>(function Cell(
  {
    r,
    c,
    state,
    wrong,
    focused,
    dimmed,
    highlighted,
    size,
    onPointerDownCell,
    onPointerEnterCell,
    onPointerUpCell,
    onKeyDownCell,
  },
  ref,
) {
  const thickBorderR = (c + 1) % 5 === 0
  const thickBorderB = (r + 1) % 5 === 0

  return (
    <button
      ref={ref}
      type="button"
      role="gridcell"
      aria-label={`row ${r + 1} column ${c + 1}, ${state}`}
      aria-pressed={state === 'filled'}
      tabIndex={focused ? 0 : -1}
      data-row={r}
      data-col={c}
      style={{
        width: size,
        height: size,
        borderRight: thickBorderR ? '2px solid #1A0B3D' : '1px solid rgba(26,11,61,0.35)',
        borderBottom: thickBorderB ? '2px solid #1A0B3D' : '1px solid rgba(26,11,61,0.35)',
      }}
      className={`relative flex items-center justify-center select-none touch-none
        ${highlighted ? 'bg-cyan-100/60' : 'bg-white/70'}
        ${dimmed ? 'opacity-40' : ''}
        ${focused ? 'outline outline-2 outline-dashed outline-cyber-blue z-10' : ''}
      `}
      onPointerDown={(e) => onPointerDownCell(r, c, e)}
      onPointerEnter={(e) => onPointerEnterCell(r, c, e)}
      onPointerUp={onPointerUpCell}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => onKeyDownCell(r, c, e)}
    >
      {state === 'filled' && (
        <motion.span
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          className={`block rounded-[3px] ${wrong ? 'bg-red-500' : 'bg-bubblegum'}`}
          style={{
            width: '78%',
            height: '78%',
            boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.25), inset 2px 2px 4px rgba(255,255,255,0.6)',
          }}
        />
      )}
      {state === 'marked' && (
        <svg viewBox="0 0 10 10" width="55%" height="55%" aria-hidden="true">
          <line x1="1" y1="1" x2="9" y2="9" stroke="#FF6EC7" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="9" y1="1" x2="1" y2="9" stroke="#FF6EC7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </button>
  )
})

export default Cell
