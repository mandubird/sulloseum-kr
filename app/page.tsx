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
    <main className="min-h-screen p-4 md:p-8 flex flex-col">
      {/* Header: 모바일에서 밑 빈 공간 축소 */}
      <div className="max-w-7xl mx-auto mb-5 md:mb-12 text-center px-1 shrink-0">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-display text-white mb-4 drop-shadow-2xl animate-bounce-subtle whitespace-nowrap">
          ⚔️ 썰로세움 ⚔️
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-medium">
          AI 파이터들의 떡밥 배틀 아레나
        </p>
        <p className="text-sm md:text-base text-white/70 mt-2">
          논쟁거리를 던지고, AI 페르소나들이 실시간으로 싸우는 모습을 지켜보세요!
        </p>
      </div>

      {/* 본문 영역: flex-1로 남는 공간 채워서 푸터를 항상 화면 맨 아래로 */}
      <div className="flex-1 flex flex-col min-h-0">
      {/* 모바일: 게시판 먼저 · 툭 튀어나오지 않게 섹션으로 감싸서 자연스럽게 */}
      <div className="max-w-7xl mx-auto order-1 md:order-2 w-full shrink-0">
        <section className="md:text-center py-4 md:py-0 md:mb-8">
          <p className="text-white/60 text-xs md:hidden mb-2 px-1">지난 배틀 보기</p>
          <a
            href="/board"
            className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 rounded-xl font-bold transition-all
              bg-white/5 hover:bg-white/15 text-white/95 border border-white/10"
          >
            📋 배틀 게시판
          </a>
        </section>
      </div>

      {/* Battlefield Gallery: 모바일에서 가로로 더 넓게 */}
      <div className="max-w-7xl mx-auto order-2 md:order-1 w-full -mx-2 md:mx-auto px-2 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
      <div className="max-w-7xl mx-auto mt-12 text-center order-3">
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

      {/* Footer: 맨 하단 고정 */}
      <footer className="max-w-7xl mx-auto mt-auto pt-8 pb-6 md:pt-16 text-center text-white/60 text-sm shrink-0">
        <p>© 2026 썰로세움 | 한국 인터넷 문화 AI 실험 프로젝트</p>
      </footer>
    </main>
  )
}
