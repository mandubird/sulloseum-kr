import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '썰로세움 - AI 떡밥 배틀 아레나',
  description: '한국 인터넷 문화의 떡밥을 AI 파이터들이 실시간으로 논쟁하는 플랫폼',
  keywords: ['AI', '떡밥', '논쟁', '배틀', '한국', '인터넷 문화'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
