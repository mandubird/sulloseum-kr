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
  onReplay: () => void
  onRevenge: () => void
}

export default function BattleResult({
  winnerName, winnerEmoji, loserName, loserEmoji,
  winnerHp, mvpStatement, mvpDamage, battleId,
  onReplay, onRevenge,
}: BattleResultProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `⚔️ 썰로세움 AI 배틀\n🔥 ${winnerName} vs ${loserName}\n\n🏆 승리: ${winnerName} (멘탈 ${winnerHp}% 잔존)\n💥 ${loserName} 멘탈 박살\n\n💬 MVP 대사: "${mvpStatement}"\n\n#썰로세움 #AI배틀 #멘탈박살`

  const getShareUrl = () => (typeof window !== 'undefined' ? `${window.location.origin}/battle/${battleId}` : '')

  const copyLink = () => {
    const url = getShareUrl()
    if (url) navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareKakao = async () => {
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

  const shareX = () => {
    const url = getShareUrl()
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + '\n\n' + url)}`, '_blank')
  }

  const shareInstagram = async () => {
    const url = getShareUrl()
    await navigator.clipboard.writeText(`${shareText}\n\n${url}`)
    alert('복사됐어요. 인스타 스토리/DM에 붙여넣기 하세요.')
  }

  const shareSms = () => {
    const url = getShareUrl()
    window.location.href = `sms:?body=${encodeURIComponent(shareText + '\n\n' + url)}`
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
        <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-yellow-500/30">
          <p className="text-yellow-400 text-xs font-bold mb-2">
            💬 MVP 대사 ({mvpDamage} 데미지)
          </p>
          <p className="text-white font-medium">"{mvpStatement}"</p>
        </div>
      )}

      {/* 공유 유도 버튼 3개 */}
      <div className="space-y-3">
        <button
          onClick={onReplay}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105"
        >
          🔄 이 조합 다시 도전
        </button>

        <button
          onClick={onRevenge}
          className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold transition-all hover:scale-105"
        >
          😤 {loserEmoji} {loserName}으로 복수하기
        </button>

        <button
          onClick={copyLink}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all"
        >
          {copied ? '✅ 링크 복사됨!' : '📤 친구에게 도전 보내기'}
        </button>

        <p className="text-gray-400 text-sm font-bold mt-4 mb-2">📢 결과 공유하기</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={shareKakao}
            className="py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl font-bold transition-all text-sm"
          >
            💬 카톡
          </button>
          <button
            onClick={shareX}
            className="py-3 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 rounded-xl font-bold transition-all text-sm"
          >
            𝕏 X
          </button>
          <button
            onClick={shareInstagram}
            className="py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-xl font-bold transition-all text-sm"
          >
            📸 인스타
          </button>
          <button
            onClick={shareSms}
            className="py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl font-bold transition-all text-sm"
          >
            📱 문자
          </button>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-4">
        #썰로세움 #AI배틀 #멘탈박살
      </p>
    </motion.div>
  )
}
