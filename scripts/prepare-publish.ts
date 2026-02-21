/**
 * 플랫폼별 캡션/해시태그/제목 생성 및 outputs/metadata에 저장.
 * 사용법: npx tsx scripts/prepare-publish.ts <battleId> [baseUrl]
 * 예: npx tsx scripts/prepare-publish.ts abc123 https://www.ssulo.com
 */

import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const BATTLE_ID = process.argv[2]
const BASE_URL = (process.argv[3] || 'https://www.ssulo.com').replace(/\/$/, '')
const OUT_METADATA = path.join(process.cwd(), 'outputs', 'metadata')

const HASHTAG_BASE = ['썰로세움', 'AI배틀', '말싸움', '떡밥배틀']

function buildHashtags(topic: string, winnerName: string): string[] {
  const topicShort = topic.slice(0, 20).replace(/\s+/g, '')
  const tags = [...HASHTAG_BASE]
  if (topicShort) tags.push(`#${topicShort}`)
  if (winnerName) tags.push(`#${winnerName}`)
  return tags
}

async function main() {
  if (!BATTLE_ID) {
    console.error('사용법: npx tsx scripts/prepare-publish.ts <battleId> [baseUrl]')
    process.exit(1)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('.env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 가 필요합니다.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select('*')
    .eq('battle_id', BATTLE_ID)
    .single()

  if (battleError || !battle) {
    console.error('배틀을 찾을 수 없습니다:', BATTLE_ID, battleError?.message)
    process.exit(1)
  }

  const p = (battle.participants as { fighter1: string; fighter2: string }) || {}
  const [f1, f2] = await Promise.all([
    supabase.from('agents').select('persona_name, avatar_emoji').eq('agent_id', p.fighter1 || '').single(),
    supabase.from('agents').select('persona_name, avatar_emoji').eq('agent_id', p.fighter2 || '').single(),
  ])

  const name1 = f1.data?.persona_name || '1번'
  const name2 = f2.data?.persona_name || '2번'
  const topic = battle.topic_text || ''
  const winnerSide: 1 | 2 =
    battle.winner_agent_id === p.fighter1 ? 1 : battle.winner_agent_id === p.fighter2 ? 2 : 1
  const winnerName = winnerSide === 1 ? name1 : name2
  const mvpStatement = battle.mvp_statement || ''
  const battleUrl = `${BASE_URL}/battle/${BATTLE_ID}`

  const hashtags = buildHashtags(topic, winnerName)
  const hashtagLine = hashtags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join(' ')

  const youtube = {
    title: `⚔️ ${topic} | ${name1} vs ${name2} - 썰로세움`,
    description: [
      `${topic}에 대한 AI 말싸움 배틀!`,
      `승자: ${winnerName}`,
      mvpStatement ? `MVP 대사: "${mvpStatement}"` : '',
      '',
      `전체 배틀 보기: ${battleUrl}`,
      '',
      hashtagLine,
    ]
      .filter(Boolean)
      .join('\n'),
    tags: [...HASHTAG_BASE, topic.slice(0, 30)].filter(Boolean),
  }

  const tiktok = {
    caption: `${topic} | ${name1} vs ${name2} 👉 승자: ${winnerName}\n\n${mvpStatement ? `"${mvpStatement}"` : ''}\n\n${battleUrl}\n\n${hashtagLine}`,
    hashtags: hashtags.map((t) => (t.startsWith('#') ? t.slice(1) : t)),
  }

  const x = {
    text: `${topic} | ${name1} vs ${name2}\n승자: ${winnerName} 👑\n\n${battleUrl}\n\n${hashtagLine}`,
  }

  const payload = {
    battleId: BATTLE_ID,
    baseUrl: BASE_URL,
    battleUrl,
    topic,
    fighter1: name1,
    fighter2: name2,
    winnerName,
    mvpStatement,
    youtube,
    tiktok,
    x,
    preparedAt: new Date().toISOString(),
  }

  fs.mkdirSync(OUT_METADATA, { recursive: true })
  const outPath = path.join(OUT_METADATA, `${BATTLE_ID}-publish.json`)
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log('저장:', outPath)
  console.log('---')
  console.log('YouTube 제목:', youtube.title)
  console.log('TikTok 캡션 (앞 80자):', tiktok.caption.slice(0, 80) + '...')
  console.log('X 본문 (앞 80자):', x.text.slice(0, 80) + '...')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
