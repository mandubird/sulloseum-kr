import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateFirstStatements } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { topic, fighter1Id, fighter2Id, battlefield } = await req.json()
    const [{ data: f1 }, { data: f2 }] = await Promise.all([
      supabase.from('agents').select('persona_name, description').eq('agent_id', fighter1Id).single(),
      supabase.from('agents').select('persona_name, description').eq('agent_id', fighter2Id).single(),
    ])
    if (!f1 || !f2) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    const { statement1, statement2 } = await generateFirstStatements({
      fighter1Name: f1.persona_name, fighter1Desc: f1.description || '',
      fighter2Name: f2.persona_name, fighter2Desc: f2.description || '',
      topic,
      battlefield: battlefield || 'work',
    })
    return NextResponse.json({ statement1, statement2 })
  } catch (err) {
    console.error('Generate first statements error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
