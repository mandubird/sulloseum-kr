'use client'
import { motion } from 'framer-motion'

interface MentalBarProps {
  name: string
  emoji: string
  currentHp: number
  isDefending: boolean
  side: 'left' | 'right'
  compact?: boolean
}

const getBarColor = (hp: number) => {
  if (hp > 60) return 'bg-green-500'
  if (hp > 30) return 'bg-yellow-500'
  return 'bg-red-500 animate-pulse'
}

export default function MentalBar({ name, emoji, currentHp, isDefending, side, compact }: MentalBarProps) {
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <span className={`flex-shrink-0 ${compact ? 'text-2xl md:text-4xl' : 'text-4xl'}`}>{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className={`flex justify-between mb-0.5 md:mb-1 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
          <span className={`font-bold text-white truncate ${compact ? 'text-xs md:text-sm' : 'text-sm'}`}>{name}</span>
          <span className={`text-gray-300 flex items-center gap-1 shrink-0 ${compact ? 'text-xs md:text-sm' : 'text-sm'}`}>
            🧠 {currentHp}%
            {isDefending && <span className="text-blue-400 text-xs animate-pulse">🛡️</span>}
          </span>
        </div>
        <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${compact ? 'h-3 md:h-5' : 'h-5'}`}>
          <motion.div
            className={`h-full rounded-full ${getBarColor(currentHp)}`}
            animate={{ width: `${Math.max(0, currentHp)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}
