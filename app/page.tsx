'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BATTLEFIELDS, MAIN_RANDOM_TOPICS } from '@/lib/battlefields'
import BattlefieldCard from '@/components/BattlefieldCard'
import BattleSetupModal from '@/components/BattleSetupModal'

const MOTIVATION_TEXT = [
  '우리는 매일 수많은 논쟁을 마주합니다.',
  '연애, 돈, 직장, 결혼, 세대 차이까지.',
  '',
  '하지만 대부분의 갈등은',
  '감정만 남기고 끝나버립니다.',
  '',
  '썰로세움은',
  '사람 대신 AI 페르소나가',
  '극단적인 입장을 연기하며',
  '다양한 가치관을 실험 관찰하는 공간입니다.',
  '',
  '이곳의 배틀은 누군가를 공격하기 위한 싸움이 아니라,',
  '생각의 차이를 안전하게 관찰하기 위한 장치입니다.',
  '',
  '웃고 넘길 수도 있고,',
  '고개를 끄덕일 수도 있고,',
  '불편할 수도 있습니다.',
  '',
  '그 모든 반응이',
  '우리가 서로를 이해하는 출발점이라고 믿습니다.',
]

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBattlefield, setSelectedBattlefield] = useState<string | null>(null)
  const [initialTopic, setInitialTopic] = useState<string | null>(null)
  const [isMotivationOpen, setIsMotivationOpen] = useState(false)

  const handleBattlefieldClick = (battlefieldId: string, topic?: string) => {
    setSelectedBattlefield(battlefieldId)
    setInitialTopic(topic ?? null)
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
          AI 파이터들의 떡밥 배틀 관찰소
        </p>
        <p className="text-sm md:text-base text-white/70 mt-2">
          🧪 서로 다른 가치관을 실험하는 AI 배틀
          <br />
          🎭 과장된 AI 페르소나가 극단적으로 몰입 연기
        </p>
        <p className="text-white/60 text-xs text-center mt-3 px-1">※ 본 배틀은 특정 세대나 실제 인물과 무관하며, 재미용 실험임을 밝힙니다. ※</p>
      </div>

      {/* 본문: 전장 카드 5개 + 배틀 게시판 배너 (같은 크기) */}
      <div className="flex-1 flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full -mx-2 md:mx-auto px-2 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {BATTLEFIELDS.map((battlefield) => (
            <BattlefieldCard
              key={battlefield.id}
              battlefield={battlefield}
              onClick={() => handleBattlefieldClick(battlefield.id, undefined)}
            />
          ))}
          {/* 배틀 게시판: 전장 카드와 같은 크기·스타일의 배너 */}
          <Link href="/board" className="block">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-600 to-slate-800 p-4 md:p-6 min-h-[100px] md:h-64 flex flex-col justify-between border-2 border-white/40 shadow-xl shadow-black/40 cursor-pointer"
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl md:text-5xl shrink-0">📋</span>
                  <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-display text-white truncate">배틀 게시판</h2>
                    <p className="text-white/80 text-xs md:text-sm font-medium">지난 배틀 보기</p>
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white/90 text-xs">
                  <p className="font-medium mb-1">🔥 완료된 배틀</p>
                  <p className="truncate">리액션·조회수 확인하기</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-3xl border-4 border-white/0 hover:border-white/30 transition-all duration-300" />
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Random Battle Button: 메인 추천 떡밥 목록에서 랜덤 선택 */}
      <div className="max-w-7xl mx-auto mt-12 text-center order-3">
        <button
          onClick={() => {
            const item = MAIN_RANDOM_TOPICS[Math.floor(Math.random() * MAIN_RANDOM_TOPICS.length)]
            handleBattlefieldClick(item.battlefield, item.topic_text)
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
          initialTopic={initialTopic ?? undefined}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedBattlefield(null)
            setInitialTopic(null)
          }}
        />
      )}

      {/* Footer: 제작동기 버튼 + 저작권 */}
      <footer className="max-w-7xl mx-auto mt-auto pt-8 pb-6 md:pt-16 text-center shrink-0">
        <button
          type="button"
          onClick={() => setIsMotivationOpen(true)}
          className="mb-4 px-5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all border border-white/20"
        >
          왜 썰로세움을 만들었나요?
        </button>
        <p className="text-white/60 text-sm">© 2026 썰로세움 | 한국 인터넷 문화 AI 실험 프로젝트</p>
      </footer>

      {/* 제작동기 모달 */}
      <AnimatePresence>
        {isMotivationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMotivationOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-gray-700 relative"
            >
              <button
                type="button"
                onClick={() => setIsMotivationOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors z-10"
                aria-label="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 text-center pr-8">
                  왜 썰로세움을 만들었나요?
                </h2>
                <div className="space-y-3 text-white/90 text-sm md:text-base leading-relaxed">
                  {MOTIVATION_TEXT.map((line, i) => (
                    <p key={i} className={line === '' ? 'h-3' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsMotivationOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
