# 썰로세움 배포 가이드

## 📋 배포 전 체크리스트

### 1. Supabase 설정
- [ ] Supabase 프로젝트 생성
- [ ] `supabase-schema.sql` 실행하여 테이블 생성
- [ ] Row Level Security (RLS) 정책 확인
- [ ] Realtime 활성화 확인
- [ ] API Keys 복사 (URL, anon key)

### 2. OpenAI 설정
- [ ] OpenAI 계정 생성
- [ ] API Key 발급
- [ ] 사용 제한 설정 (비용 관리)
- [ ] GPT-4o-mini 모델 접근 권한 확인

### 3. 환경 변수 준비
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENAI_API_KEY=sk-your_openai_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.netlify.app
```

### 4. 로컬 테스트
- [ ] `npm install` 실행
- [ ] `.env.local` 파일 생성
- [ ] `npm run dev` 로컬 서버 실행
- [ ] 전장 선택 테스트
- [ ] 떡밥 입력 테스트
- [ ] AI 파이터 선택 테스트
- [ ] 배틀 시작 및 라운드 진행 테스트
- [ ] 관객 반응 버튼 테스트
- [ ] 스크린샷 캡처 테스트

## 🚀 Netlify 배포 단계

### 방법 1: Netlify CLI 사용

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# Netlify 로그인
netlify login

# 프로젝트 초기화
netlify init

# 빌드 테스트
npm run build

# 배포
netlify deploy --prod
```

### 방법 2: GitHub 연동 자동 배포

1. GitHub에 리포지토리 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. Netlify 대시보드 설정
   - New site from Git 선택
   - GitHub 리포지토리 연결
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Environment variables 추가:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENAI_API_KEY`

3. Deploy site 클릭

## 🔧 배포 후 설정

### 1. Custom Domain 설정 (선택사항)
- Netlify Dashboard → Domain settings
- Custom domain 추가
- DNS 설정 (Netlify DNS 또는 외부 DNS)
- HTTPS 자동 활성화 확인

### 2. 성능 모니터링
- Netlify Analytics 활성화
- Supabase 사용량 모니터링
- OpenAI API 사용량 확인

### 3. 환경 변수 업데이트
프로덕션 URL로 환경 변수 업데이트:
```env
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
```

## 🐛 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 로그 확인
npm run lint
```

### API 연결 실패
- 환경 변수 확인
- Supabase URL 및 API Key 재확인
- OpenAI API Key 유효성 확인
- CORS 설정 확인

### Realtime 연결 실패
- Supabase Realtime 활성화 확인
- WebSocket 연결 허용 확인
- 네트워크 방화벽 설정 확인

## 📊 비용 예측

### Supabase (Free Tier)
- Database: 500MB 무료
- Storage: 1GB 무료
- Bandwidth: 2GB 무료
- Realtime connections: 무제한

### OpenAI API
- GPT-4o-mini: $0.150 / 1M input tokens
- 예상: 1 배틀당 약 $0.001 (1,000 토큰)
- 월 1,000 배틀 = 약 $1

### Netlify (Free Tier)
- Bandwidth: 100GB/월
- Build minutes: 300분/월
- Functions: 125,000 invocations/월

**총 예상 비용**: 무료 ~ $5/월 (소규모 트래픽 기준)

## 🔐 보안 체크리스트

- [ ] API Keys는 환경 변수로 관리
- [ ] Supabase RLS 정책 활성화
- [ ] Rate limiting 설정 (Netlify Functions)
- [ ] CORS 정책 설정
- [ ] Content Security Policy 설정

## 📈 운영 모니터링

### 주요 메트릭
- 배틀 생성 수
- AI 발언 생성 성공률
- 평균 응답 시간
- 에러 발생률
- 사용자 이탈률

### 로그 확인
```bash
# Netlify 로그
netlify logs

# Supabase 로그
# Supabase Dashboard → Logs
```

## 🎯 최적화 팁

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - WebP 포맷 사용

2. **코드 스플리팅**
   - Dynamic Import 활용
   - Lazy Loading 적용

3. **캐싱 전략**
   - Static 페이지 캐싱
   - API 응답 캐싱

4. **CDN 활용**
   - Netlify CDN 자동 활용
   - 정적 에셋 최적화

## 📞 지원 및 문의

- Supabase Support: https://supabase.com/support
- Netlify Support: https://www.netlify.com/support/
- OpenAI Support: https://help.openai.com/

---

**배포 성공을 기원합니다! 🚀**
