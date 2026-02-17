-- 배틀 게시판 리액션 1인 1회 제한용 투표 기록 테이블
-- (battle_id, voter_hash) 당 한 번만 리액션 가능 (voter_hash = IP 해시 등)

CREATE TABLE IF NOT EXISTS battle_reaction_votes (
  battle_id UUID NOT NULL REFERENCES battles(battle_id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (battle_id, voter_hash)
);

CREATE INDEX IF NOT EXISTS idx_battle_reaction_votes_battle_id ON battle_reaction_votes(battle_id);

-- RLS: 익명 투표이므로 SELECT는 서버만 필요 시 사용, INSERT는 API에서만
ALTER TABLE battle_reaction_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read battle_reaction_votes" ON battle_reaction_votes FOR SELECT USING (true);
CREATE POLICY "Allow public insert battle_reaction_votes" ON battle_reaction_votes FOR INSERT WITH CHECK (true);
