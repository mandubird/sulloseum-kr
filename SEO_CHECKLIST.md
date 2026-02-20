# SEO 체크리스트 & Google Search Console 등록 가이드

**목적:** 네이버·구글 검색엔진에 사이트가 잘 걸리도록(노출·인덱싱) 하기.  
코드 쪽 설정(사이트맵, robots, 메타, 캐노니컬, OG, JSON-LD)은 적용 완료.  
남은 작업은 **Google Search Console**과 **네이버 서치어드바이저**에 사이트 등록 후 사이트맵 제출하는 것이다.

---

## ✅ 적용된 SEO 항목

### 1. 파일 구성
- `app/layout.tsx` → 메타데이터, WebSite JSON-LD, AdSense, Clarity
- `app/board/layout.tsx` → 게시판 메타데이터 (board는 client라 layout에서 처리)
- `app/battle/[battleId]/layout.tsx` → generateMetadata (동적 제목·설명·OG·캐노니컬·키워드)
- `app/sitemap.ts` → sitemap.xml 자동 생성
- `app/robots.ts` → robots.txt
- `app/api/og/route.tsx` → 동적 OG 이미지 API
- `components/BattleStructuredData.tsx` → 배틀 페이지 JSON-LD (Event 스키마)

---

## 2. Google Search Console 등록

**Step 1: 사이트 등록**
1. [Google Search Console](https://search.google.com/search-console) 접속
2. "속성 추가" 클릭
3. "URL 접두어" 선택 → `https://www.ssulo.com` 입력

**Step 2: 소유권 확인**
방법 1 (권장): HTML 태그
```tsx
// app/layout.tsx의 metadata.verification에 추가
verification: {
  google: 'your-verification-code-here', // ← Google에서 받은 코드
},
```

방법 2: DNS 레코드 → DNS 관리에서 TXT 레코드 추가

**Step 3: Sitemap 제출**
1. Search Console → "Sitemaps" 메뉴
2. `https://www.ssulo.com/sitemap.xml` 입력
3. "제출" 클릭

---

## 🔍 네이버 서치어드바이저 등록

1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속
2. "사이트 등록" → `https://www.ssulo.com`
3. HTML 파일 방식: `public/naver6d1f6150cc36213f9b8e178387aa9f43.html` 이미 적용됨
4. 사이트맵 제출: `https://www.ssulo.com/sitemap.xml`

---

## 📊 성능 모니터링 (선택)

### Google Analytics 4 (GA4)
```tsx
// app/layout.tsx body 안에 추가
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
<Script id="google-analytics" strategy="afterInteractive">
  {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX');`}
</Script>
```

---

## 🚀 배포 후 할 일

### 1주차
- [ ] Google Search Console 인덱스 요청 (주요 페이지 5개)
- [ ] 네이버 서치어드바이저 수집 요청
- [ ] GA4/Clarity 트래픽 확인 (선택)

### 2주차
- [ ] Search Console에서 검색 노출 확인
- [ ] 크롤링 오류 체크
- [ ] 사이트맵 정상 작동 확인

### 1개월 후
- [ ] 주요 키워드 순위 확인:
  * "AI 말싸움 게임"
  * "깻잎 논쟁"
  * "회식 논쟁"
  * "AI 배틀"

---

## 💡 SEO 개선 팁

### 내부 링크 강화
- 게시판에서 "비슷한 주제 배틀" 추천 영역 추가
- 관련 배틀 링크로 내부 링크 강화

### 캐노니컬 URL
- 루트: `alternates.canonical: '/'`
- 보드: `alternates.canonical: 'https://www.ssulo.com/board'`
- 배틀: `alternates.canonical: battleUrl` (generateMetadata에서 적용됨)

### 페이지 로딩 속도
- 이미지: Next.js Image 컴포넌트
- 폰트: next/font
- 코드 스플리팅: dynamic import

---

## 📈 예상 검색 유입 키워드

**1차 타겟:** AI 말싸움 게임, 깻잎 논쟁, 회식 논쟁 게임, 직장 논쟁  
**2차 타겟:** 회식강요 상무, MZ 퇴사, 디시 고인물, 인스타 감성러  
**롱테일:** "깻잎은 바람인가", "회식은 업무시간인가", 각 배틀 주제

---

## 🎯 성공 지표

- **3개월:** 주요 키워드 3페이지 내, 일 방문자 100명, 배틀 생성 일 30개
- **6개월:** 주요 키워드 1페이지 내, 일 방문자 500명, 배틀 생성 일 100개
