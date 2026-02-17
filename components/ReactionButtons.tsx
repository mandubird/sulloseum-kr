'use client'
import { motion } from 'framer-motion'
import { ReactionType } from '@/lib/damage'

const BUTTONS: { type: ReactionType; emoji: string; damage: string; color: string }[] = [
  { type: '공격', emoji: '⚔️', damage: '-12', color: 'bg-red-700 hover:bg-red-600' },
  { type: '방어', emoji: '🛡️', damage: '50%↓', color: 'bg-blue-700 hover:bg-blue-600' },
  { type: '병맛', emoji: '🤪', damage: '0~20', color: 'bg-yellow-600 hover:bg-yellow-500' },
  { type: '감정', emoji: '😡', damage: '-10', color: 'bg-pink-700 hover:bg-pink-600' },
]

interface ReactionButtonsProps {
  fighterSide: 1 | 2
  fighterName: string
  fighterEmoji: string
  onReaction: (side: 1 | 2, reaction: ReactionType) => void
  disabled: boolean
}

export default function ReactionButtons({ fighterSide, fighterName, fighterEmoji, onReaction, disabled }: ReactionButtonsProps) {
  return (
    <motion.div
      animate={disabled ? { opacity: 0.4 } : { opacity: [1, 0.6, 1] }}
      transition={disabled ? {} : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-3"
    >
      <p className="text-white text-sm font-bold mb-2 text-center animate-pulse">
        🎮 관객 반응을 선택하세요!
      </p>
      <p className="text-gray-300 text-xs mb-3 text-center">
        {fighterEmoji} {fighterName}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => !disabled && onReaction(fighterSide, btn.type)}
            disabled={disabled}
            className={`${btn.color} text-white rounded-xl py-3 px-1
              flex flex-col items-center gap-1
              transition-transform hover:scale-105 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span className="text-xl">{btn.emoji}</span>
            <span className="text-xs font-bold">{btn.type}</span>
            <span className="text-xs opacity-75">{btn.damage}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
