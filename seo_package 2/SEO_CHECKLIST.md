# SEO 체크리스트 & Google Search Console 등록 가이드

## ✅ 완료해야 할 작업

### 1. 파일 추가
```
✅ app/layout.tsx          → 메타데이터 추가
✅ app/battle/[battleId]/page.tsx → generateMetadata 추가
✅ app/board/page.tsx      → 메타데이터 추가
✅ app/sitemap.ts          → 신규 생성
✅ app/robots.ts           → 신규 생성
✅ app/api/og/route.tsx    → OG 이미지 API
✅ components/BattleStructuredData.tsx → 구조화된 데이터
```

### 2. Google Search Console 등록

**Step 1: 사이트 등록**
1. [Google Search Console](https://search.google.com/search-console) 접속
2. "속성 추가" 클릭
3. "URL 접두어" 선택 → `https://www.ssulo.com` 입력

**Step 2: 소유권 확인**
방법 1 (권장): HTML 태그
```tsx
// app/layout.tsx의 metadata에 추가
export const metadata = {
  // ... 기존 내용
  verification: {
    google: 'your-verification-code-here', // ← Google에서 받은 코드
  },
}
```

방법 2: DNS 레코드
→ 후이즈 DNS 관리에서 TXT 레코드 추가

**Step 3: Sitemap 제출**
1. Search Console → "Sitemaps" 메뉴
2. `https://www.ssulo.com/sitemap.xml` 입력
3. "제출" 클릭

---

## 🔍 네이버 서치어드바이저 등록

1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속
2. "사이트 등록" → `https://www.ssulo.com`
3. HTML 태그로 소유권 확인:
```tsx
// app/layout.tsx <head> 안에 추가
<meta name="naver-site-verification" content="your-naver-code" />
```
4. 사이트맵 제출: `https://www.ssulo.com/sitemap.xml`

---

## 📊 성능 모니터링 도구

### Google Analytics 4 (GA4) 추가
```tsx
// app/layout.tsx <head> 안에 추가
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## 🚀 배포 후 할 일

### 1주차
- [ ] Google Search Console 인덱스 요청 (주요 페이지 5개)
- [ ] 네이버 서치어드바이저 수집 요청
- [ ] GA4 트래픽 확인

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
```tsx
// 게시판에서 관련 배틀 추천
<div className="related-battles">
  <h3>비슷한 주제 배틀</h3>
  <Link href="/battle/xxx">회식은 업무시간인가?</Link>
  <Link href="/battle/yyy">야근은 열정인가?</Link>
</div>
```

### 캐노니컬 URL 명시
```tsx
// 중복 URL 방지
export const metadata = {
  alternates: {
    canonical: `https://www.ssulo.com/battle/${battleId}`,
  },
}
```

### 페이지 로딩 속도 개선
- 이미지 최적화: Next.js Image 컴포넌트 사용
- 폰트 최적화: next/font 사용
- 코드 스플리팅: dynamic import 활용

---

## 📈 예상 검색 유입 키워드

**1차 타겟 (1개월 내)**
- AI 말싸움 게임
- 깻잎 논쟁
- 회식 논쟁 게임
- 직장 논쟁

**2차 타겟 (3개월 내)**
- 회식강요 상무
- MZ 퇴사
- 디시 고인물
- 인스타 감성러

**롱테일 키워드**
- "깻잎은 바람인가"
- "회식은 업무시간인가"
- "퇴근 10분 전 업무 지시"
- 각 배틀 주제들이 롱테일 키워드로 작동

---

## 🎯 성공 지표

### 3개월 목표
- Google 검색 노출: 주요 키워드 3페이지 내
- 일 방문자: 100명
- 배틀 생성: 일 30개

### 6개월 목표
- Google 검색 노출: 주요 키워드 1페이지 내
- 일 방문자: 500명
- 배틀 생성: 일 100개
