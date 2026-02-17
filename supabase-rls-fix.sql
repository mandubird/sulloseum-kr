-- 배틀 생성 실패 수정: battles/rounds INSERT·UPDATE 정책 추가
-- Supabase 대시보드 → SQL Editor에서 이 스크립트를 실행하세요.

-- battles: INSERT 허용 (배틀 생성용)
CREATE POLICY "Allow public insert on battles" ON battles FOR INSERT WITH CHECK (true);

-- battles: UPDATE 허용 (상태 변경용)
CREATE POLICY "Allow public update on battles" ON battles FOR UPDATE USING (true);

-- rounds: INSERT 허용 (라운드 발언 저장용)
CREATE POLICY "Allow public insert on rounds" ON rounds FOR INSERT WITH CHECK (true);

-- rounds: UPDATE 허용
CREATE POLICY "Allow public update on rounds" ON rounds FOR UPDATE USING (true);
