-- =============================================
-- 썰로세움 2.0 Phase 1 DB 업데이트
-- Supabase SQL Editor에서 순서대로 실행하세요
-- (PostgreSQL은 CREATE POLICY에 IF NOT EXISTS 미지원 → 기존 정책 삭제 후 생성)
-- =============================================

-- 1. battles 테이블 컬럼 추가
ALTER TABLE battles ADD COLUMN IF NOT EXISTS hp1 INTEGER DEFAULT 100;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS hp2 INTEGER DEFAULT 100;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS current_turn INTEGER DEFAULT 1;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS max_turns INTEGER DEFAULT 2;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS is_defending1 BOOLEAN DEFAULT false;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS is_defending2 BOOLEAN DEFAULT false;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS is_cached BOOLEAN DEFAULT false;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS mvp_statement TEXT;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS mvp_damage INTEGER DEFAULT 0;
ALTER TABLE battles ADD COLUMN IF NOT EXISTS combination_key VARCHAR(200);

-- 2. rounds 테이블 컬럼 추가
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS damage INTEGER DEFAULT 0;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS is_critical BOOLEAN DEFAULT false;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS counter_statement TEXT;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS counter_damage INTEGER DEFAULT 0;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS hp1_after INTEGER;
ALTER TABLE rounds ADD COLUMN IF NOT EXISTS hp2_after INTEGER;

-- 3. 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_battles_combination ON battles(combination_key);
CREATE INDEX IF NOT EXISTS idx_battles_view_count ON battles(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);

-- 4. RLS 정책 (기존 것 삭제 후 생성 — 이미 있으면 에러 없이 적용)
DROP POLICY IF EXISTS "Allow public insert battles" ON battles;
CREATE POLICY "Allow public insert battles" ON battles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update battles" ON battles;
CREATE POLICY "Allow public update battles" ON battles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public insert rounds" ON rounds;
CREATE POLICY "Allow public insert rounds" ON rounds FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update rounds" ON rounds;
CREATE POLICY "Allow public update rounds" ON rounds FOR UPDATE USING (true);

-- (이전에 다른 이름으로 만든 정책이 있다면 아래만 따로 실행해도 됩니다)
-- DROP POLICY IF EXISTS "Allow public insert on battles" ON battles;
-- DROP POLICY IF EXISTS "Allow public update on battles" ON battles;
-- DROP POLICY IF EXISTS "Allow public insert on rounds" ON rounds;
-- DROP POLICY IF EXISTS "Allow public update on rounds" ON rounds;

-- 5. 페르소나 데이터 교체
-- ⚠️ rounds가 agents를 참조하므로, 참조를 먼저 지워야 합니다.
--    기존 배틀/라운드 기록이 모두 삭제됩니다.
DELETE FROM rounds;
DELETE FROM battles;
DELETE FROM agents;

INSERT INTO agents (persona_name, style, description, avatar_emoji, personality_traits) VALUES
('회식강요 상무', '논리',
 '20년차 권위적 상무. 요즘 세대를 이해 못하고 훈계하듯 공격한다.',
 '👔',
 '{"speech":"요즘 것들은, 내가 그 나이 땐, 버릇이 없네","aggression":7,"explode_keywords":["책임","조직","예의","근성"],"locked":false}'),

('퇴사 3번 MZ', '감정',
 '회사를 3번 퇴사한 냉소적 MZ. 팩트로 꼰대를 저격한다.',
 '🧢',
 '{"speech":"그건 아닌데요, 그게 왜 제 책임이죠, 아 네 또 시작이네","aggression":6,"explode_keywords":["워라밸","가스라이팅","시대착오"],"locked":false}'),

('디시 고인물', '병맛',
 '디시인사이드 5년 고인물. 조롱과 밈으로 상대를 진지충으로 만든다.',
 '🖥️',
 '{"speech":"ㅋㅋㅋ, 그걸 믿는다고, 현실 좀 살아라","aggression":9,"explode_keywords":["현실","망상","자아도취"],"locked":false}'),

('인스타 감성러', '감정',
 '자기확신 강한 인스타 감성러. 도덕적 우위로 상대를 부정적인 사람으로 몬다.',
 '📸',
 '{"speech":"결국 중요한 건 마음이죠, 에너지가 느껴져요, 왜 그렇게 부정적이세요","aggression":4,"explode_keywords":["에너지","사랑","긍정"],"locked":false}'),

('현실 팩폭러', '논리',
 '숫자와 통계로 감정을 무시하고 논리로 압살한다.',
 '🔨',
 '{"speech":"통계적으로 보면, 객관적으로 말해서, 아니 이걸 설명해야 돼","aggression":8,"explode_keywords":["통계","객관적","데이터"],"locked":true,"unlock_condition":"3승 달성"}'),

('과몰입 감정파', '감정',
 '억울함과 분노의 화신. 과장과 감정폭발로 상대를 인성 문제로 몬다.',
 '🔥',
 '{"speech":"그게 말이 돼, 진짜 열받네, 니가 뭘 알아","aggression":9,"explode_keywords":["열받네","말이돼","인성"],"locked":true,"unlock_condition":"SNS 공유 1회"}');

-- 완료!
SELECT '✅ 썰로세움 2.0 DB 업데이트 완료!' as result;
