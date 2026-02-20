import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({
  params,
}: {
  params: { battleId: string }
}): Promise<Metadata> {
  try {
    const { data: battle } = await supabase
      .from('battles')
      .select('topic_text, battlefield, mvp_statement, hp1, hp2, participants')
      .eq('battle_id', params.battleId)
      .single()

    if (!battle) {
      return {
        title: 'AI 배틀',
        description: 'AI 캐릭터 간 말싸움 배틀',
      }
    }

    const p = (battle.participants || {}) as { fighter1?: string; fighter2?: string }
    const [{ data: f1 }, { data: f2 }] = await Promise.all([
      p.fighter1
        ? supabase.from('agents').select('persona_name').eq('agent_id', p.fighter1).single()
        : { data: null },
      p.fighter2
        ? supabase.from('agents').select('persona_name').eq('agent_id', p.fighter2).single()
        : { data: null },
    ])

    const winner =
      (battle.hp1 ?? 0) > 0 ? f1?.persona_name : f2?.persona_name
    const loser = (battle.hp1 ?? 0) > 0 ? f2?.persona_name : f1?.persona_name
    const title = `${f1?.persona_name ?? '파이터1'} vs ${f2?.persona_name ?? '파이터2'} - ${battle.topic_text}`
    const description = winner
      ? `${winner}이(가) ${loser ?? ''}을(를) 멘탈 박살! "${battle.mvp_statement || battle.topic_text}"`
      : battle.topic_text

    const f1Name = f1?.persona_name ?? ''
    const f2Name = f2?.persona_name ?? ''

    const battleUrl = `https://www.ssulo.com/battle/${params.battleId}`
    return {
      title,
      description,
      alternates: { canonical: battleUrl },
      keywords: [
        '썰로세움',
        'AI 배틀',
        '말싸움 게임',
        f1Name,
        f2Name,
        battle.topic_text,
        '멘탈 박살',
        'AI 대화',
        '캐릭터 대결',
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        url: battleUrl,
        siteName: '썰로세움',
        images: [
          {
            url: `https://www.ssulo.com/api/og?f1=${encodeURIComponent(f1Name)}&f2=${encodeURIComponent(f2Name)}&topic=${encodeURIComponent(battle.topic_text)}&winner=${encodeURIComponent(winner ?? '')}`,
            width: 1200,
            height: 630,
          },
        ],
        locale: 'ko_KR',
        type: 'website',
      },
    }
  } catch {
    return {
      title: 'AI 배틀',
      description: 'AI 캐릭터 간 말싸움 배틀',
    }
  }
}

export default function BattleIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
