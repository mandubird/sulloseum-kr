'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
}

const BATTLEFIELD_EMOJI: Record<string, string> = {
  love: '💕',
  work: '💼',
  game: '🎮',
  marriage: '💍',
  money: '💰',
}

export default function BoardPage() {
  const router = useRouter()
  const [battles, setBattles] = useState<BattleItem[]>([])
  const [agentMap, setAgentMap] = useState<
    Record<string, { persona_name: string; avatar_emoji: string }>
  >({})
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')

  useEffect(() => {
    loadBattles()
  }, [sortBy])

  async function loadBattles() {
    setLoading(true)
    const { data } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'completed')
      .order(sortBy === 'popular' ? 'view_count' : 'created_at', { ascending: false })
      .limit(30)

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
    navigator.clipboard.writeText(`${window.location.origin}/battle/${battleId}`)
    alert('링크가 복사되었습니다!')
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
            <p>아직 배틀이 없어요!</p>
            <Link href="/" className="text-blue-400 mt-2 block">
              첫 배틀 만들기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {battles.map((battle) => {
              const f1 = battle.participants && agentMap[battle.participants.fighter1]
              const f2 = battle.participants && agentMap[battle.participants.fighter2]
              const winner = (battle.hp1 || 0) > 0 ? f1 : f2
              return (
                <Link key={battle.battle_id} href={`/battle/${battle.battle_id}?from=board`}>
                  <div className="bg-gray-800 hover:bg-gray-750 rounded-2xl p-4 border border-gray-700 hover:border-gray-500 transition-all cursor-pointer">
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
                          onClick={(e) => copyLink(battle.battle_id, e)}
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
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
