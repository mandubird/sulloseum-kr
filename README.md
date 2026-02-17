# 썰로세움 (Sulloseum_KR)

⚔️ **AI 떡밥 배틀 아레나** - 한국 인터넷 문화의 논쟁거리를 AI 페르소나들이 실시간으로 싸우는 플랫폼

## 📖 프로젝트 개요

썰로세움은 한국 인터넷 문화의 다양한 "떡밥" (논쟁거리)를 던지면, AI 파이터들이 각자의 페르소나 특성에 맞춰 실시간으로 논쟁하는 재미있는 웹 플랫폼입니다.

### 주요 기능

- 🎮 **5개 전장**: 연애, 직장, 게임, 결혼, 돈
- 🤖 **6개 AI 페르소나**: 꼰대부장, MZ사원, 디시러, 인스타러, 승부욕러, 감정파
- ⚡ **실시간 전투**: Supabase Realtime으로 라운드별 발언 스트리밍
- 🎭 **관객 참여**: 공격/방어/병맛/감정 반응 버튼으로 AI 발언 영향
- 📸 **결과 공유**: 전투 결과 스크린샷 및 SNS 공유

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Screenshot**: html2canvas

### Backend
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: OpenAI GPT-4o-mini
- **Hosting**: Vercel

### Languages
- TypeScript
- SQL (Postgres)

## 📁 프로젝트 구조

```
Sulloseum_KR/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (battlefield gallery)
│   ├── battle/
│   │   └── [battleId]/
│   │       └── page.tsx        # Battle arena page
│   └── api/
│       └── generate-statement/
│           └── route.ts        # AI generation API
├── components/
│   ├── BattlefieldCard.tsx     # Battlefield selection card
│   ├── BattleSetupModal.tsx    # Topic & fighter selection modal
│   └── ScreenshotShare.tsx     # Battle result sharing
├── lib/
│   ├── supabase.ts             # Supabase client & types
│   ├── openai.ts               # OpenAI API integration
│   └── battlefields.ts         # Battlefield data constants
├── styles/
│   └── globals.css             # Global styles
├── supabase-schema.sql         # Database schema
├── seed-data.js                # Initial data
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.example
```

## 📤 GitHub에 올리기 / 업데이트하기

저장소가 이미 있다면 (예: [github.com/mandubird/sulloseum-kr](https://github.com/mandubird/sulloseum-kr)) 로컬에서 아래만 하면 됩니다.

### 처음 한 번만 (로컬에 Git이 아직 없을 때)

```bash
cd Sulloseum_KR   # 프로젝트 폴더로 이동
git init
git add .
git commit -m "Initial commit: 썰로세움 프로젝트"
git branch -M main
git remote add origin https://github.com/mandubird/sulloseum-kr.git
git push -u origin main
```

### 이미 한 번 올렸다면 (이후 수정사항 반영)

코드 수정 후 GitHub에 반영할 때:

```bash
cd Sulloseum_KR
git add .
git commit -m "변경 내용 한 줄 요약"
git push
```

- `git add .` → 변경된 파일 모두 스테이징  
- `git commit -m "..."` → 커밋 메시지 (무슨 수정인지 적기)  
- `git push` → GitHub 저장소로 업로드  

`.env.local`은 `.gitignore`에 있어서 푸시되지 않으므로, Vercel 환경 변수는 대시보드에서 따로 설정해야 합니다.

---

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd Sulloseum_KR
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

다음 환경 변수 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일 실행
3. 데이터베이스 URL과 anon key를 `.env.local`에 입력

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 📊 데이터베이스 스키마

### users
- `user_id` (UUID, PK)
- `username` (VARCHAR)
- `avatar_url` (TEXT)
- `role` (VARCHAR)
- `join_date` (TIMESTAMPTZ)

### battles
- `battle_id` (UUID, PK)
- `battlefield` (VARCHAR) - 전장 ID
- `topic_text` (TEXT) - 떡밥 주제
- `start_time` (TIMESTAMPTZ)
- `end_time` (TIMESTAMPTZ)
- `participants` (JSONB) - 파이터 ID 배열
- `status` (VARCHAR) - active/completed

### agents
- `agent_id` (UUID, PK)
- `persona_name` (VARCHAR) - 페르소나 이름
- `style` (VARCHAR) - 논리/감정/병맛
- `description` (TEXT)
- `avatar_emoji` (VARCHAR)
- `personality_traits` (JSONB) - 성격 특성

### rounds
- `round_id` (UUID, PK)
- `battle_id` (UUID, FK)
- `round_number` (INTEGER)
- `agent_id` (UUID, FK)
- `statement_text` (TEXT) - AI 발언
- `response_to_agent_id` (UUID, FK)
- `user_reaction` (VARCHAR) - 공격/방어/병맛/감정

## 🎨 AI 페르소나 설계

각 페르소나는 고유한 특성을 가지고 있습니다:

| 페르소나 | 스타일 | 특징 | 공격성 |
|---------|-------|------|--------|
| 꼰대부장 | 논리 | 경험과 서열 중시, 권위적 | 7/10 |
| MZ사원 | 감정 | 공감과 워라밸 중시 | 5/10 |
| 디시러 | 병맛 | 직설적이고 비꼬는 스타일 | 9/10 |
| 인스타러 | 감정 | 감성적이고 트렌디 | 4/10 |
| 승부욕러 | 논리 | 경쟁적, 승리 지향 | 8/10 |
| 감정파 | 감정 | 공감과 감정 우선 | 3/10 |

## 🎮 사용 방법

1. **전장 선택**: 메인 화면에서 5개 전장 중 하나 선택
2. **떡밥 입력**: 논쟁 주제 직접 입력 또는 추천 떡밥 선택
3. **파이터 선택**: 6개 AI 페르소나 중 2명 선택
4. **배틀 관전**: AI들의 실시간 논쟁 라운드별 진행
5. **관객 참여**: 공격/방어/병맛/감정 버튼으로 AI 발언에 영향
6. **결과 공유**: 전투 종료 후 스크린샷 저장 및 SNS 공유

## 🌐 Vercel 배포

### 1. Vercel에 프로젝트 올리기

**방법 A: Vercel 웹에서 연결 (권장)**

1. [vercel.com](https://vercel.com) 로그인 (GitHub 계정 연동 추천)
2. **Add New** → **Project** 선택
3. **Import Git Repository**에서 이 프로젝트가 있는 저장소 선택  
   (GitHub에 코드 푸시 방법은 아래 "GitHub 업데이트" 참고)
4. **Framework Preset**: Next.js 자동 감지
5. **Root Directory**: 비워두기 (프로젝트 루트가 맞다면)
6. **Environment Variables**에서 아래 변수 입력 후 **Deploy** 클릭

**방법 B: Vercel CLI로 배포**

```bash
npm i -g vercel
vercel
```

처음 실행 시 로그인·프로젝트 연결 후, 환경 변수는 웹 대시보드에서 설정.

### 2. Vercel 환경 변수 설정 (필수)

Vercel 대시보드 → 프로젝트 선택 → **Settings** → **Environment Variables**에서 추가:

| 이름 | 값 | 비고 |
|------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Supabase 대시보드 → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key | 위와 동일 경로 |
| `OPENAI_API_KEY` | OpenAI API 키 | [platform.openai.com](https://platform.openai.com)에서 발급 |

- **Environment**: Production, Preview, Development 모두 체크해 두면 편함.
- 저장 후 **Redeploy** 한 번 하면 적용됨.

### 3. 배포 후 확인

- 배포가 끝나면 `https://프로젝트명.vercel.app` 주소로 접속.
- 새 배틀 생성·게시판·재생이 정상 동작하는지 확인.
- Supabase는 이미 퍼블릭 URL로 접속되므로 별도 도메인 설정 없이 동작함.

### 4. 커스텀 도메인 연결 (ssulo.com)

도메인을 **호스팅케이알**에서 구입했다면, Vercel에 도메인을 추가한 뒤 DNS만 연결하면 됩니다.

#### 4-1. Vercel에서 도메인 추가

1. Vercel 대시보드 → 배포한 **프로젝트** 선택
2. **Settings** → **Domains** 이동
3. **Add**에 `ssulo.com` 입력 후 추가
4. **www.ssulo.com**도 쓰려면 같은 방식으로 `www.ssulo.com` 추가
5. Vercel이 안내하는 **DNS 설정 값**을 확인 (아래 4-2에서 사용)

#### 4-2. 호스팅케이알에서 DNS 설정

호스팅케이알 관리자(도메인 관리 / DNS 관리)에 들어가서 다음처럼 설정합니다.

**루트 도메인 ssulo.com만 쓸 경우 (권장)**

| 타입 | 호스트/이름 | 값/위치 |
|------|-------------|---------|
| **A** | `@` (또는 비움) | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

**Vercel이 도메인 추가 시 보여주는 값이 다르면, Vercel 안내를 우선 따르세요.**

- A 레코드: Vercel이 알려준 IP (보통 `76.76.21.21`)
- CNAME: Vercel이 알려준 CNAME (예: `cname.vercel-dns.com`)

#### 4-3. SSL(HTTPS) 및 반영 시간

- DNS 저장 후 **몇 분~최대 48시간** 걸릴 수 있음 (보통 10분~1시간 내 반영)
- Vercel이 **Let’s Encrypt**로 HTTPS 인증서를 자동 발급함 (별도 설정 불필요)
- **Domains** 화면에서 도메인 옆에 초록색 체크가 뜨면 연결 완료

#### 4-4. 정리

- **ssulo.com** → A 레코드 `76.76.21.21`
- **www.ssulo.com** → CNAME `cname.vercel-dns.com`
- 연결 후 `https://ssulo.com` 으로 접속해 동작 확인

## 🔧 개발 팁

### OpenAI API 비용 최적화
- `gpt-4o-mini` 모델 사용 (저비용)
- `max_tokens: 150` 제한
- 발언 길이 1~3문장으로 제한

### Supabase Realtime 최적화
- `eventsPerSecond: 10` 설정
- 필요한 테이블만 구독
- 컴포넌트 unmount 시 구독 해제

### 성능 최적화
- 이미지 최적화 (Next.js Image)
- 코드 스플리팅 (Dynamic Import)
- CSS 번들 최적화 (Tailwind Purge)

## 📝 향후 개선 사항

- [ ] 사용자 로그인 및 배틀 히스토리
- [ ] 커스텀 AI 페르소나 생성 기능
- [ ] 투표 시스템 (승자 선택)
- [ ] 랭킹 시스템
- [ ] 모바일 앱 버전
- [ ] 실시간 채팅 기능
- [ ] 카카오톡 공유 SDK 연동

## 📄 라이선스

MIT License

## 🤝 기여

이슈 제보 및 PR 환영합니다!

## 📧 문의

프로젝트 관련 문의: [이메일 주소]

---

**Made with ❤️ for Korean Internet Culture**
