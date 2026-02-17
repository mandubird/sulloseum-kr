import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const VIEW_INCREMENT = 3

export async function POST(req: NextRequest) {
  try {
    const { battleId } = (await req.json()) as { battleId?: string }
    if (!battleId) {
      return NextResponse.json({ error: 'battleId required' }, { status: 400 })
    }

    const { data: battle, error: fetchError } = await supabase
      .from('battles')
      .select('view_count')
      .eq('battle_id', battleId)
      .single()

    if (fetchError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
    }

    const newCount = (battle.view_count ?? 0) + VIEW_INCREMENT

    const { error: updateError } = await supabase
      .from('battles')
      .update({ view_count: newCount })
      .eq('battle_id', battleId)

    if (updateError) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ view_count: newCount })
  } catch (err) {
    console.error('battle-view error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
