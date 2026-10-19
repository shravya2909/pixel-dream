import { type ReactNode, useId } from 'react'
import { motion, useDragControls } from 'framer-motion'

interface Window98Props {
  title: string
  children: ReactNode
  onClose?: () => void
  className?: string
  titleId?: string
  footer?: ReactNode
  draggable?: boolean
}

export default function Window98({
  title,
  children,
  onClose,
  className = '',
  titleId,
  footer,
  draggable = false,
}: Window98Props) {
  const autoId = useId()
  const resolvedTitleId = titleId ?? `win98-title-${autoId}`
  const dragControls = useDragControls()

  return (
    <motion.div
      role="dialog"
      aria-labelledby={resolvedTitleId}
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      drag={draggable}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={{ left: -400, right: 400, top: -300, bottom: 300 }}
      className={`flex flex-col bg-win98-grey shadow-win98out border-2 border-black ${className}`}
    >
      <div
        onPointerDown={(e) => draggable && dragControls.start(e)}
        className={`flex items-center justify-between px-1.5 py-1 bg-gradient-to-r from-win98-navy to-cyber-blue shrink-0 ${draggable ? 'cursor-move' : ''}`}
      >
        <span id={resolvedTitleId} className="font-bubbly font-bold text-white text-sm truncate select-none">
          {title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <span
            aria-hidden="true"
            className="w-4 h-4 bg-win98-grey shadow-win98out text-[10px] leading-4 text-center font-bold text-black"
          >
            _
          </span>
          <span
            aria-hidden="true"
            className="w-4 h-4 bg-win98-grey shadow-win98out text-[10px] leading-4 text-center font-bold text-black"
          >
            {'□'}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="close window"
              className="w-4 h-4 bg-win98-grey shadow-win98out text-[10px] leading-4 text-center font-bold text-black active:shadow-win98in"
            >
              X
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">{children}</div>
      {footer && <div className="shrink-0 border-t border-gray-400 p-2">{footer}</div>}
    </motion.div>
  )
}
