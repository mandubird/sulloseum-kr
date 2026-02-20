// app/layout.tsx

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
  authors: [{ name: '설로세움' }],
  creator: '설로세움',
  publisher: '설로세움',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.ssulo.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '설로세움 - AI 말싸움 배틀 게임',
    description: '6인의 AI 캐릭터가 펼치는 말싸움 배틀! 깻잎은 바람인가? 회식은 업무시간인가?',
    url: 'https://www.ssulo.com',
    siteName: '설로세움',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '설로세움 - AI 말싸움 배틀',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '설로세움 - AI 말싸움 배틀 게임',
    description: '6인의 AI 캐릭터가 펼치는 말싸움 배틀!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Google Search Console에서 발급받으면 추가
    // google: 'your-verification-code',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* JSON-LD 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '설로세움',
              url: 'https://www.ssulo.com',
              description: 'AI 캐릭터 간 말싸움 배틀 게임',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.ssulo.com/board?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
