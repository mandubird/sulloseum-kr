# 썰로세움 (Sulloseum_KR) - 프로젝트 완성! 🎉

**방향:** 극단적 싸움이 아닌 **가치관 실험·관찰**을 위한 AI 배틀. 페르소나는 입장을 **연기**하며, 생각의 차이를 안전하게 관찰하는 장치로 설계됨. (자세한 제작 동기는 메인 하단 「왜 썰로세움을 만들었나요?」 및 README 참고.)

## 📦 생성된 파일들

### ✅ 프로젝트 전체 구조 (24개 파일)

#### 📋 설정 파일 (7개)
- `package.json` - 프로젝트 의존성 및 스크립트
- `tsconfig.json` - TypeScript 설정
- `next.config.js` - Next.js 설정
- `tailwind.config.js` - Tailwind CSS 커스텀 테마
- `postcss.config.js` - PostCSS 설정
- `netlify.toml` - Netlify 배포 설정
- `.env.example` - 환경 변수 템플릿

#### 🎨 애플리케이션 파일 (4개)
- `app/layout.tsx` - 루트 레이아웃
- `app/page.tsx` - 메인 페이지 (전장 갤러리)
- `app/battle/[battleId]/page.tsx` - 배틀 아레나 페이지
- `app/api/generate-statement/route.ts` - AI 발언 생성 API

#### 🧩 컴포넌트 (3개)
- `components/BattlefieldCard.tsx` - 전장 선택 카드
- `components/BattleSetupModal.tsx` - 떡밥/파이터 선택 모달
- `components/ScreenshotShare.tsx` - 배틀 결과 공유

#### 📚 라이브러리/유틸리티 (3개)
- `lib/supabase.ts` - Supabase 클라이언트 및 타입
- `lib/openai.ts` - OpenAI API 통합 및 페르소나 프롬프트
- `lib/battlefields.ts` - 전장 및 떡밥 데이터

#### 🎨 스타일 (1개)
- `styles/globals.css` - 전역 CSS 및 커스텀 애니메이션

#### 🗄️ 데이터베이스 (2개)
- `supabase-schema.sql` - Supabase PostgreSQL 스키마
- `seed-data.js` - 초기 데이터 (전장, 떡밥)

#### 📖 문서 (4개)
- `README.md` - 프로젝트 개요 및 설치 가이드
- `DEPLOYMENT.md` - 배포 상세 가이드
- `DEVELOPMENT_ROADMAP.md` - 개발 로드맵 및 체크리스트
- `.gitignore` - Git 제외 파일

---

## 🚀 빠른 시작 가이드

### 1️⃣ 프로젝트 설정
```bash
# ZIP 파일 압축 해제
unzip Sulloseum_KR.zip
cd Sulloseum_KR

# 의존성 설치
npm install
```

### 2️⃣ 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local
```

다음 정보 입력:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=sk-your_openai_key
```

### 3️⃣ Supabase 데이터베이스 설정
1. [Supabase](https://supabase.com) 가입 및 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 실행
3. Settings → API에서 URL과 anon key 복사

### 4️⃣ 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속!

---

## 🎯 주요 기능

### 1. 전장 선택
- 5개 카테고리: 💕 연애, 💼 직장, 🎮 게임, 💍 결혼, 💰 돈
- 각 전장마다 5개의 떡밥 준비

### 2. AI 페르소나 (6명)
| 페르소나 | 이모지 | 스타일 | 특징 |
|---------|--------|--------|------|
| 꼰대부장 | 👔 | 논리 | 경험과 서열 중시 |
| MZ사원 | 🎧 | 감정 | 워라밸과 공감 중시 |
| 디시러 | 🤡 | 병맛 | 직설적이고 비꼬는 스타일 |
| 인스타러 | ✨ | 감정 | 감성적이고 트렌디 |
| 승부욕러 | 🔥 | 논리 | 승리 지향적 |
| 감정파 | 💕 | 감정 | 공감 최우선 |

### 3. 실시간 배틀
- Supabase Realtime으로 라운드별 발언 스트리밍
- OpenAI GPT-4o-mini로 AI 발언 생성
- 관객 반응(공격/방어/병맛/감정)으로 AI 발언에 영향

### 4. 결과 공유
- 배틀 화면 스크린샷 캡처
- 이미지 다운로드
- SNS 공유 (Twitter, Facebook)
- 배틀 링크 복사

---

## 💻 기술 스택

### Frontend
- ⚡ **Next.js 14** - React 프레임워크
- 🎨 **Tailwind CSS** - 유틸리티 CSS
- 🎭 **Framer Motion** - 애니메이션
- 📸 **html2canvas** - 스크린샷

### Backend
- 🗄️ **Supabase** - PostgreSQL + Realtime
- 🤖 **OpenAI GPT-4o-mini** - AI 발언 생성
- 🚀 **Netlify** - 호스팅

### Languages
- TypeScript
- SQL (PostgreSQL)

---

## 📊 프로젝트 통계

- **총 코드 라인**: ~2,500 줄
- **컴포넌트**: 3개
- **API 엔드포인트**: 1개
- **데이터베이스 테이블**: 4개
- **AI 페르소나**: 6개
- **전장 카테고리**: 5개
- **떡밥 예시**: 25개

---

## 🎨 디자인 특징

### 1. 독특한 비주얼
- 그라데이션 배경 (보라색 → 분홍색)
- 커스텀 말풍선 스타일
- 네온 글로우 효과
- 반응형 애니메이션

### 2. 한국 웹폰트
- **디스플레이**: Black Han Sans (굵은 한글)
- **본문**: Noto Sans KR (가독성 우수)

### 3. 색상 시스템
```javascript
연애: #FF6B9D (핑크)
직장: #4A90E2 (블루)
게임: #9B59B6 (퍼플)
결혼: #E74C3C (레드)
돈: #F39C12 (골드)
```

---

## 🔧 개발 팁

### AI 발언 퀄리티 향상
- `personality_traits` 커스터마이징
- 프롬프트 템플릿 수정 (`lib/openai.ts`)
- `temperature` 조정 (현재 0.8)

### 비용 최적화
- GPT-4o-mini 사용 (저비용)
- `max_tokens: 150` 제한
- 발언 길이 1~3문장

### Realtime 성능
- `eventsPerSecond: 10` 설정
- 컴포넌트 unmount 시 구독 해제
- 필요한 테이블만 구독

---

## 📈 확장 아이디어

### 기능 추가
- [ ] 사용자 로그인 및 프로필
- [ ] 배틀 히스토리 저장
- [ ] 투표 시스템 (승자 선택)
- [ ] 랭킹 및 리더보드
- [ ] 커스텀 페르소나 생성
- [ ] 실시간 채팅 기능
- [ ] 모바일 앱 (React Native)

### 비즈니스
- [ ] 광고 시스템 통합
- [ ] 프리미엄 기능 (무제한 배틀)
- [ ] 분석 대시보드
- [ ] 소셜 기능 (팔로우, 댓글)

---

## 🐛 트러블슈팅

### 빌드 에러
```bash
npm run lint
npm run build
```

### API 연결 실패
- 환경 변수 확인
- Supabase URL/Key 재확인
- OpenAI API Key 유효성

### Realtime 연결 안 됨
- Supabase Realtime 활성화 확인
- WebSocket 연결 허용
- 네트워크 방화벽 설정

---

## 📞 지원 및 문의

### 외부 리소스
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 커뮤니티
- GitHub Issues로 버그 리포트
- 기능 제안 환영!

---

## 📄 라이선스

MIT License - 자유롭게 사용 및 수정 가능

---

## 🎉 축하합니다!

**썰로세움** 프로젝트가 완성되었습니다! 

이제 배포하고 친구들과 함께 AI 떡밥 배틀을 즐겨보세요! 🚀

**다음 단계:**
1. Supabase 설정
2. OpenAI API Key 발급
3. 로컬 테스트
4. Netlify 배포
5. 첫 배틀 시작!

---

**Made with ❤️ for Korean Internet Culture**

프로젝트 완성 일시: 2026년 2월 7일
