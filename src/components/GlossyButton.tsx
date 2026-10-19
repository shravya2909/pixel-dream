import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>

interface GlossyButtonProps extends NativeButtonProps {
  children: ReactNode
  color?: 'bubblegum' | 'cyber-blue' | 'lime' | 'lavender'
  size?: 'sm' | 'md' | 'lg'
}

const colorMap: Record<string, string> = {
  bubblegum: 'from-pink-300/90 via-bubblegum/80 to-pink-500/90',
  'cyber-blue': 'from-cyan-200/90 via-cyber-blue/80 to-blue-400/90',
  lime: 'from-lime-200/90 via-lime/80 to-green-400/90',
  lavender: 'from-purple-200/90 via-lavender/80 to-purple-400/90',
}

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-5 py-2 text-base',
  lg: 'px-7 py-3 text-lg',
}

export default function GlossyButton({
  children,
  color = 'cyber-blue',
  size = 'md',
  className = '',
  ...rest
}: GlossyButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className={`relative rounded-full font-bubbly font-bold text-deep-purple border border-white/60
        bg-gradient-to-b ${colorMap[color]} ${sizeMap[size]}
        shadow-[0_4px_10px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.8)]
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2/3 h-1/3 rounded-full bg-white/70 blur-[2px]"
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
