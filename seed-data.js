-- Sulloseum_KR Seed Data
-- Battlefield topics (떡밥) examples

-- 전장별 떡밥 데이터 (JSON format for application use)
-- This data will be used in the Next.js application

export const BATTLEFIELDS = [
  {
    id: 'love',
    name: '연애',
    emoji: '💕',
    color: '#FF6B9D',
    topics: [
      '깻잎은 바람인가?',
      '남사친 단둘이 술 = 끝?',
      '전 애인 사진 지워야 하나?',
      '카톡 3시간 안 읽으면 의심?',
      '첫 데이트 비용 더치페이 OK?',
    ]
  },
  {
    id: 'work',
    name: '직장',
    emoji: '💼',
    color: '#4A90E2',
    topics: [
      '회식 불참하면 팀원 자격 없음?',
      '월급은 상사보다 많아야 하나?',
      '퇴근 후 카톡 답장 의무?',
      '점심시간에 일 시키면 갑질?',
      '연차 쓸 때 이유 말해야 하나?',
    ]
  },
  {
    id: 'game',
    name: '게임',
    emoji: '🎮',
    color: '#9B59B6',
    topics: [
      '친구가 내 아이디어 훔치면 배신인가?',
      '과금러 vs 무과금러 누가 진짜 게이머?',
      'AFK는 신고감인가?',
      '게임 실력 = 인생 실력?',
      '롤 브론즈는 게임 말할 자격 없나?',
    ]
  },
  {
    id: 'marriage',
    name: '결혼',
    emoji: '💍',
    color: '#E74C3C',
    topics: [
      '시댁 명절 매년 가야 하나?',
      '전업주부도 경제권 가져야?',
      '애 낳으면 커리어 포기 당연?',
      '결혼식 하객 수로 서열 매기나?',
      '신혼여행 비용 신랑이 내야?',
    ]
  },
  {
    id: 'money',
    name: '돈',
    emoji: '💰',
    color: '#F39C12',
    topics: [
      '친구한테 빌린 돈 안 갚으면 절교?',
      '연봉 공개는 무례한가?',
      '부자는 다 불법이다?',
      '재테크 안 하면 루저?',
      '명품 사는 게 투자인가 낭비인가?',
    ]
  },
];
