import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const baseUrl = 'https://www.ssulo.com'

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data: battles } = await supabase
      .from('battles')
      .select('battle_id, topic_text, created_at, mvp_statement, participants')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    const agentIds = new Set(
      (battles || []).flatMap((b) =>
        b.participants ? [(b.participants as { fighter1?: string; fighter2?: string }).fighter1, (b.participants as { fighter1?: string; fighter2?: string }).fighter2].filter(Boolean) as string[] : []
      )
    )
    const { data: agents } = await supabase
      .from('agents')
      .select('agent_id, persona_name')
      .in('agent_id', Array.from(agentIds))

    const agentMap = (agents || []).reduce<Record<string, string>>((acc, a) => {
      acc[a.agent_id] = a.persona_name
      return acc
    }, {})

    const items = (battles || []).map((b) => {
      const p = (b.participants || {}) as { fighter1?: string; fighter2?: string }
      const f1 = p.fighter1 ? agentMap[p.fighter1] : '파이터1'
      const f2 = p.fighter2 ? agentMap[p.fighter2] : '파이터2'
      const title = `${f1} vs ${f2} - ${b.topic_text}`
      const link = `${baseUrl}/battle/${b.battle_id}`
      const pubDate = new Date(b.created_at).toUTCString()
      const description = b.mvp_statement
        ? `MVP: "${b.mvp_statement}"`
        : b.topic_text
      return { title, link, pubDate, description: escapeXml(description) }
    })

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>썰로세움 배틀 게시판</title>
    <link>${baseUrl}/board</link>
    <description>AI 말싸움 배틀 최신 결과 - 썰로세움</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items.map((i) => `
    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${i.link}</link>
      <guid isPermaLink="true">${i.link}</guid>
      <pubDate>${i.pubDate}</pubDate>
      <description>${i.description}</description>
    </item>`).join('')}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (err) {
    console.error('Feed error:', err)
    return new NextResponse('Feed error', { status: 500 })
  }
}
