import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateBattleTurn } from '@/lib/openai'
import type { ReactionType } from '@/lib/damage'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      topic,
      attackerId,
      defenderId,
      reaction,
      lastDefenderStatement,
      turnNumber,
      isFirstTurn,
    } = body as {
      topic: string
      attackerId: string
      defenderId: string
      reaction: ReactionType
      lastDefenderStatement: string
      turnNumber: number
      isFirstTurn: boolean
    }
    const [{ data: attacker }, { data: defender }] = await Promise.all([
      supabase.from('agents').select('persona_name, description').eq('agent_id', attackerId).single(),
      supabase.from('agents').select('persona_name, description').eq('agent_id', defenderId).single(),
    ])
    if (!attacker || !defender) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    const result = await generateBattleTurn({
      attackerName: attacker.persona_name,
      attackerDesc: attacker.description || '',
      defenderName: defender.persona_name,
      defenderDesc: defender.description || '',
      topic,
      reaction,
      lastDefenderStatement: lastDefenderStatement || '',
      turnNumber,
      isFirstTurn,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('Generate battle turn error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
