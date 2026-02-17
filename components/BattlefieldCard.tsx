'use client'

import { motion } from 'framer-motion'

interface BattlefieldCardProps {
  battlefield: {
    id: string
    name: string
    emoji: string
    color: string
    gradient: string
    topics: string[]
  }
  onClick: () => void
}

export default function BattlefieldCard({ battlefield, onClick }: BattlefieldCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${battlefield.gradient} p-4 md:p-6 shadow-2xl min-h-[100px] md:h-64 flex flex-col justify-between`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Content: 모바일에서 아이콘·제목 한 줄로 공간 절약 */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl md:text-5xl shrink-0">{battlefield.emoji}</span>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-display text-white truncate">{battlefield.name}</h2>
              <p className="text-white/80 text-xs md:text-sm font-medium">
                {battlefield.topics.length}개의 떡밥 준비됨
              </p>
            </div>
          </div>
        </div>

        {/* Sample Topics Preview */}
        <div className="relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white/90 text-xs">
            <p className="font-medium mb-1">🔥 인기 떡밥:</p>
            <p className="truncate">{battlefield.topics[0]}</p>
          </div>
        </div>

        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-3xl border-4 border-white/0 hover:border-white/30 transition-all duration-300" />
      </div>
    </motion.div>
  )
}
