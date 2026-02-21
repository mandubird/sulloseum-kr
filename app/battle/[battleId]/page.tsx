'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { calculateDamage, ReactionType, getRandomReaction } from '@/lib/damage'
import MentalBar from '@/components/MentalBar'
import ChatBubble from '@/components/ChatBubble'
import ReactionButtons from '@/components/ReactionButtons'
import BattleResult from '@/components/BattleResult'

interface ChatMessage {
  id: string
  side: 1 | 2
  agentName: string
  agentEmoji: string
  text: string
  reaction?: ReactionType
  damage?: number
  isCritical?: boolean
}

interface FighterInfo {
  agent_id: string
  persona_name: string
  avatar_emoji: string
  description: string
}

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

export default function BattleArena() {
  const params = useParams()
  const searchParams = useSearchParams()
  const battleId = (params?.battleId as string) ?? ''
  const router = useRouter()
  const isFromBoard = searchParams.get('from') === 'board'
  const isRecordMode = searchParams.get('record') === '1'

  const [fighter1, setFighter1] = useState<FighterInfo | null>(null)
  const [fighter2, setFighter2] = useState<FighterInfo | null>(null)
  const [topic, setTopic] = useState('')
  const [battlefield, setBattlefield] = useState('work')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hp1, setHp1] = useState(100)
  const [hp2, setHp2] = useState(100)
  const [isDefending1, setIsDefending1] = useState(false)
  const [isDefending2, setIsDefending2] = useState(false)
  const [phase, setPhase] = useState<'loading' | 'waiting' | 'generating' | 'ended'>('loading')
  const [currentTurn, setCurrentTurn] = useState(1)
  const [lastStatement1, setLastStatement1] = useState('')
  const [lastStatement2, setLastStatement2] = useState('')
  const [criticalVisible, setCriticalVisible] = useState(false)
  const [winnerSide, setWinnerSide] = useState<1 | 2 | null>(null)
  const [mvpStatement, setMvpStatement] = useState('')
  const [mvpDamage, setMvpDamage] = useState(0)
  const [battleCreatedAt, setBattleCreatedAt] = useState('')
  const [replayStep, setReplayStep] = useState(0)
  const [resultExpanded, setResultExpanded] = useState(false)
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null)
  const [autoPlaying, setAutoPlaying] = useState(false)
  const [showReturnReminder, setShowReturnReminder] = useState(false)
  const [isMotivationOpen, setIsMotivationOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const battleTopRef = useRef<HTMLDivElement>(null)
  const inactivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleReactionRef = useRef<(side: 1 | 2, reaction: ReactionType) => Promise<void>>(() => Promise.resolve())
  const viewCountRecordedRef = useRef<string | null>(null)

  useEffect(() => {
    if (battleId) loadBattle()
  }, [battleId])
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, replayStep])

  // 배틀 시작 시 상단(주제)부터 보이도록: 로딩 끝나면 한 번, 첫 두 대사 나온 뒤 한 번
  useEffect(() => {
    if (phase !== 'loading' && topic) {
      window.scrollTo(0, 0)
    }
  }, [phase, topic])
  useEffect(() => {
    if (phase === 'waiting' && messages.length >= 2) {
      battleTopRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' })
    }
  }, [phase, messages.length])

  // handleReaction ref (자동 진행 타이머에서 호출용)
  useEffect(() => {
    handleReactionRef.current = handleReaction
  })

  // 무반응 1분 → "3초 후 자동 진행" → 자동으로 끝날 때까지 진행 (API 효율: 빠르게 결과·게시판화)
  const INACTIVITY_MS = 60 * 1000
  const COUNTDOWN_SEC = 3
  useEffect(() => {
    if (phase !== 'waiting' || !fighter1 || !fighter2 || autoPlaying) {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
        inactivityTimeoutRef.current = null
      }
      setAutoAdvanceCountdown(null)
      return
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      inactivityTimeoutRef.current = null
      setAutoAdvanceCountdown(COUNTDOWN_SEC)
    }, INACTIVITY_MS)
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current)
        inactivityTimeoutRef.current = null
      }
    }
  }, [phase, fighter1, fighter2, autoPlaying])

  useEffect(() => {
    if (autoAdvanceCountdown === null || autoAdvanceCountdown <= 0) return
    countdownIntervalRef.current = setInterval(() => {
      setAutoAdvanceCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (prev === 1) {
            setAutoPlaying(true) // 3초 후 자동 진행 시작 → 끝날 때까지 반복
            const side = Math.random() < 0.5 ? 1 : 2
            handleReactionRef.current(side, getRandomReaction())
          }
          return null
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [autoAdvanceCountdown])

  // 자동 진행: waiting일 때마다 한 턴씩 랜덤 반응 → 끝나면(ended) 중단 (턴 간격으로 대사가 읽기 좋게)
  const AUTO_TURN_DELAY_MS = 2500
  useEffect(() => {
    if (!autoPlaying || !fighter1 || !fighter2) {
      if (phase === 'ended') setAutoPlaying(false)
      return
    }
    if (phase !== 'waiting') return
    const t = setTimeout(() => {
      const side = Math.random() < 0.5 ? 1 : 2
      handleReactionRef.current(side, getRandomReaction())
    }, AUTO_TURN_DELAY_MS)
    return () => clearTimeout(t)
  }, [autoPlaying, phase, fighter1, fighter2])

  // 탭/앱 복귀 시 안내 문구 (3초간 표시)
  const returnReminderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && phase === 'waiting') {
        if (returnReminderTimeoutRef.current) clearTimeout(returnReminderTimeoutRef.current)
        setShowReturnReminder(true)
        returnReminderTimeoutRef.current = setTimeout(() => {
          returnReminderTimeoutRef.current = null
          setShowReturnReminder(false)
        }, 3000)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (returnReminderTimeoutRef.current) {
        clearTimeout(returnReminderTimeoutRef.current)
        returnReminderTimeoutRef.current = null
      }
    }
  }, [phase])

  // 녹화 모드(record=1): 재생을 처음부터 자동 진행 → 전체보기 → 결과 펼침 → 녹화 준비 이벤트
  const RECORD_STEP_MS = 2800
  const RECORD_RESULT_HOLD_MS = 2500
  useEffect(() => {
    if (!isRecordMode || phase !== 'ended' || messages.length === 0) return
    if (replayStep < messages.length) {
      const t = setTimeout(() => setReplayStep((s) => s + 1), RECORD_STEP_MS)
      return () => clearTimeout(t)
    }
    setResultExpanded(true)
    const t = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ssulo:record-ready'))
    }, RECORD_RESULT_HOLD_MS)
    return () => clearTimeout(t)
  }, [isRecordMode, phase, messages.length, replayStep])

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const addMessage = (msg: Omit<ChatMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}` }])
  }

  async function loadBattle() {
    const { data: battle, error } = await supabase
      .from('battles')
      .select('*')
      .eq('battle_id', battleId)
      .single()

    if (error || !battle) {
      router.push('/')
      return
    }
    setTopic(battle.topic_text)
    setBattlefield(battle.battlefield || 'work')

    const p = battle.participants as { fighter1: string; fighter2: string }
    const [
      { data: f1 },
      { data: f2 },
    ] = await Promise.all([
      supabase
        .from('agents')
        .select('agent_id, persona_name, avatar_emoji, description')
        .eq('agent_id', p.fighter1)
        .single(),
      supabase
        .from('agents')
        .select('agent_id, persona_name, avatar_emoji, description')
        .eq('agent_id', p.fighter2)
        .single(),
    ])

    if (!f1 || !f2) return
    setFighter1(f1)
    setFighter2(f2)

    const { data: rounds } = await supabase
      .from('rounds')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true })

    if (rounds && rounds.length > 0) {
      const initialMessages: ChatMessage[] = []
      let latestHp1 = 100,
        latestHp2 = 100
      const fighter1Id = f1.agent_id
      const fighter2Id = f2.agent_id

      for (const round of rounds) {
        const side: 1 | 2 = round.agent_id === fighter1Id ? 1 : 2
        const name = side === 1 ? f1.persona_name : f2.persona_name
        const emoji = side === 1 ? f1.avatar_emoji : f2.avatar_emoji
        initialMessages.push({
          id: `r-${round.round_id}-a`,
          side,
          agentName: name,
          agentEmoji: emoji,
          text: round.statement_text,
          reaction: round.user_reaction,
          damage: round.damage,
          isCritical: round.is_critical,
        })
        if (round.counter_statement) {
          const counterSide: 1 | 2 = side === 1 ? 2 : 1
          const counterName = counterSide === 1 ? f1.persona_name : f2.persona_name
          const counterEmoji = counterSide === 1 ? f1.avatar_emoji : f2.avatar_emoji
          initialMessages.push({
            id: `r-${round.round_id}-c`,
            side: counterSide,
            agentName: counterName,
            agentEmoji: counterEmoji,
            text: round.counter_statement,
          })
        }
        if (round.hp1_after != null) {
          latestHp1 = round.hp1_after
          latestHp2 = round.hp2_after
        }
      }
      setMessages(initialMessages)
      setHp1(latestHp1)
      setHp2(latestHp2)
      if (initialMessages.length >= 2) {
        const last1 = initialMessages.filter((m) => m.side === 1).pop()?.text || ''
        const last2 = initialMessages.filter((m) => m.side === 2).pop()?.text || ''
        setLastStatement1(last1)
        setLastStatement2(last2)
      }
      const turnsAfterFirst = rounds.filter((r) => r.counter_statement).length
      setCurrentTurn(2 + turnsAfterFirst)

      if (battle.status === 'completed') {
        setWinnerSide(latestHp1 > 0 ? 1 : 2)
        setMvpStatement(battle.mvp_statement || '')
        setMvpDamage(battle.mvp_damage || 0)
        setBattleCreatedAt(battle.created_at ? new Date(battle.created_at).toISOString() : new Date().toISOString())
        setPhase('ended')
        setReplayStep(isRecordMode ? 0 : Math.min(2, initialMessages.length))
        if (viewCountRecordedRef.current !== battleId) {
          viewCountRecordedRef.current = battleId
          fetch('/api/battle-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ battleId }),
          }).catch(() => {})
        }
      } else {
        setPhase('waiting')
      }
    } else {
      await startBattle(f1, f2, battle.topic_text, battle.battlefield || 'work')
    }
  }

  async function startBattle(f1: FighterInfo, f2: FighterInfo, topicText: string, battleField: string = 'work') {
    const res = await fetch('/api/generate-first-statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: topicText,
        fighter1Id: f1.agent_id,
        fighter2Id: f2.agent_id,
        battlefield: battleField,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setPhase('ended')
      return
    }
    addMessage({
      side: 1,
      agentName: f1.persona_name,
      agentEmoji: f1.avatar_emoji,
      text: data.statement1 || '덤벼봐.',
    })
    await sleep(700)
    addMessage({
      side: 2,
      agentName: f2.persona_name,
      agentEmoji: f2.avatar_emoji,
      text: data.statement2 || '해보자고.',
    })
    setLastStatement1(data.statement1 || '덤벼봐.')
    setLastStatement2(data.statement2 || '해보자고.')
    setPhase('waiting')
  }

  async function handleReaction(selectedSide: 1 | 2, reaction: ReactionType) {
    if (phase !== 'waiting' || !fighter1 || !fighter2) return
    setAutoAdvanceCountdown(null) // 자동 진행 카운트다운 취소
    setPhase('generating')

    const attacker = selectedSide === 1 ? fighter1 : fighter2
    const defender = selectedSide === 1 ? fighter2 : fighter1
    const lastDefenderStatement = selectedSide === 1 ? lastStatement2 : lastStatement1

    const res = await fetch('/api/generate-battle-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        attackerId: attacker.agent_id,
        defenderId: defender.agent_id,
        reaction,
        lastDefenderStatement,
        turnNumber: currentTurn,
        isFirstTurn: false,
        battlefield,
        previousStatements: messages.map((m) => m.text),
      }),
    })
    const turnData = await res.json().catch(() => ({}))
    const attackStatement = turnData.attackStatement || '...'
    const counterStatement = turnData.counterStatement || '...'

    const dmg = calculateDamage(selectedSide, reaction, hp1, hp2, isDefending1, isDefending2)
    addMessage({
      side: selectedSide,
      agentName: attacker.persona_name,
      agentEmoji: attacker.avatar_emoji,
      text: attackStatement,
      reaction,
      damage: dmg.damage,
      isCritical: dmg.isCritical,
    })

    if (dmg.isCritical) {
      setCriticalVisible(true)
      setTimeout(() => setCriticalVisible(false), 1200)
    }

    setHp1(dmg.newHp1)
    setHp2(dmg.newHp2)
    setIsDefending1(dmg.newIsDefending1)
    setIsDefending2(dmg.newIsDefending2)
    if (dmg.damage > mvpDamage) {
      setMvpDamage(dmg.damage)
      setMvpStatement(attackStatement)
    }

    await supabase.from('rounds').insert({
      battle_id: battleId,
      round_number: currentTurn,
      agent_id: attacker.agent_id,
      statement_text: attackStatement,
      response_to_agent_id: defender.agent_id,
      user_reaction: reaction,
      damage: dmg.damage,
      is_critical: dmg.isCritical,
      counter_statement: counterStatement,
      counter_damage: 0,
      hp1_after: dmg.newHp1,
      hp2_after: dmg.newHp2,
    })

    if (dmg.newHp1 <= 0 || dmg.newHp2 <= 0) {
      await sleep(500)
      addMessage({
        side: selectedSide === 1 ? 2 : 1,
        agentName: defender.persona_name,
        agentEmoji: defender.avatar_emoji,
        text: counterStatement,
      })
      endBattle(dmg.newHp1 <= 0 ? 2 : 1, dmg.newHp1, dmg.newHp2)
      return
    }

    await sleep(700)
    addMessage({
      side: selectedSide === 1 ? 2 : 1,
      agentName: defender.persona_name,
      agentEmoji: defender.avatar_emoji,
      text: counterStatement,
    })

    if (selectedSide === 1) {
      setLastStatement1(attackStatement)
      setLastStatement2(counterStatement)
    } else {
      setLastStatement2(attackStatement)
      setLastStatement1(counterStatement)
    }

    setCurrentTurn((prev) => prev + 1)
    setPhase('waiting')
  }

  async function endBattle(winner: 1 | 2, finalHp1: number, finalHp2: number) {
    setWinnerSide(winner)
    setPhase('ended')
    const initialViewCount = 8 + Math.floor(Math.random() * 4)
    await supabase
      .from('battles')
      .update({
        status: 'completed',
        hp1: finalHp1,
        hp2: finalHp2,
        end_time: new Date().toISOString(),
        mvp_statement: mvpStatement,
        mvp_damage: mvpDamage,
        view_count: initialViewCount,
      })
      .eq('battle_id', battleId)
  }

  const isLowHp1 = hp1 <= 30
  const isLowHp2 = hp2 <= 30

  if (!battleId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white">배틀 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (!fighter1 || !fighter2 || phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">⚔️ 배틀 준비 중...</p>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-1000
      ${isLowHp1 && isLowHp2 ? 'bg-red-950' : isLowHp1 ? 'bg-gradient-to-r from-red-950 to-gray-900' : isLowHp2 ? 'bg-gradient-to-r from-gray-900 to-red-950' : 'bg-gray-900'}`}
    >
      <AnimatePresence>
        {criticalVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-6xl md:text-7xl font-black text-yellow-400 drop-shadow-2xl">
              🔥 CRITICAL!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 무반응 1분 후: 3초 카운트다운 후 자동 진행 */}
      <AnimatePresence>
        {autoAdvanceCountdown !== null && phase === 'waiting' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-20 mx-auto max-w-md rounded-xl bg-amber-500/95 px-4 py-3 text-center text-sm font-bold text-black shadow-lg"
          >
            ⏱️ {autoAdvanceCountdown}초 후 자동 진행됩니다
            <span className="block text-xs font-normal text-black/80 mt-0.5">(반응을 선택하면 취소됩니다)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 탭/앱 복귀 시 안내 */}
      <AnimatePresence>
        {showReturnReminder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 left-4 right-4 z-20 mx-auto max-w-md rounded-xl bg-blue-600/95 px-4 py-2.5 text-center text-sm font-bold text-white shadow-lg"
          >
            👋 반응을 선택해 주세요!
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={battleTopRef} className="p-3 md:p-4 bg-black/40 backdrop-blur sticky top-0 z-10 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-2">
          <button
            onClick={() => router.push(phase === 'ended' ? '/board' : '/')}
            className="text-white/60 hover:text-white text-sm shrink-0"
          >
            ← {phase === 'ended' ? '목록' : '나가기'}
          </button>
          <p className="text-white font-black text-center flex-1 mx-2 min-w-0 text-base md:text-lg leading-tight">
            ⚔️ {topic}
          </p>
          {phase !== 'ended' && (
            <span className="text-white/60 text-xs shrink-0">턴 {currentTurn}</span>
          )}
        </div>
      </div>

      {/* 종료 시: 게시판에서 들어온 재생(또는 녹화 모드) → 다음 대사 + 접힌 결과보기 / 라이브로 방금 끝남 → 전체 대화 + 결과 바로 표시 */}
      {phase === 'ended' && (isFromBoard || isRecordMode) ? (
        /* 게시판 재생 화면: 채팅이 화면 대부분 차지, 결과보기는 항상 맨 아래 고정 */
        <>
          <div className="flex-1 flex flex-col min-h-0 w-full max-w-2xl mx-auto">
            {/* 채팅 영역: 남는 공간 전부 사용, 스크롤만 여기서 발생 */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
              <div className="space-y-0">
                <AnimatePresence>
                  {messages.slice(0, replayStep).map((msg) => (
                    <div key={msg.id}>
                      {msg.reaction != null && (
                        <div className="text-center py-2">
                          <span className="inline-block px-3 py-1.5 rounded-lg bg-white/10 text-gray-200 text-xs md:text-sm">
                            👤 관객이 <strong className="text-white">{msg.agentName}</strong>의{' '}
                            <span className="text-yellow-300">
                              {msg.reaction === '공격' && '⚔️ 공격'}
                              {msg.reaction === '방어' && '🛡️ 방어'}
                              {msg.reaction === '병맛' && '🤪 병맛'}
                              {msg.reaction === '감정' && '😡 감정'}
                            </span>{' '}
                            선택
                            {msg.reaction === '방어' ? (
                              <span className="text-blue-300"> → 다음 턴 데미지 50% 감소</span>
                            ) : (msg.damage === 0 && msg.reaction === '병맛') ? (
                              <span className="text-gray-400"> → 🤪 완전 빗나감! (0 데미지)</span>
                            ) : (
                              <>
                                {' '}
                                →{' '}
                                {msg.isCritical ? (
                                  <span className="text-yellow-400">🔥 CRITICAL! -{msg.damage ?? 0} 데미지</span>
                                ) : (
                                  <span className="text-red-300">💥 -{msg.damage ?? 0} 데미지</span>
                                )}
                              </>
                            )}
                          </span>
                        </div>
                      )}
                      <ChatBubble
                        side={msg.side}
                        agentName={msg.agentName}
                        agentEmoji={msg.agentEmoji}
                        text={msg.text}
                        reaction={msg.reaction}
                        damage={msg.damage}
                        isCritical={msg.isCritical}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>

              {replayStep < messages.length && !isRecordMode ? (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setReplayStep((s) => s + 1)}
                    className="flex-1 py-3 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    다음 대사
                    <span className="text-lg">▶</span>
                  </button>
                  <button
                    onClick={() => setReplayStep(messages.length)}
                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    전체보기
                    <span className="text-lg">⏭</span>
                  </button>
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* 결과보기: 화면 맨 아래 고정(채팅과 겹치지 않음). 녹화 모드에서는 버튼 숨김 */}
          <div className="shrink-0 w-full max-w-2xl mx-auto px-4 pb-4 pt-2">
            {!isRecordMode && (
              <motion.button
                initial={false}
                animate={{ opacity: 1 }}
                onClick={() => setResultExpanded((e) => !e)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-t-2xl font-bold transition-all flex items-center justify-center gap-2 border border-gray-600 border-b-0"
              >
                결과보기
                <motion.span
                  animate={{ rotate: resultExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-lg"
                >
                  ▼
                </motion.span>
              </motion.button>
            )}

            <AnimatePresence>
              {resultExpanded && winnerSide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-800 border border-gray-600 border-t-0 rounded-b-2xl p-4 pb-6">
                    <BattleResult
                      winnerName={winnerSide === 1 ? fighter1.persona_name : fighter2.persona_name}
                      winnerEmoji={winnerSide === 1 ? fighter1.avatar_emoji : fighter2.avatar_emoji}
                      loserName={winnerSide === 1 ? fighter2.persona_name : fighter1.persona_name}
                      loserEmoji={winnerSide === 1 ? fighter2.avatar_emoji : fighter1.avatar_emoji}
                      winnerHp={winnerSide === 1 ? hp1 : hp2}
                      mvpStatement={mvpStatement}
                      mvpDamage={mvpDamage}
                      battleId={battleId}
                      topicText={topic}
                      onReplay={() => router.refresh()}
                      onRevenge={() => router.push('/')}
                      onViewBoard={() => router.push('/board')}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 하단: 제작동기 버튼 + 저작권 (배틀게시판과 동일). 녹화 모드에서는 숨김 */}
            {!isRecordMode && (
              <footer className="mt-10 pt-6 pb-8 text-center">
                <button
                  type="button"
                  onClick={() => setIsMotivationOpen(true)}
                  className="mb-4 px-5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all border border-white/20"
                >
                  왜 썰로세움을 만들었나요?
                </button>
                <p className="text-white/60 text-sm">© 2026 썰로세움 | 한국 인터넷 문화 AI 실험 프로젝트</p>
              </footer>
            )}
          </div>
        </>
      ) : phase === 'ended' && !isFromBoard ? (
        /* 라이브로 방금 끝난 배틀: 전체 대화 + 결과 바로 크게 표시 */
        <>
          <div
            className="max-w-2xl mx-auto w-full flex-1 px-4 py-4 overflow-y-auto"
            style={{ minHeight: '180px', maxHeight: '38vh' }}
          >
            <div className="space-y-0">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    side={msg.side}
                    agentName={msg.agentName}
                    agentEmoji={msg.agentEmoji}
                    text={msg.text}
                    reaction={msg.reaction}
                    damage={msg.damage}
                    isCritical={msg.isCritical}
                  />
                ))}
              </AnimatePresence>
            </div>
            <div ref={chatEndRef} />
          </div>
          {winnerSide && (
            <div className="max-w-2xl mx-auto w-full px-4 pb-6">
              <BattleResult
                winnerName={winnerSide === 1 ? fighter1.persona_name : fighter2.persona_name}
                winnerEmoji={winnerSide === 1 ? fighter1.avatar_emoji : fighter2.avatar_emoji}
                loserName={winnerSide === 1 ? fighter2.persona_name : fighter1.persona_name}
                loserEmoji={winnerSide === 1 ? fighter2.avatar_emoji : fighter1.avatar_emoji}
                winnerHp={winnerSide === 1 ? hp1 : hp2}
                mvpStatement={mvpStatement}
                mvpDamage={mvpDamage}
                battleId={battleId}
                topicText={topic}
                onReplay={() => router.refresh()}
                onRevenge={() => router.push('/')}
                onViewBoard={() => router.push('/board')}
              />
            </div>
          )}
        </>
      ) : (
        <>
          {/* 라이브 배틀: 채팅창 */}
          <div
            className="max-w-2xl mx-auto w-full flex-1 px-4 py-4 overflow-y-auto"
            style={{ minHeight: '180px', maxHeight: '38vh' }}
          >
            <div className="space-y-0">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    side={msg.side}
                    agentName={msg.agentName}
                    agentEmoji={msg.agentEmoji}
                    text={msg.text}
                    reaction={msg.reaction}
                    damage={msg.damage}
                    isCritical={msg.isCritical}
                  />
                ))}
              </AnimatePresence>
            </div>
            {phase === 'generating' && (
              <div className="flex items-center gap-2 text-gray-400 text-sm p-2 mb-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
                <span>대사 생성 중...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 첫 두 대사 아래: 안내 문구 먼저, 그 다음 두 AI 블록 */}
          <div className="max-w-2xl mx-auto w-full px-3 md:px-4 pb-6">
            {phase === 'waiting' && messages.length >= 2 && (
              <p className="text-white font-bold text-center py-3 text-sm md:text-base animate-pulse">
                둘 중 원하는 관객 반응을 선택하세요!
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {/* 1번 AI = 채팅 왼쪽(회색) */}
              <div className="order-1 rounded-xl border-l-4 border-gray-400 bg-gray-800/40 p-3 md:p-4">
                <p className="text-gray-400 text-xs mb-1 md:sr-only">← 채팅 왼쪽</p>
                <MentalBar
                  name={fighter1.persona_name}
                  emoji={fighter1.avatar_emoji}
                  currentHp={hp1}
                  isDefending={isDefending1}
                  side="left"
                  compact
                />
                <ReactionButtons
                  fighterSide={1}
                  fighterName={fighter1.persona_name}
                  fighterEmoji={fighter1.avatar_emoji}
                  onReaction={handleReaction}
                  disabled={phase !== 'waiting'}
                  compact
                />
              </div>

              {/* 2번 AI = 채팅 오른쪽(파랑), 오른쪽 테두리·오른쪽 정렬 */}
              <div className="order-2 rounded-xl border-r-4 border-blue-500 bg-blue-900/30 p-3 md:p-4">
                <p className="text-blue-300/80 text-xs mb-1 text-right md:sr-only">채팅 오른쪽 →</p>
                <MentalBar
                  name={fighter2.persona_name}
                  emoji={fighter2.avatar_emoji}
                  currentHp={hp2}
                  isDefending={isDefending2}
                  side="right"
                  compact
                />
                <ReactionButtons
                  fighterSide={2}
                  fighterName={fighter2.persona_name}
                  fighterEmoji={fighter2.avatar_emoji}
                  onReaction={handleReaction}
                  disabled={phase !== 'waiting'}
                  compact
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 제작동기 모달 (배틀게시판에서 들어온 상세에서 사용) */}
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
    </div>
  )
}
