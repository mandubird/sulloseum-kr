'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Swords } from 'lucide-react'
import { getBattlefield } from '@/lib/battlefields'
import { supabase, Agent } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface BattleSetupModalProps {
  battlefieldId: string
  initialTopic?: string
  onClose: () => void
}

export default function BattleSetupModal({ battlefieldId, initialTopic, onClose }: BattleSetupModalProps) {
  const router = useRouter()
  const battlefield = getBattlefield(battlefieldId as any)
  const [step, setStep] = useState<1 | 2>(1) // 1: Topic Input, 2: Fighter Selection
  const [topic, setTopic] = useState(initialTopic ?? '')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedFighter1, setSelectedFighter1] = useState<Agent | null>(null)
  const [selectedFighter2, setSelectedFighter2] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  useEffect(() => {
    if (initialTopic != null) setTopic(initialTopic)
  }, [battlefieldId, initialTopic])

  const fetchAgents = async () => {
    const { data, error } = await supabase.from('agents').select('*').order('persona_name')

    if (error) {
      console.error('Error fetching agents:', error)
    } else {
      setAgents(data || [])
    }
  }

  const handleTopicSubmit = () => {
    if (topic.trim()) {
      setStep(2)
    }
  }

  const handleRandomTopic = () => {
    if (battlefield) {
      const randomTopic = battlefield.topics[Math.floor(Math.random() * battlefield.topics.length)]
      setTopic(randomTopic)
    }
  }

  const handleStartBattle = async () => {
    if (!selectedFighter1 || !selectedFighter2 || !topic) return

    setIsLoading(true)

    try {
      // Phase 1: 혼합형 배틀 생성 API (같은 조합 3개 이상이면 재생, 아니면 AI 생성)
      const res = await fetch('/api/create-battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fighter1Id: selectedFighter1.agent_id,
          fighter2Id: selectedFighter2.agent_id,
          topic,
          battlefield: battlefieldId,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || '배틀 생성 실패')

      router.push(`/battle/${data.battleId}`)
    } catch (error: unknown) {
      console.error('Error creating battle:', error)
      let message = '알 수 없는 오류'
      if (error instanceof Error) {
        message = error.message
      } else if (error && typeof error === 'object' && 'message' in error) {
        const msg = (error as { message?: string }).message
        if (msg) message = msg
      }
      alert(`배틀 생성에 실패했습니다. 다시 시도해주세요.\n\n(오류: ${message})`)
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header: 모바일에서 여백 축소해 하단 버튼이 보이도록 */}
          <div className={`bg-gradient-to-r ${battlefield?.gradient} px-5 pt-4 pb-4 md:p-8 text-white`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-5xl shrink-0">{battlefield?.emoji}</span>
              <div>
                <h2 className="text-xl md:text-3xl font-display">{battlefield?.name} 전장</h2>
                <p className="text-white/90 text-sm md:text-base">떡밥을 던지고 파이터를 선택하세요!</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-8">
            {step === 1 ? (
              // Step 1: Topic Input
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-base md:text-lg font-bold mb-2 text-gray-800">
                    <Sparkles className="inline w-4 h-4 md:w-5 md:h-5 mr-2" />
                    떡밥 주제를 입력하세요
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="예: 깻잎은 바람인가?"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-base"
                    rows={2}
                  />
                </div>

                {/* Suggested Topics */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">💡 추천 떡밥:</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {battlefield?.topics.slice(0, 3).map((suggestedTopic, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTopic(suggestedTopic)}
                        className="text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs md:text-sm transition-colors"
                      >
                        {suggestedTopic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: 모바일에서 바로 보이도록 */}
                <div className="flex gap-2 md:gap-3 pt-1">
                  <button
                    onClick={handleRandomTopic}
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-colors"
                  >
                    🎲 랜덤 떡밥
                  </button>
                  <button
                    onClick={handleTopicSubmit}
                    disabled={!topic.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    다음 단계
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Fighter Selection
              <div className="space-y-6">
                <div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-gray-600 hover:text-gray-800 mb-4"
                  >
                    ← 떡밥 수정
                  </button>
                  <div className="bg-gray-100 p-4 rounded-xl mb-6">
                    <p className="text-sm text-gray-600 mb-1">선택한 떡밥:</p>
                    <p className="text-lg font-bold text-gray-800">{topic}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold mb-3 text-gray-800">
                    <Swords className="inline w-5 h-5 mr-2" />
                    파이터를 선택하세요 (2명)
                  </label>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Fighter 1 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                      <p className="text-sm font-bold text-gray-600 mb-2">파이터 1</p>
                      {selectedFighter1 ? (
                        <div className="bg-red-100 rounded-lg p-3">
                          <div className="text-3xl mb-1">{selectedFighter1.avatar_emoji}</div>
                          <p className="font-bold text-red-600">{selectedFighter1.persona_name}</p>
                          <p className="text-xs text-red-500">{selectedFighter1.style}</p>
                        </div>
                      ) : (
                        <div className="text-gray-400 py-6">선택 안 됨</div>
                      )}
                    </div>

                    {/* Fighter 2 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                      <p className="text-sm font-bold text-gray-600 mb-2">파이터 2</p>
                      {selectedFighter2 ? (
                        <div className="bg-blue-100 rounded-lg p-3">
                          <div className="text-3xl mb-1">{selectedFighter2.avatar_emoji}</div>
                          <p className="font-bold text-blue-600">{selectedFighter2.persona_name}</p>
                          <p className="text-xs text-blue-500">{selectedFighter2.style}</p>
                        </div>
                      ) : (
                        <div className="text-gray-400 py-6">선택 안 됨</div>
                      )}
                    </div>
                  </div>

                  {/* Available Fighters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {agents.map((agent) => {
                      const isSelected =
                        selectedFighter1?.agent_id === agent.agent_id ||
                        selectedFighter2?.agent_id === agent.agent_id

                      return (
                        <button
                          key={agent.agent_id}
                          onClick={() => {
                            if (isSelected) {
                              if (selectedFighter1?.agent_id === agent.agent_id) {
                                setSelectedFighter1(null)
                              } else {
                                setSelectedFighter2(null)
                              }
                            } else {
                              if (!selectedFighter1) {
                                setSelectedFighter1(agent)
                              } else if (!selectedFighter2) {
                                setSelectedFighter2(agent)
                              }
                            }
                          }}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-400 bg-white'
                          }`}
                        >
                          <div className="text-3xl mb-1">{agent.avatar_emoji}</div>
                          <p className="font-bold text-sm text-gray-800">{agent.persona_name}</p>
                          <p className="text-xs text-gray-500">{agent.style}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Start Battle Button */}
                <button
                  onClick={handleStartBattle}
                  disabled={!selectedFighter1 || !selectedFighter2 || isLoading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all"
                >
                  {isLoading ? '배틀 준비 중...' : '⚔️ 배틀 시작!'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
