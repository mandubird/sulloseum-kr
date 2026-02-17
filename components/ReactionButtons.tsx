'use client'
import { motion } from 'framer-motion'
import { ReactionType } from '@/lib/damage'

const BUTTONS: { type: ReactionType; emoji: string; damage: string; color: string }[] = [
  { type: '공격', emoji: '⚔️', damage: '-22', color: 'bg-red-700 hover:bg-red-600' },
  { type: '방어', emoji: '🛡️', damage: '50%↓', color: 'bg-blue-700 hover:bg-blue-600' },
  { type: '병맛', emoji: '🤪', damage: '4~21', color: 'bg-yellow-600 hover:bg-yellow-500' },
  { type: '감정', emoji: '😡', damage: '-18', color: 'bg-pink-700 hover:bg-pink-600' },
]

interface ReactionButtonsProps {
  fighterSide: 1 | 2
  fighterName: string
  fighterEmoji: string
  onReaction: (side: 1 | 2, reaction: ReactionType) => void
  disabled: boolean
  compact?: boolean
}

export default function ReactionButtons({ fighterSide, fighterName, fighterEmoji, onReaction, disabled, compact }: ReactionButtonsProps) {
  return (
    <motion.div
      animate={disabled ? { opacity: 0.4 } : { opacity: [1, 0.6, 1] }}
      transition={disabled ? {} : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl mb-2 md:mb-3 ${compact ? 'p-2 md:p-4' : 'p-4'}`}
    >
      <p className={`text-white font-bold text-center animate-pulse ${compact ? 'text-xs mb-1 md:text-sm md:mb-2' : 'text-sm mb-2'}`}>
        🎮 관객 반응
      </p>
      <p className={`text-gray-300 text-center ${compact ? 'text-[10px] mb-1.5 md:text-xs md:mb-3' : 'text-xs mb-3'}`}>
        {fighterEmoji} {fighterName}
      </p>
      <div className={`grid grid-cols-4 ${compact ? 'gap-1 md:gap-2' : 'gap-2'}`}>
        {BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => !disabled && onReaction(fighterSide, btn.type)}
            disabled={disabled}
            className={`${btn.color} text-white rounded-lg md:rounded-xl px-0.5
              flex flex-col items-center
              transition-transform hover:scale-105 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              ${compact ? 'py-1.5 gap-0.5 md:py-3 md:gap-1' : 'py-3 gap-1'}`}
          >
            <span className={compact ? 'text-base md:text-xl' : 'text-xl'}>{btn.emoji}</span>
            <span className={compact ? 'text-[10px] md:text-xs font-bold' : 'text-xs font-bold'}>{btn.type}</span>
            <span className={`opacity-75 ${compact ? 'text-[8px] md:text-xs hidden sm:inline' : 'text-xs'}`}>{btn.damage}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
