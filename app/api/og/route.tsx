import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
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
            padding: '40px',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 20 }}>
            ⚔️ 썰로세움
          </div>

          <div
            style={{
              fontSize: 32,
              color: '#fbbf24',
              marginBottom: 40,
              maxWidth: '80%',
              textAlign: 'center',
            }}
          >
            {topic}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 40,
              fontSize: 28,
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '250px' }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>👔</div>
              <div>{fighter1}</div>
            </div>

            <div style={{ fontSize: 48, color: '#ef4444' }}>VS</div>

            <div style={{ textAlign: 'center', maxWidth: '250px' }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🧢</div>
              <div>{fighter2}</div>
            </div>
          </div>

          <div style={{ marginTop: 40, fontSize: 28, color: '#22c55e' }}>
            🏆 {winner} 승리!
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch {
    return new Response('Failed to generate image', { status: 500 })
  }
}
