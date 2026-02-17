/**
 * 전체 전장 떡밥을 자극형 말투로 일괄 재작성 후
 * lib/battlefields.ts 와 supabase-topics-*.sql 에 반영합니다.
 *
 * 사용법 (프로젝트 루트에서):
 *   npx tsx scripts/rewrite-all-topics.ts
 *
 * .env.local 에 OPENAI_API_KEY 가 있어야 합니다.
 */

import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'
import { BATTLEFIELDS } from '../lib/battlefields'
import { rewriteTopicsBatch } from '../lib/rewrite-topic'

dotenv.config({ path: '.env.local' })

const BATCH_SIZE = 20

function escapeSql(s: string) {
  return s.replace(/'/g, "''")
}

function escapeJsString(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY 가 .env.local 에 없습니다.')
    process.exit(1)
  }

  const root = path.join(__dirname, '..')
  const results: Array<{ id: string; name: string; topics: string[] }> = []

  for (const bf of BATTLEFIELDS) {
    const topics = bf.topics
    const rewritten: string[] = []
    for (let i = 0; i < topics.length; i += BATCH_SIZE) {
      const batch = topics.slice(i, i + BATCH_SIZE)
      console.log(`[${bf.id}] ${i + 1}~${i + batch.length} / ${topics.length} 재작성 중...`)
      const out = await rewriteTopicsBatch(batch)
      rewritten.push(...out)
      if (batch.length !== out.length) {
        console.warn(`  경고: ${batch.length}개 요청, ${out.length}개 수신. 부족분은 원문 유지`)
        for (let j = out.length; j < batch.length; j++) rewritten.push(batch[j])
      }
    }
    results.push({ id: bf.id, name: bf.name, topics: rewritten })
  }

  // lib/battlefields.ts 생성
  const lines: string[] = [
    'export const BATTLEFIELDS = [',
    ...results.flatMap((r) => {
      const bf = BATTLEFIELDS.find((x) => x.id === r.id)!
      const topicsStr = r.topics.map((t) => `      '${escapeJsString(t)}'`).join(',\n')
      return [
        `  {`,
        `    id: '${bf.id}',`,
        `    name: '${bf.name}',`,
        `    emoji: '${bf.emoji}',`,
        `    color: '${bf.color}',`,
        `    gradient: '${bf.gradient}',`,
        `    topics: [`,
        topicsStr,
        `    ],`,
        `  },`,
      ]
    }),
    ']',
    '',
    "export type BattlefieldId = 'love' | 'work' | 'game' | 'marriage' | 'money'",
    '',
    'export const getBattlefield = (id: BattlefieldId) => {',
    '  return BATTLEFIELDS.find((bf) => bf.id === id)',
    '}',
    '',
  ]
  const battlefieldsContent = lines.join('\n')
  fs.writeFileSync(path.join(root, 'lib/battlefields.ts'), battlefieldsContent, 'utf-8')
  console.log('✅ lib/battlefields.ts 저장 완료')

  // supabase-topics-*.sql 생성
  const sqlHeader = (battlefieldId: string, title: string) => `-- =============================================
-- ${title}(${battlefieldId}) 전장 떡밥 일괄 등록 (자극형 재작성)
-- Supabase SQL Editor에서 실행하세요.
-- =============================================

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battlefield VARCHAR(50) NOT NULL,
  topic_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_topics_battlefield ON topics(battlefield);

INSERT INTO topics (battlefield, topic_text) VALUES
`

  const names: Record<string, string> = {
    love: '연애',
    work: '직장',
    game: '게임',
    marriage: '결혼',
    money: '돈',
  }
  for (const r of results) {
    const title = names[r.id] ?? r.id
    const values = r.topics.map((t) => `('${r.id}','${escapeSql(t)}')`).join(',\n')
    const sql = sqlHeader(r.id, title) + values + `;

SELECT '✅ ${title}(${r.id}) 떡밥 ' || COUNT(*) || '개 등록 완료' AS result FROM topics WHERE battlefield = '${r.id}';
`
    fs.writeFileSync(path.join(root, `supabase-topics-${r.id}.sql`), sql, 'utf-8')
    console.log(`✅ supabase-topics-${r.id}.sql 저장 완료`)
  }

  console.log('전체 완료.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
