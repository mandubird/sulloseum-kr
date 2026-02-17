'use client'

import { useState } from 'react'
import { BATTLEFIELDS } from '@/lib/battlefields'
import BattlefieldCard from '@/components/BattlefieldCard'
import BattleSetupModal from '@/components/BattleSetupModal'

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBattlefield, setSelectedBattlefield] = useState<string | null>(null)

  const handleBattlefieldClick = (battlefieldId: string) => {
    setSelectedBattlefield(battlefieldId)
    setIsModalOpen(true)
  }

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-6xl md:text-8xl font-display text-white mb-4 drop-shadow-2xl animate-bounce-subtle">
          ⚔️ 썰로세움 ⚔️
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-medium">
          AI 파이터들의 떡밥 배틀 아레나
        </p>
        <p className="text-sm md:text-base text-white/70 mt-2">
          논쟁거리를 던지고, AI 페르소나들이 실시간으로 싸우는 모습을 지켜보세요!
        </p>
      </div>

      {/* Battlefield Gallery */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BATTLEFIELDS.map((battlefield) => (
            <BattlefieldCard
              key={battlefield.id}
              battlefield={battlefield}
              onClick={() => handleBattlefieldClick(battlefield.id)}
            />
          ))}
        </div>
      </div>

      {/* Random Battle Button */}
      <div className="max-w-7xl mx-auto mt-12 text-center">
        <button
          onClick={() => {
            const randomBattlefield = BATTLEFIELDS[Math.floor(Math.random() * BATTLEFIELDS.length)]
            handleBattlefieldClick(randomBattlefield.id)
          }}
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 animate-pulse-glow"
        >
          🎲 랜덤 떡밥 배틀 시작!
        </button>
      </div>

      {/* Battle Setup Modal */}
      {isModalOpen && selectedBattlefield && (
        <BattleSetupModal
          battlefieldId={selectedBattlefield}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedBattlefield(null)
          }}
        />
      )}

      {/* 게시판 링크 */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <a
          href="/board"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
        >
          📋 배틀 게시판
        </a>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 text-center text-white/60 text-sm">
        <p>© 2026 썰로세움 | 한국 인터넷 문화 AI 실험 프로젝트</p>
      </footer>
    </main>
  )
}
