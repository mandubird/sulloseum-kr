-- Sulloseum_KR Database Schema
-- Supabase Postgres Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  join_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Battles table
CREATE TABLE battles (
  battle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battlefield VARCHAR(50) NOT NULL, -- 연애, 직장, 게임, 결혼, 돈
  topic_text TEXT NOT NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  participants JSONB, -- Array of agent_ids
  winner_agent_id UUID,
  status VARCHAR(20) DEFAULT 'active', -- active, completed
  created_by UUID REFERENCES users(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents (AI Personas) table
CREATE TABLE agents (
  agent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_name VARCHAR(50) UNIQUE NOT NULL,
  style VARCHAR(20) NOT NULL, -- 논리, 감정, 병맛
  description TEXT,
  avatar_emoji VARCHAR(10),
  personality_traits JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds (AI statements in battles) table
CREATE TABLE rounds (
  round_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID NOT NULL REFERENCES battles(battle_id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  agent_id UUID NOT NULL REFERENCES agents(agent_id),
  statement_text TEXT NOT NULL,
  response_to_agent_id UUID REFERENCES agents(agent_id),
  user_reaction VARCHAR(20), -- 공격, 방어, 병맛, 감정
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, round_number, agent_id)
);

-- Indexes for performance
CREATE INDEX idx_battles_battlefield ON battles(battlefield);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_rounds_battle_id ON rounds(battle_id);
CREATE INDEX idx_rounds_agent_id ON rounds(agent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow read for all, allow insert on battles/rounds for battle flow)
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON battles FOR SELECT USING (true);
CREATE POLICY "Allow public insert on battles" ON battles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access" ON agents FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON rounds FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rounds" ON rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on battles" ON battles FOR UPDATE USING (true);
CREATE POLICY "Allow public update on rounds" ON rounds FOR UPDATE USING (true);

-- Insert initial battlefields data (전장 리스트)
-- This will be done via seed data

-- Insert initial AI personas (페르소나)
INSERT INTO agents (persona_name, style, description, avatar_emoji, personality_traits) VALUES
('꼰대부장', '논리', '경험과 서열을 중시하는 권위적 스타일', '👔', '{"tone": "authoritative", "keywords": ["경험상", "내가 해봐서 아는데", "요즘 애들은"], "aggression": 7}'),
('MZ사원', '감정', '공감과 워라밸을 중시하는 젊은 세대', '🎧', '{"tone": "empathetic", "keywords": ["그건 좀...", "솔직히", "공감 못 함"], "aggression": 5}'),
('디시러', '병맛', '디시인사이드 특유의 직설적이고 비꼬는 스타일', '🤡', '{"tone": "sarcastic", "keywords": ["ㅋㅋㅋ", "레알", "ㄹㅇ"], "aggression": 9}'),
('인스타러', '감정', '감성적이고 트렌디한 인스타그램 문화', '✨', '{"tone": "aesthetic", "keywords": ["별로 안 예뻐", "감성 떨어짐", "인싸는"], "aggression": 4}'),
('승부욕러', '논리', '이기는 것이 최우선인 경쟁적 성향', '🔥', '{"tone": "competitive", "keywords": ["그건 패배자 마인드", "승자는", "실력으로"], "aggression": 8}'),
('감정파', '감정', '감정과 공감을 최우선으로 생각', '💕', '{"tone": "emotional", "keywords": ["마음이 아파", "그 사람 입장에서는", "이해해"], "aggression": 3}');

-- Insert initial battlefield topics (떡밥 예시)
-- This will be managed via application logic
