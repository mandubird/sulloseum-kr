'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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

const REACTION_OPTIONS = [
  { key: '공감' as const, label: '공감', emoji: '💬' },
  { key: '비꼼' as const, label: '비꼼', emoji: '😏' },
  { key: '병맛' as const, label: '병맛', emoji: '🤪' },
  { key: '폭발' as const, label: '폭발', emoji: '💥' },
]

const DEFAULT_REACTIONS = { 공감: 0, 비꼼: 0, 병맛: 0, 폭발: 0 }
const REACTION_VOTED_KEY = 'sulloseum_reaction_voted'

interface BattleItem {
  battle_id: string
  topic_text: string
  battlefield: string
  view_count: number
  mvp_statement: string
  mvp_damage: number
  hp1: number
  hp2: number
  created_at: string
  participants: { fighter1: string; fighter2: string }
  reactions?: Record<string, number>
}

const BATTLEFIELD_EMOJI: Record<string, string> = {
  love: '💕',
  work: '💼',
  game: '🎮',
  marriage: '💍',
  money: '💰',
}

const BATTLEFIELD_OPTIONS: { id: string; name: string; emoji: string }[] = [
  { id: '', name: '전체', emoji: '📋' },
  { id: 'love', name: '연애', emoji: '💕' },
  { id: 'work', name: '직장', emoji: '💼' },
  { id: 'game', name: '게임', emoji: '🎮' },
  { id: 'marriage', name: '결혼', emoji: '💍' },
  { id: 'money', name: '돈', emoji: '💰' },
]

const BATTLEFIELD_ORDER = ['love', 'work', 'game', 'marriage', 'money']

function BattleBoardCard({
  battle,
  agentMap,
  isExpanded,
  onToggleExpand,
  getReactions,
  onReaction,
  onCopyLink,
  hasVoted = false,
}: {
  battle: BattleItem
  agentMap: Record<string, { persona_name: string; avatar_emoji: string }>
  isExpanded: boolean
  onToggleExpand: () => void
  getReactions: (b: BattleItem) => Record<string, number>
  onReaction: (battleId: string, reaction: string, e: React.MouseEvent) => void
  onCopyLink: (battleId: string, e: React.MouseEvent) => void
  hasVoted?: boolean
}) {
  const f1 = battle.participants && agentMap[battle.participants.fighter1]
  const f2 = battle.participants && agentMap[battle.participants.fighter2]
  const winner = (battle.hp1 || 0) > 0 ? f1 : f2
  const reactions = getReactions(battle)
  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 overflow-hidden">
      <Link href={`/battle/${battle.battle_id}?from=board`} className="block">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-lg flex-shrink-0">
              {BATTLEFIELD_EMOJI[battle.battlefield] || '⚔️'}
            </span>
            <p className="text-white font-bold text-sm truncate">
              {battle.topic_text}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-gray-500 text-xs">
              👁 {battle.view_count || 0}
            </span>
            <button
              onClick={(e) => onCopyLink(battle.battle_id, e)}
              className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
            >
              🔗
            </button>
          </div>
        </div>
        {f1 && f2 && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{f1.avatar_emoji}</span>
            <span className="text-gray-400 text-xs">{f1.persona_name}</span>
            <span className="text-gray-600 text-xs">vs</span>
            <span className="text-base">{f2.avatar_emoji}</span>
            <span className="text-gray-400 text-xs">{f2.persona_name}</span>
            {winner && (
              <span className="ml-auto text-yellow-400 text-xs">
                🏆 {winner.persona_name}
              </span>
            )}
          </div>
        )}
        {battle.mvp_statement && (
          <p className="text-yellow-400/70 text-xs truncate">
            💬 &quot;{battle.mvp_statement}&quot;
          </p>
        )}
        <p className="text-gray-600 text-xs mt-2">
          {new Date(battle.created_at).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </Link>
      <div className="mt-3 pt-3 border-t border-gray-700">
        <button
          type="button"
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
        >
          결과보기
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg leading-none"
          >
            ▼
          </motion.span>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                {winner && battle.mvp_statement && (
                  <div className="bg-gray-900/60 rounded-xl p-3 text-xs">
                    <p className="text-yellow-400 font-medium mb-1">
                      🏆 {winner.persona_name} 승리 · 💬 &quot;{battle.mvp_statement}&quot;
                    </p>
                  </div>
                )}
                <p className="text-gray-500 text-xs">
                  {hasVoted ? '이미 리액션을 남기셨습니다' : '이 배틀에 리액션을 남겨보세요'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {REACTION_OPTIONS.map(({ key, label, emoji }) => (
                    <button
                      key={key}
                      type="button"
                      disabled={hasVoted}
                      onClick={(e) => onReaction(battle.battle_id, key, e)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        hasVoted
                          ? 'bg-gray-700/60 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600 text-white/90'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                      <span className="text-white/60 text-xs min-w-[1rem]">{(reactions as Record<string, number>)[key] ?? 0}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function BoardPage() {
  const router = useRouter()
  const [battles, setBattles] = useState<BattleItem[]>([])
  const [agentMap, setAgentMap] = useState<
    Record<string, { persona_name: string; avatar_emoji: string }>
  >({})
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [selectedBattlefield, setSelectedBattlefield] = useState<string>('')
  const [isMotivationOpen, setIsMotivationOpen] = useState(false)
  const [expandedBattleId, setExpandedBattleId] = useState<string | null>(null)
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({})
  const [votedBattleIds, setVotedBattleIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadBattles()
  }, [sortBy, selectedBattlefield])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REACTION_VOTED_KEY)
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      if (Array.isArray(arr) && arr.length > 0) {
        setVotedBattleIds(new Set(arr))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(REACTION_VOTED_KEY, JSON.stringify([...votedBattleIds]))
    } catch {
      // ignore
    }
  }, [votedBattleIds])

  async function loadBattles() {
    setLoading(true)
    let query = supabase
      .from('battles')
      .select('*')
      .eq('status', 'completed')
      .order(sortBy === 'popular' ? 'view_count' : 'created_at', { ascending: false })
    if (selectedBattlefield) {
      query = query.eq('battlefield', selectedBattlefield)
    }
    const { data } = await query.limit(selectedBattlefield ? 30 : 50)

    if (data) {
      setBattles(data)
      const agentIds = new Set(
        data.flatMap((b: BattleItem) =>
          b.participants ? [b.participants.fighter1, b.participants.fighter2] : []
        )
      )
      const { data: agents } = await supabase
        .from('agents')
        .select('agent_id, persona_name, avatar_emoji')
        .in('agent_id', Array.from(agentIds))
      if (agents) {
        const map: Record<string, { persona_name: string; avatar_emoji: string }> = {}
        agents.forEach((a) => {
          map[a.agent_id] = { persona_name: a.persona_name, avatar_emoji: a.avatar_emoji }
        })
        setAgentMap(map)
      }
    }
    setLoading(false)
  }

  const copyLink = (battleId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/battle/${battleId}`)
    alert('링크가 복사되었습니다!')
  }

  const getReactions = (battle: BattleItem) => {
    return reactionCounts[battle.battle_id] ?? battle.reactions ?? DEFAULT_REACTIONS
  }

  const handleReaction = async (battleId: string, reaction: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (votedBattleIds.has(battleId)) return
    try {
      const res = await fetch('/api/battle-reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battleId, reaction }),
      })
      const data = await res.json()
      if (res.ok && data.reactions) {
        setReactionCounts((prev) => ({ ...prev, [battleId]: data.reactions }))
        setVotedBattleIds((prev) => new Set(prev).add(battleId))
      }
    } catch {
      // no-op
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-white"
            >
              ←
            </button>
            <h1 className="text-2xl font-black text-white">⚔️ 배틀 게시판</h1>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all"
          >
            + 새 배틀
          </Link>
        </div>

        {/* 전장 필터 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {BATTLEFIELD_OPTIONS.map((bf) => (
            <button
              key={bf.id || 'all'}
              onClick={() => setSelectedBattlefield(bf.id)}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-all shrink-0
                ${selectedBattlefield === bf.id ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <span className="mr-1">{bf.emoji}</span>
              {bf.name}
            </button>
          ))}
        </div>
        {/* 정렬 */}
        <div className="flex gap-2 mb-4">
          {(['latest', 'popular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${sortBy === s ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              {s === 'latest' ? '🕐 최신순' : '🔥 인기순'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-16">
            <div className="text-4xl mb-3 animate-pulse">⚔️</div>
            <p>배틀 불러오는 중...</p>
          </div>
        ) : battles.length === 0 ? (
          <div className="text-gray-500 text-center py-16">
            <p>{selectedBattlefield ? '이 전장의 배틀이 없어요!' : '아직 배틀이 없어요!'}</p>
            <Link href="/" className="text-blue-400 mt-2 block">
              첫 배틀 만들기 →
            </Link>
          </div>
        ) : selectedBattlefield ? (
          <div className="space-y-3">
            <p className="text-white/60 text-sm mb-2">
              {BATTLEFIELD_EMOJI[selectedBattlefield]}{' '}
              {BATTLEFIELD_OPTIONS.find((b) => b.id === selectedBattlefield)?.name} 배틀
              <span className="ml-2 text-white/40">({battles.length}개)</span>
            </p>
            {battles.map((battle) => (
              <BattleBoardCard
                key={battle.battle_id}
                battle={battle}
                agentMap={agentMap}
                isExpanded={expandedBattleId === battle.battle_id}
                onToggleExpand={() => setExpandedBattleId(expandedBattleId === battle.battle_id ? null : battle.battle_id)}
                getReactions={getReactions}
                onReaction={handleReaction}
                onCopyLink={copyLink}
                hasVoted={votedBattleIds.has(battle.battle_id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {BATTLEFIELD_ORDER.map((bfId) => {
              const list = battles.filter((b) => b.battlefield === bfId)
              if (list.length === 0) return null
              const bfName = BATTLEFIELD_OPTIONS.find((b) => b.id === bfId)?.name ?? bfId
              const emoji = BATTLEFIELD_EMOJI[bfId] || '⚔️'
              return (
                <section key={bfId}>
                  <h2 className="flex items-center gap-2 text-white font-bold text-base mb-3 sticky top-0 bg-gray-900/95 backdrop-blur py-2 z-10">
                    <span>{emoji}</span>
                    {bfName} 배틀
                    <span className="text-white/50 text-sm font-normal">({list.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {list.map((battle) => (
                      <BattleBoardCard
                        key={battle.battle_id}
                        battle={battle}
                        agentMap={agentMap}
                        isExpanded={expandedBattleId === battle.battle_id}
                        onToggleExpand={() => setExpandedBattleId(expandedBattleId === battle.battle_id ? null : battle.battle_id)}
                        getReactions={getReactions}
                        onReaction={handleReaction}
                        onCopyLink={copyLink}
                        hasVoted={votedBattleIds.has(battle.battle_id)}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}

        {/* 하단: 제작동기 버튼 + 저작권 */}
        <footer className="mt-12 pt-8 pb-6 text-center">
          <button
            type="button"
            onClick={() => setIsMotivationOpen(true)}
            className="mb-4 px-5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all border border-white/20"
          >
            왜 썰로세움을 만들었나요?
          </button>
          <p className="text-white/60 text-sm">© 2026 썰로세움 | 한국 인터넷 문화 AI 실험 프로젝트</p>
        </footer>
      </div>

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
    </div>
  )
}
