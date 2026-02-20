'use client'

interface BattleStructuredDataProps {
  battleId: string
  topic: string
  fighter1Name: string
  fighter2Name: string
  winnerName: string
  mvpStatement: string
  /** ISO 날짜 문자열. 없으면 현재 시각 사용 */
  createdAt?: string
}

export default function BattleStructuredData({
  battleId,
  topic,
  fighter1Name,
  fighter2Name,
  winnerName,
  mvpStatement,
  createdAt = new Date().toISOString(),
}: BattleStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `${fighter1Name} vs ${fighter2Name} - ${topic}`,
    description: mvpStatement || topic,
    startDate: createdAt,
    endDate: createdAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: `https://www.ssulo.com/battle/${battleId}`,
    },
    performer: [
      { '@type': 'Person', name: fighter1Name },
      { '@type': 'Person', name: fighter2Name },
    ],
    winner: { '@type': 'Person', name: winnerName },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
