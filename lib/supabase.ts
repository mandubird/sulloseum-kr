import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database Types
export type User = {
  user_id: string
  username: string
  avatar_url?: string
  role: string
  join_date: string
  created_at: string
}

export type Battle = {
  battle_id: string
  battlefield: string
  topic_text: string
  start_time: string
  end_time?: string
  participants?: any
  winner_agent_id?: string
  status: 'active' | 'completed'
  created_by?: string
  created_at: string
}

export type Agent = {
  agent_id: string
  persona_name: string
  style: '논리' | '감정' | '병맛'
  description: string
  avatar_emoji: string
  personality_traits?: any
  created_at: string
}

export type Round = {
  round_id: string
  battle_id: string
  round_number: number
  agent_id: string
  statement_text: string
  response_to_agent_id?: string
  user_reaction?: '공격' | '방어' | '병맛' | '감정'
  created_at: string
}
