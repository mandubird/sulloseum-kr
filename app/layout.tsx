import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: '썰로세움 - AI 떡밥 배틀 아레나',
    template: '%s | 썰로세움',
  },
  description:
    '회식강요 상무, 퇴사 3번 MZ, 디시 고인물, 인스타 감성러 등 AI 캐릭터가 펼치는 말싸움 배틀! 깻잎은 바람인가? 회식은 업무시간인가? 지금 바로 멘탈 배틀 시작!',
  keywords: [
    '썰로세움',
    'AI 배틀',
    '말싸움 게임',
    'AI 대화',
    '떡밥',
    '논쟁',
    '회식강요 상무',
    '퇴사 3번 MZ',
    '디시 고인물',
    '인스타 감성러',
    '깻잎 논쟁',
    '직장 논쟁',
    '연애 논쟁',
  ],
  metadataBase: new URL('https://www.ssulo.com'),
  openGraph: {
    title: '썰로세움 - AI 떡밥 배틀 아레나',
    description:
      'AI 캐릭터가 펼치는 말싸움 배틀! 깻잎은 바람인가? 회식은 업무시간인가?',
    url: 'https://www.ssulo.com',
    siteName: '썰로세움',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '썰로세움 - AI 떡밥 배틀 아레나',
    description: 'AI 캐릭터가 펼치는 말싸움 배틀!',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Script
          id="adsense"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4031872323439673"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <Script id="clarity" strategy="beforeInteractive">
          {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vj7l8utp0c");`}
        </Script>
        {children}
      </body>
    </html>
  )
}
