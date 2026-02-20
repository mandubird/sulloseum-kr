// components/BattleStructuredData.tsx
'use client'

interface BattleStructuredDataProps {
  battleId: string
  topic: string
  fighter1Name: string
  fighter2Name: string
  winnerName: string
  mvpStatement: string
  createdAt: string
}

export default function BattleStructuredData({
  battleId, topic, fighter1Name, fighter2Name,
  winnerName, mvpStatement, createdAt,
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
      {
        '@type': 'Person',
        name: fighter1Name,
      },
      {
        '@type': 'Person',
        name: fighter2Name,
      },
    ],
    winner: {
      '@type': 'Person',
      name: winnerName,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// 사용법:
// app/battle/[battleId]/page.tsx의 return 안에 추가
// <BattleStructuredData
//   battleId={battleId}
//   topic={topic}
//   fighter1Name={fighter1.persona_name}
//   fighter2Name={fighter2.persona_name}
//   winnerName={winnerSide === 1 ? fighter1.persona_name : fighter2.persona_name}
//   mvpStatement={mvpStatement}
//   createdAt={new Date().toISOString()}
// />
