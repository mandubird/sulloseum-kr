# Phase 1 적용 가이드 — 헷갈리지 않게

## ✅ 가능한 것

| 질문 | 답변 |
|------|------|
| **phase1 폴더 주면 현재 프로젝트 업데이트 가능?** | **가능합니다.** `@/Users/gimmingyu/Downloads/sulloseum_phase1` 내용을 기준으로 Sulloseum_KR에 반영할 수 있습니다. |
| **지금 코드와 phase1 차이 이해 가능?** | **가능합니다.** 아래 "차이점 요약" 참고. |
| **README_PHASE1.md + MVP_명세서_v4_final.md 기반으로 수정 가능?** | **가능합니다.** 두 문서를 명세로 삼아 코드 수정/추가할 수 있습니다. |
| **당신이 할 일(Supabase 등)과 제가 할 일 분리 가능?** | **가능합니다.** 아래처럼 역할을 나누면 헷갈리지 않습니다. |

---

## 📋 역할 나누기 (헷갈리지 않게)

### 당신이 할 일 (직접 하시는 것)

1. **Supabase SQL 실행**
   - Supabase 대시보드 → SQL Editor
   - `supabase-phase1-update.sql` 내용 붙여넣기 → Run
   - (이 파일은 phase1 폴더에 있거나, 제가 명세서 기반으로 만들어 드릴 수 있음)
2. **환경 변수 확인**
   - `.env.local`에 `OPENAI_API_KEY`, Supabase URL/Key 있는지 확인
3. **실행/테스트**
   - `npm run dev` 후 배틀 시작·게시판 등 직접 확인
4. **추가로 하고 싶은 일**
   - 예: "이 버튼 문구만 바꿔줘", "Supabase에 컬럼 하나 더 추가했어" 등 → 말씀해 주시면 그에 맞춰 코드 수정 방향 제안

### 제가 할 일 (코드 반영)

1. **phase1 코드를 현재 프로젝트에 반영**
   - `lib/damage.ts`, `lib/openai.ts` 추가/수정
   - `MentalBar`, `ChatBubble`, `ReactionButtons`, `BattleResult` 컴포넌트 추가
   - `app/battle/[battleId]/page.tsx` Phase 1 스펙에 맞게 수정
   - `app/api/create-battle/route.ts` 추가 (혼합형 배틀 생성)
   - `app/board/page.tsx` 게시판 추가
2. **README_PHASE1 + MVP_명세서_v4_final 기반 수정**
   - 2턴 고정, 데미지/멘탈 게이지, 카카오톡형 UI, 크리티컬 연출, 공유/복수/다시하기 등 명세대로 반영
3. **기존 기능과 충돌 정리**
   - 지금 있는 `generate-first-round` API, 배틀 플로우와 Phase 1 플로우가 같이 동작하도록 하거나, Phase 1으로 통일하는 방식으로 정리

---

## 🔄 차이점 요약 (지금 vs Phase 1)

| 항목 | 지금 (Sulloseum_KR) | Phase 1 (명세서 기준) |
|------|----------------------|-------------------------|
| **턴 수** | 5라운드 (관객 반응 여러 번) | **2턴 고정** (API 3회만) |
| **비용** | 게임당 API 호출 많음 | **1게임 3회** (첫 대사 1회 + 턴 2회) |
| **배틀 생성** | 매번 새 배틀 생성 | **혼합형**: 같은 조합 3개 이상이면 DB에서 랜덤 재생 (비용 0) |
| **UI** | 말풍선 + 관객 반응 버튼 | **멘탈 게이지**(HP), **카카오톡형 말풍선**, **크리티컬 연출**, 멘탈 낮으면 화면 붉어짐 |
| **결과** | 스크린샷 공유 | **BattleResult**: 다시하기 / 복수하기 / 친구 도전 / 결과 공유 |
| **DB** | battles, rounds 기본 컬럼 | **battles**: hp1, hp2, current_turn, view_count, mvp_statement, combination_key 등 추가 / **rounds**: damage, is_critical, counter_statement 등 추가 |
| **페르소나** | 6명 (꼰대부장, MZ사원 등) | **6명 교체** (회식강요 상무, 퇴사 3번 MZ, 디시 고인물 등), 해금 2명 |
| **게시판** | 없음 | **/board** — 완료된 배틀 목록 (최신순/인기순) |

---

## 🚀 적용 순서 제안

1. **당신**: Supabase에서 `supabase-phase1-update.sql` 실행 (또는 제가 명세서로 SQL 초안 만들어 드리면 그걸로 실행)
2. **제가**: phase1 폴더 + README_PHASE1 + MVP_명세서_v4_final 기준으로 코드 반영 (파일 추가/수정)
3. **당신**: `npm run dev` 후 배틀·게시판 동작 확인
4. **당신**: "Supabase에 OO 추가했어", "이거만 바꿔줘" 같은 **할 일** 주시면, 그에 맞춰 제가 수정 방향/코드 제안

이렇게 하면 **당신이 할 일**과 **제가 할 일**이 나뉘어서 헷갈리지 않게 진행할 수 있습니다.

---

*이 문서는 Phase 1 적용 시 "누가 무엇을 하는지"만 정리한 가이드입니다. 실제 적용은 이 순서대로 진행하면 됩니다.*
