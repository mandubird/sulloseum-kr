import { createClient } from '@supabase/supabase-js'
import BoardClient, { type BattleItem, type BoardAgentMap } from '@/components/BoardClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/** 게시판 초기 HTML에 배틀 목록·내부 링크를 넣어 크롤러/JS 약한 엔진이 발견하기 쉽게 함 */
export default async function BoardPage() {
  let initialBattles: BattleItem[] = []
  let initialAgentMap: BoardAgentMap = {}

  try {
    const { data: battles } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    if (battles && battles.length > 0) {
      initialBattles = battles as BattleItem[]
      const agentIds = new Set(
        battles.flatMap((b: BattleItem) =>
          b.participants ? [b.participants.fighter1, b.participants.fighter2] : []
        )
      )
      const { data: agents } = await supabase
        .from('agents')
        .select('agent_id, persona_name, avatar_emoji')
        .in('agent_id', Array.from(agentIds))
      if (agents) {
        const map: BoardAgentMap = {}
        agents.forEach((a) => {
          map[a.agent_id] = { persona_name: a.persona_name, avatar_emoji: a.avatar_emoji }
        })
        initialAgentMap = map
      }
    }
  } catch {
    // SSR 실패 시 빈 목록으로 클라이언트가 로드 시 채움
  }

  return (
    <BoardClient
      initialBattles={initialBattles}
      initialAgentMap={initialAgentMap}
    />
  )
}
