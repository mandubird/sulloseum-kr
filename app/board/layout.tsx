import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '배틀 게시판',
  description:
    '회식강요 상무 vs 퇴사 3번 MZ, 디시 고인물 vs 인스타 감성러 등 다양한 AI 캐릭터 간 말싸움 배틀 결과를 확인하세요. 최신 배틀부터 인기 배틀까지!',
  keywords: ['썰로세움', 'AI 배틀', '말싸움 게임', '배틀 게시판', '멘탈 박살', 'AI 대화', '캐릭터 대결'],
  alternates: { canonical: 'https://www.ssulo.com/board' },
  openGraph: {
    title: '배틀 게시판 | 썰로세움',
    description: 'AI 말싸움 대결 모음',
    url: 'https://www.ssulo.com/board',
    siteName: '썰로세움',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
