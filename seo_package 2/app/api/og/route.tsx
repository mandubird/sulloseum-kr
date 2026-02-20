// app/api/og/route.tsx
// 동적 OG 이미지 생성 (Next.js 13+ ImageResponse)

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const fighter1 = searchParams.get('f1') || '회식강요 상무'
  const fighter2 = searchParams.get('f2') || '퇴사 3번 MZ'
  const topic = searchParams.get('topic') || '깻잎은 바람인가?'
  const winner = searchParams.get('winner') || fighter1

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 제목 */}
        <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 20 }}>
          ⚔️ 설로세움
        </div>

        {/* 주제 */}
        <div
          style={{
            fontSize: 36,
            color: '#fbbf24',
            marginBottom: 40,
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          {topic}
        </div>

        {/* 대결 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            fontSize: 32,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>👔</div>
            <div>{fighter1}</div>
          </div>

          <div style={{ fontSize: 48, color: '#ef4444' }}>VS</div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🧢</div>
            <div>{fighter2}</div>
          </div>
        </div>

        {/* 승자 */}
        <div
          style={{
            marginTop: 40,
            fontSize: 28,
            color: '#22c55e',
          }}
        >
          🏆 {winner} 승리!
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// 사용법:
// generateMetadata에서 이렇게 사용:
// images: [{
//   url: `/api/og?f1=${f1.persona_name}&f2=${f2.persona_name}&topic=${battle.topic_text}&winner=${winner}`,
//   width: 1200,
//   height: 630,
// }]
