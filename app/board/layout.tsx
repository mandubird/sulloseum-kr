import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '배틀 게시판',
  description:
    '회식강요 상무 vs 퇴사 3번 MZ, 디시 고인물 vs 인스타 감성러 등 다양한 AI 캐릭터 간 말싸움 배틀 결과를 확인하세요.',
  openGraph: {
    title: '배틀 게시판 | 썰로세움',
    description: 'AI 말싸움 대결 모음',
    url: 'https://www.ssulo.com/board',
  },
}

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
