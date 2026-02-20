// app/battle/[battleId]/page.tsx
// 파일 맨 위에 추가

import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: { battleId: string } }): Promise<Metadata> {
  const { data: battle } = await supabase
    .from('battles')
    .select('topic_text, battlefield, mvp_statement, hp1, hp2, participants')
    .eq('battle_id', params.battleId)
    .single()

  if (!battle) {
    return {
      title: '설로세움 - AI 배틀',
      description: 'AI 캐릭터 간 말싸움 배틀 게임',
    }
  }

  const p = battle.participants as { fighter1: string; fighter2: string }
  const [{ data: f1 }, { data: f2 }] = await Promise.all([
    supabase.from('agents').select('persona_name, avatar_emoji').eq('agent_id', p.fighter1).single(),
    supabase.from('agents').select('persona_name, avatar_emoji').eq('agent_id', p.fighter2).single(),
  ])

  const winner = battle.hp1 > 0 ? f1?.persona_name : f2?.persona_name
  const loser = battle.hp1 > 0 ? f2?.persona_name : f1?.persona_name

  const title = `${f1?.persona_name} vs ${f2?.persona_name} - ${battle.topic_text} | 설로세움`
  const description = `"${battle.mvp_statement || battle.topic_text}" 🔥 ${winner}이(가) ${loser}을(를) 멘탈 박살! AI 말싸움 배틀 결과 보기`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.ssulo.com/battle/${params.battleId}`,
      siteName: '설로세움',
      images: [
        {
          url: '/og-image.png', // 이미지는 아래에서 만들어요
          width: 1200,
          height: 630,
          alt: `${f1?.persona_name} vs ${f2?.persona_name} 배틀`,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    keywords: [
      '설로세움', 'AI 배틀', '말싸움 게임', f1?.persona_name || '', f2?.persona_name || '',
      battle.topic_text, '멘탈 박살', 'AI 대화', '캐릭터 대결',
    ].filter(Boolean),
  }
}

// 기존 컴포넌트 코드는 그대로...
