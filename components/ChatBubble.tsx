'use client'
import { motion } from 'framer-motion'
import { ReactionType } from '@/lib/damage'

interface ChatBubbleProps {
  side: 1 | 2
  agentName: string
  agentEmoji: string
  text: string
  reaction?: ReactionType
  damage?: number
  isCritical?: boolean
}

export default function ChatBubble({ side, agentName, agentEmoji, text, reaction, damage, isCritical }: ChatBubbleProps) {
  const isLeft = side === 1

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2 mb-3 ${isLeft ? '' : 'flex-row-reverse'} ${!isLeft ? 'mt-2' : ''}`}
    >
      <span className="text-3xl flex-shrink-0">{agentEmoji}</span>

      <div className={`flex flex-col max-w-[75vw] ${isLeft ? 'items-start' : 'items-end'}`}>
        <span className="text-xs text-gray-400 mb-1 px-1">{agentName}</span>

        <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed
          ${isLeft
            ? 'bg-gray-700 text-white rounded-tl-none'
            : 'bg-blue-600 text-white rounded-tr-none'
          }`}>
          {text}
        </div>

        {/* 데미지 표시 */}
        {damage !== undefined && damage > 0 && (
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className={`text-xs font-black mt-1 px-1 ${isCritical ? 'text-yellow-400' : 'text-red-400'}`}
          >
            {isCritical ? '🔥 CRITICAL! ' : '💥 '}-{damage} 데미지
          </motion.p>
        )}

        {reaction === '병맛' && damage === 0 && (
          <p className="text-xs text-gray-500 mt-1 px-1">🤪 완전 빗나감! (0 데미지)</p>
        )}

        {reaction === '방어' && (
          <p className="text-xs text-blue-400 mt-1 px-1">🛡️ 다음 턴 데미지 50% 감소</p>
        )}
      </div>
    </motion.div>
  )
}
