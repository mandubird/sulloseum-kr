import { NextRequest, NextResponse } from 'next/server'
import { generateInitialStatements } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { battleId, topic, agent1Id, agent2Id } = body as {
      battleId: string
      topic: string
      agent1Id: string
      agent2Id: string
    }

    if (!battleId || !topic || !agent1Id || !agent2Id) {
      return NextResponse.json({ error: 'Missing battleId, topic, or agent ids' }, { status: 400 })
    }

    const [agent1Res, agent2Res] = await Promise.all([
      supabase.from('agents').select('*').eq('agent_id', agent1Id).single(),
      supabase.from('agents').select('*').eq('agent_id', agent2Id).single(),
    ])

    if (!agent1Res.data || !agent2Res.data) {
      return NextResponse.json({ error: 'Agents not found' }, { status: 404 })
    }

    const { agent1Statement, agent2Statement } = await generateInitialStatements(
      agent1Res.data,
      agent2Res.data,
      topic
    )

    const [insert1, insert2] = await Promise.all([
      supabase
        .from('rounds')
        .insert({
          battle_id: battleId,
          round_number: 1,
          agent_id: agent1Id,
          statement_text: agent1Statement,
          response_to_agent_id: agent2Id,
        })
        .select()
        .single(),
      supabase
        .from('rounds')
        .insert({
          battle_id: battleId,
          round_number: 1,
          agent_id: agent2Id,
          statement_text: agent2Statement,
          response_to_agent_id: agent1Id,
        })
        .select()
        .single(),
    ])

    if (insert1.error) throw insert1.error
    if (insert2.error) throw insert2.error

    return NextResponse.json({
      rounds: [insert1.data, insert2.data].filter(Boolean),
    })
  } catch (error) {
    console.error('API generate-first-round Error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
