import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateFirstStatements } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { fighter1Id, fighter2Id, topic, battlefield } = await req.json()

    // 1. 페르소나 조회
    const [{ data: f1 }, { data: f2 }] = await Promise.all([
      supabase.from('agents').select('*').eq('agent_id', fighter1Id).single(),
      supabase.from('agents').select('*').eq('agent_id', fighter2Id).single(),
    ])
    if (!f1 || !f2) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    // 2. 혼합형 캐싱 체크
    const combinationKey = `${f1.persona_name}_${f2.persona_name}_${battlefield}`
    const { data: existing } = await supabase
      .from('battles')
      .select('battle_id, view_count')
      .eq('combination_key', combinationKey)
      .eq('status', 'completed')
      .order('view_count', { ascending: false })
      .limit(10)

    if (existing && existing.length >= 3) {
      const randomBattle = existing[Math.floor(Math.random() * Math.min(existing.length, 5))]
      await supabase.from('battles')
        .update({ view_count: (randomBattle.view_count || 0) + 1 })
        .eq('battle_id', randomBattle.battle_id)
      return NextResponse.json({ battleId: randomBattle.battle_id, isReplay: true })
    }

    // 3. 신규 AI 배틀 생성
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        battlefield,
        topic_text: topic,
        participants: { fighter1: fighter1Id, fighter2: fighter2Id },
        combination_key: combinationKey,
        status: 'active',
        hp1: 50,
        hp2: 50,
        max_turns: 2,
      })
      .select()
      .single()

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle creation failed' }, { status: 500 })
    }

    // 4. 첫 대사만 생성 (짧게, 1회 호출) — 이후 대사는 관객이 반응 선택할 때마다 진행
    const { statement1, statement2 } = await generateFirstStatements({
      fighter1Name: f1.persona_name, fighter1Desc: f1.description || '',
      fighter2Name: f2.persona_name, fighter2Desc: f2.description || '',
      topic,
    })

    // 5. 첫 두 대사만 rounds에 저장, 배틀은 active 유지
    await supabase.from('rounds').insert([
      {
        battle_id: battle.battle_id,
        round_number: 1,
        agent_id: fighter1Id,
        statement_text: statement1,
        response_to_agent_id: fighter2Id,
      },
      {
        battle_id: battle.battle_id,
        round_number: 1,
        agent_id: fighter2Id,
        statement_text: statement2,
        response_to_agent_id: fighter1Id,
      },
    ])

    return NextResponse.json({ battleId: battle.battle_id, isReplay: false })
  } catch (err) {
    console.error('Create battle error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
