import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const REACTIONS = ['공감', '비꼼', '병맛', '폭발'] as const
type ReactionType = (typeof REACTIONS)[number]
const DEFAULT_REACTIONS = { 공감: 0, 비꼼: 0, 병맛: 0, 폭발: 0 }

function isReaction(s: string): s is ReactionType {
  return REACTIONS.includes(s as ReactionType)
}

function getClientFingerprint(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown'
  return createHash('sha256').update(ip + '|battle-reaction').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { battleId, reaction } = (await req.json()) as { battleId?: string; reaction?: string }
    if (!battleId || !reaction || !isReaction(reaction)) {
      return NextResponse.json(
        { error: 'battleId and reaction(공감|비꼼|병맛|폭발) required' },
        { status: 400 }
      )
    }

    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('reactions')
      .eq('battle_id', battleId)
      .single()

    if (fetchError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    const current = (battle.reactions as Record<string, number>) || { ...DEFAULT_REACTIONS }

    const voterHash = getClientFingerprint(req)
    let allowIncrement = false

    const { data: existingVote, error: selectVoteError } = await supabase
      .from('battle_reaction_votes')
      .select('battle_id')
      .eq('battle_id', battleId)
      .eq('voter_hash', voterHash)
      .maybeSingle()

    if (selectVoteError) {
      allowIncrement = true
    } else if (existingVote) {
      return NextResponse.json({ reactions: current, alreadyVoted: true })
    } else {
      const { error: insertVoteError } = await supabase.from('battle_reaction_votes').insert({
        battle_id: battleId,
        voter_hash: voterHash,
        reaction,
      })
      if (!insertVoteError) {
        allowIncrement = true
      } else if (insertVoteError.code === '23505') {
        return NextResponse.json({ reactions: current, alreadyVoted: true })
      } else {
        allowIncrement = true
      }
    }

    if (!allowIncrement) return NextResponse.json({ reactions: current, alreadyVoted: true })

    const updated = { ...current, [reaction]: (current[reaction] ?? 0) + 1 }

    const { error: updateError } = await supabase
      .from('battles')
      .update({ reactions: updated })
      .eq('battle_id', battleId)

    if (updateError) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ reactions: updated })
  } catch (err) {
    console.error('battle-reaction error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
