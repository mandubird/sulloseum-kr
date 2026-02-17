import { NextRequest, NextResponse } from 'next/server'
import { rewriteTopicsBatch } from '@/lib/rewrite-topic'

const MAX_TOPICS_PER_REQUEST = 20

export async function POST(req: NextRequest) {
  try {
    const { topics } = (await req.json()) as { topics?: string[] }
    if (!Array.isArray(topics) || topics.length === 0 || topics.length > MAX_TOPICS_PER_REQUEST) {
      return NextResponse.json(
        { error: `topics must be an array of 1~${MAX_TOPICS_PER_REQUEST} items` },
        { status: 400 }
      )
    }
    const rewritten = await rewriteTopicsBatch(topics)
    return NextResponse.json({ rewritten })
  } catch (err) {
    console.error('rewrite-topics error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
