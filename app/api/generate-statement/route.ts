import { NextRequest, NextResponse } from 'next/server'
import { generateAIStatement } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, opponentAgentId, topic, roundNumber, conversationHistory, userReaction } = body

    // Fetch agents
    const [agentData, opponentData] = await Promise.all([
      supabase.from('agents').select('*').eq('agent_id', agentId).single(),
      supabase.from('agents').select('*').eq('agent_id', opponentAgentId).single(),
    ])

    if (!agentData.data || !opponentData.data) {
      return NextResponse.json({ error: 'Agents not found' }, { status: 404 })
    }

    // Generate AI statement
    const statement = await generateAIStatement({
      agent: agentData.data,
      opponentAgent: opponentData.data,
      topic,
      roundNumber,
      conversationHistory,
      userReaction,
    })

    return NextResponse.json({ statement })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to generate statement' }, { status: 500 })
  }
}
