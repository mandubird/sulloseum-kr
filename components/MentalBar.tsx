'use client'
import { motion } from 'framer-motion'

interface MentalBarProps {
  name: string
  emoji: string
  currentHp: number
  isDefending: boolean
  side: 'left' | 'right'
}

const getBarColor = (hp: number) => {
  if (hp > 60) return 'bg-green-500'
  if (hp > 30) return 'bg-yellow-500'
  return 'bg-red-500 animate-pulse'
}

export default function MentalBar({ name, emoji, currentHp, isDefending, side }: MentalBarProps) {
  return (
    <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
      <span className="text-4xl flex-shrink-0">{emoji}</span>
      <div className="flex-1">
        <div className={`flex justify-between mb-1 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
          <span className="font-bold text-white text-sm">{name}</span>
          <span className="text-sm text-gray-300 flex items-center gap-1">
            🧠 {currentHp}%
            {isDefending && <span className="text-blue-400 text-xs animate-pulse">🛡️</span>}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-5 overflow-hidden">
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
