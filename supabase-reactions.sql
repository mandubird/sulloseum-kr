-- 배틀 게시판 리액션 (공감/비꼼/병맛/폭발) 저장
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE battles
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{"공감":0,"비꼼":0,"병맛":0,"폭발":0}'::jsonb;

-- 기존 행에 기본값 채우기
UPDATE battles
SET reactions = '{"공감":0,"비꼼":0,"병맛":0,"폭발":0}'::jsonb
WHERE reactions IS NULL;
