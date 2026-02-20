# 설로세움 SEO 최적화 개발 지시서 (Cursor AI용)

> 이 문서를 Cursor AI에 복사 붙여넣기 하세요.
> 기존 코드 구조를 유지하면서 SEO 기능을 추가합니다.

---

## 🎯 목표

구글/네이버 검색 엔진 최적화를 위해 다음을 구현:
1. 동적 메타데이터 (제목, 설명, OG 이미지)
2. sitemap.xml 자동 생성
3. robots.txt 설정
4. 구조화된 데이터 (JSON-LD)
5. 동적 OG 이미지 생성

---

## 📋 작업 목록

### ✅ Task 1: 루트 레이아웃 메타데이터 추가

**파일:** `app/layout.tsx`

**작업 내용:**
기존 레이아웃 파일의 **맨 위에** 다음 메타데이터를 추가하세요. 기존 코드는 건드리지 말고, import와 metadata 부분만 추가합니다.

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '설로세움 - AI 말싸움 배틀 게임',
    template: '%s | 설로세움',
  },
  description: '회식강요 상무, 퇴사 3번 MZ, 디시 고인물, 인스타 감성러 등 6인의 AI 캐릭터가 펼치는 말싸움 배틀! 깻잎은 바람인가? 회식은 업무시간인가? 지금 바로 멘탈 배틀 시작!',
  keywords: [
    '설로세움', 'AI 배틀', '말싸움 게임', 'AI 대화', '멘탈 박살',
    '회식강요 상무', '퇴사 3번 MZ', '디시 고인물', '인스타 감성러',
    '캐릭터 대결', '깻잎 논쟁', '직장 논쟁', '연애 논쟁',
  ],
  metadataBase: new URL('https://www.ssulo.com'),
  openGraph: {
    title: '설로세움 - AI 말싸움 배틀 게임',
    description: '6인의 AI 캐릭터가 펼치는 말싸움 배틀! 깻잎은 바람인가? 회식은 업무시간인가?',
    url: 'https://www.ssulo.com',
    siteName: '설로세움',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '설로세움 - AI 말싸움 배틀 게임',
    description: '6인의 AI 캐릭터가 펼치는 말싸움 배틀!',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// 기존 export default function RootLayout... 은 그대로 유지
```

그리고 `<html>` 태그에 `lang="ko"` 속성을 추가하세요:
```typescript
<html lang="ko">
```

---

### ✅ Task 2: 게시판 페이지 메타데이터

**파일:** `app/board/page.tsx`

**작업 내용:**
파일 맨 위에 다음을 추가:

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '배틀 게시판',
  description: '회식강요 상무 vs 퇴사 3번 MZ, 디시 고인물 vs 인스타 감성러 등 다양한 AI 캐릭터 간 말싸움 배틀 결과를 확인하세요.',
  openGraph: {
    title: '설로세움 배틀 게시판',
    description: 'AI 말싸움 대결 모음',
  },
}

// 기존 컴포넌트 코드는 그대로 유지
```

---

### ✅ Task 3: 배틀 페이지 동적 메타데이터

**파일:** `app/battle/[battleId]/page.tsx`

**작업 내용:**
1. 파일 맨 위에 Metadata import 추가
2. 기존 컴포넌트 함수 **위에** generateMetadata 함수 추가

```typescript
import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

// generateMetadata 함수 추가 (기존 컴포넌트 위에)
export async function generateMetadata({ 
  params 
}: { 
  params: { battleId: string } 
}): Promise<Metadata> {
  try {
    const { data: battle } = await supabase
      .from('battles')
      .select('topic_text, battlefield, mvp_statement, hp1, hp2, participants')
      .eq('battle_id', params.battleId)
      .single()

    if (!battle) {
      return {
        title: 'AI 배틀',
        description: 'AI 캐릭터 간 말싸움 배틀',
      }
    }

    const p = battle.participants as { fighter1: string; fighter2: string }
    const [{ data: f1 }, { data: f2 }] = await Promise.all([
      supabase.from('agents').select('persona_name').eq('agent_id', p.fighter1).single(),
      supabase.from('agents').select('persona_name').eq('agent_id', p.fighter2).single(),
    ])

    const winner = battle.hp1 > 0 ? f1?.persona_name : f2?.persona_name
    const loser = battle.hp1 > 0 ? f2?.persona_name : f1?.persona_name
    const title = `${f1?.persona_name} vs ${f2?.persona_name} - ${battle.topic_text}`
    const description = `${winner}이(가) ${loser}을(를) 멘탈 박살! "${battle.mvp_statement || battle.topic_text}"`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.ssulo.com/battle/${params.battleId}`,
        images: [
          {
            url: `/api/og?f1=${encodeURIComponent(f1?.persona_name || '')}&f2=${encodeURIComponent(f2?.persona_name || '')}&topic=${encodeURIComponent(battle.topic_text)}&winner=${encodeURIComponent(winner || '')}`,
            width: 1200,
            height: 630,
          },
        ],
      },
    }
  } catch (err) {
    return {
      title: 'AI 배틀',
      description: 'AI 캐릭터 간 말싸움 배틀',
    }
  }
}

// 기존 export default function BattleArena()... 는 그대로 유지
```

---

### ✅ Task 4: Sitemap 생성

**파일:** `app/sitemap.ts` (신규 생성)

**작업 내용:**
새 파일을 만들고 다음 코드를 작성:

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ssulo.com'

  try {
    // 완료된 배틀 목록 가져오기
    const { data: battles } = await supabase
      .from('battles')
      .select('battle_id, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(500)

    const battleUrls = battles?.map((battle) => ({
      url: `${baseUrl}/battle/${battle.battle_id}`,
      lastModified: new Date(battle.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) || []

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/board`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.9,
      },
      ...battleUrls,
    ]
  } catch (err) {
    console.error('Sitemap error:', err)
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
```

---

### ✅ Task 5: Robots.txt 설정

**파일:** `app/robots.ts` (신규 생성)

**작업 내용:**
새 파일을 만들고 다음 코드를 작성:

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: 'https://www.ssulo.com/sitemap.xml',
  }
}
```

---

### ✅ Task 6: 동적 OG 이미지 생성 API

**파일:** `app/api/og/route.tsx` (신규 생성)

**작업 내용:**
새 폴더/파일을 만들고 다음 코드를 작성:

```typescript
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
            ⚔️ 설로세움
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
  } catch (err) {
    return new Response('Failed to generate image', { status: 500 })
  }
}
```

---

### ✅ Task 7: 기본 OG 이미지 생성 (선택)

**파일:** `public/og-image.png`

**작업 내용:**
Canva나 Figma에서 1200x630 크기 이미지 만들어서 `public/` 폴더에 추가:
- 배경: 어두운 그라데이션
- 텍스트: "설로세움 - AI 말싸움 배틀"
- 아이콘: ⚔️ 또는 캐릭터 이모지

또는 임시로 아무 이미지나 넣어두고 나중에 교체해도 됨.

---

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
npm run dev
```

다음 URL들 확인:
```
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt
http://localhost:3000/api/og?f1=회식강요상무&f2=퇴사3번MZ&topic=깻잎은바람인가
```

### 2. 메타데이터 확인
브라우저 개발자도구 → Elements → `<head>` 태그 안에서:
```html
<title>설로세움 - AI 말싸움 배틀 게임</title>
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
```

### 3. 배포 후 확인
```
https://www.ssulo.com/sitemap.xml
https://www.ssulo.com/robots.txt
```

---

## 🚀 배포 후 할 일

### Google Search Console 등록
1. https://search.google.com/search-console 접속
2. "속성 추가" → `https://www.ssulo.com`
3. 소유권 확인 (HTML 태그 방식):
   - Search Console에서 받은 코드를 `app/layout.tsx`의 metadata에 추가:
   ```typescript
   export const metadata = {
     // ... 기존 내용
     verification: {
       google: 'your-google-verification-code',
     },
   }
   ```
4. Sitemap 제출: `https://www.ssulo.com/sitemap.xml`

### 네이버 서치어드바이저 등록
1. https://searchadvisor.naver.com 접속
2. 동일하게 사이트 등록 및 sitemap 제출

---

## 📊 예상 검색 유입 키워드

**1차 타겟 키워드:**
- AI 말싸움 게임
- 깻잎 논쟁
- 회식 논쟁 게임
- 직장 논쟁

**롱테일 키워드:**
- "깻잎은 바람인가"
- "회식은 업무시간인가"
- "퇴근 10분 전 업무 지시"

각 배틀 주제가 자동으로 롱테일 키워드가 됩니다!

---

## ⚠️ 주의사항

1. **기존 코드 유지:** 이 작업은 기존 기능을 건드리지 않고 SEO 기능만 추가합니다.
2. **URL 확인:** `metadataBase`와 `baseUrl`을 실제 도메인(`https://www.ssulo.com`)으로 설정했는지 확인하세요.
3. **에러 처리:** Supabase 호출 실패 시에도 기본 메타데이터를 반환하도록 try-catch 처리되어 있습니다.
4. **이미지 경로:** OG 이미지는 동적으로 생성되므로 별도 이미지 파일 없이도 작동합니다.

---

## 🎯 완료 체크리스트

작업 완료 후 체크:
- [ ] app/layout.tsx에 메타데이터 추가
- [ ] app/board/page.tsx에 메타데이터 추가
- [ ] app/battle/[battleId]/page.tsx에 generateMetadata 추가
- [ ] app/sitemap.ts 생성
- [ ] app/robots.ts 생성
- [ ] app/api/og/route.tsx 생성
- [ ] 로컬에서 sitemap.xml 확인
- [ ] 로컬에서 robots.txt 확인
- [ ] 로컬에서 OG 이미지 API 확인
- [ ] Git commit & push
- [ ] Vercel 배포 확인
- [ ] Google Search Console 등록
- [ ] Sitemap 제출

---

## 💡 추가 최적화 (선택사항)

시간이 되면 나중에 추가:
1. 구조화된 데이터 (JSON-LD) - 검색 결과 풍부하게
2. 캐노니컬 URL - 중복 URL 방지
3. 페이지 속도 최적화 - 이미지/폰트 최적화
4. 내부 링크 강화 - 관련 배틀 추천

---

**이 문서를 Cursor AI에 복사 붙여넣기 하고 "위 지시서대로 SEO 최적화를 구현해줘"라고 요청하세요!**
