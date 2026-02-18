'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

const getVictoryText = (hp: number) => {
  if (hp >= 70) return '완벽한 압도승!'
  if (hp >= 40) return '멘탈 박살!'
  if (hp >= 20) return '간신히 승리!'
  return '둘 다 멘탈 박살났지만... 승리!'
}

interface BattleResultProps {
  winnerName: string
  winnerEmoji: string
  loserName: string
  loserEmoji: string
  winnerHp: number
  mvpStatement: string
  mvpDamage: number
  battleId: string
  /** 배틀 주제. 있으면 중재 AI 문구에 반영 (배틀마다 다르게) */
  topicText?: string
  onReplay: () => void
  onRevenge: () => void
  onViewBoard: () => void
}

export default function BattleResult({
  winnerName, winnerEmoji, loserName, loserEmoji,
  winnerHp, mvpStatement, mvpDamage, battleId, topicText,
  onReplay, onRevenge, onViewBoard,
}: BattleResultProps) {
  const moderatorMessage = topicText
    ? `결국 가치관과 상황에 따라 달라질 수 있겠네요. "${topicText}"에 대한 당신 생각은?`
    : '결국 가치관과 상황에 따라 달라질 수 있겠네요. 당신 생각은?'
  const [copied, setCopied] = useState(false)

  const shareText = `⚔️ 썰로세움 AI 배틀\n🔥 ${winnerName} vs ${loserName}\n\n🏆 승리: ${winnerName} (멘탈 ${winnerHp}% 잔존)\n💥 ${loserName} 멘탈 박살\n\n💬 MVP 대사: "${mvpStatement}"\n\n#썰로세움 #AI배틀 #멘탈박살`

  const getShareUrl = () => (typeof window !== 'undefined' ? `${window.location.origin}/battle/${battleId}` : '')

  const copyLink = () => {
    const url = getShareUrl()
    if (url) navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleResultShare = async () => {
    const url = getShareUrl()
    const full = `${shareText}\n\n${url}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: '썰로세움 AI 배틀 결과',
          text: shareText,
          url,
        })
      } catch {
        await navigator.clipboard.writeText(full)
        alert('복사됐어요. 카톡 등에 붙여넣기 하세요.')
      }
    } else {
      await navigator.clipboard.writeText(full)
      alert('복사됐어요. 카톡에 붙여넣기 하세요.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-3xl p-6 border border-gray-700"
    >
      {/* 승리 헤더 */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-7xl mb-3"
        >
          {winnerEmoji}
        </motion.div>
        <h2 className="text-3xl font-black text-white">{winnerName} 승리!</h2>
        <p className="text-yellow-400 font-bold text-lg mt-1">{getVictoryText(winnerHp)}</p>
        <p className="text-gray-400 text-sm mt-1">🧠 멘탈 {winnerHp}% 잔존</p>
        <p className="text-red-400 font-bold mt-2">
          💥 {loserEmoji} {loserName} 멘탈 박살
        </p>
      </div>

      {/* MVP 대사 */}
      {mvpStatement && (
        <div className="bg-black/40 rounded-2xl p-4 mb-4 border border-yellow-500/30">
          <p className="text-yellow-400 text-xs font-bold mb-2">
            💬 MVP 대사 ({mvpDamage} 데미지)
          </p>
          <p className="text-white font-medium">"{mvpStatement}"</p>
        </div>
      )}

      {/* 중재 AI 대사 (배틀 주제에 따라 문구 변경) */}
      <div className="bg-gray-700/50 rounded-2xl p-4 mb-6 border border-gray-600 text-center">
        <p className="text-gray-300 text-xs font-bold mb-1">⚖️ 중재 AI</p>
        <p className="text-white/90 text-sm">{moderatorMessage}</p>
      </div>

      {/* 공유 유도 버튼 */}
      <div className="space-y-3">
        <button
          onClick={onRevenge}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105"
        >
          ⚔️ 새 배틀 세우기
        </button>

        <button
          onClick={copyLink}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
        >
          {copied ? '✅ 링크 복사됨!' : '📤 친구에게 도전 보내기'}
        </button>

        <button
          onClick={handleResultShare}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-xl font-bold transition-all"
        >
          📢 결과 공유하기
        </button>

        <div className="mt-6 pt-4 border-t border-gray-600">
          <button
            onClick={onViewBoard}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all border-2 border-emerald-500/50"
          >
            👀 다른 배틀 구경하기
          </button>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-4">
        #썰로세움 #AI배틀 #멘탈박살
      </p>
    </motion.div>
  )
}
