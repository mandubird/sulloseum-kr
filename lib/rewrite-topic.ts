import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const REWRITE_SYSTEM_PROMPT = `너는 커뮤니티 배틀용 떡밥을 자극적으로 재작성하는 AI다.

목표:
- 중립 질문을 감정 자극형 문장으로 바꿔라.
- 살짝 비꼬거나 도덕 프레임을 넣어라.
- 합의형 표현 금지.
- "~할 수도 있다", "사람마다 다르다" 같은 중립 멘트 금지.
- 길이는 12~22자 사이.
- 공격성은 30% 수준 (노골적 욕설 금지).
- 반드시 하나의 문장으로 출력.
- 설명 없이 결과만 출력.
- 논쟁을 유발하도록 살짝 상대를 긁는 뉘앙스를 넣어라.

다음 패턴 중 하나를 골라 적용하라:
1. "~하면 양심 없음?"
2. "~인데 불평 가능?"
3. "~가 더 이상한 거 아님?"
4. "~ 안 하면 문제?"
5. "~가 정상이지?"
6. "~ 이해됨?"
7. "~가 당연한 거 아님?"
8. "~면 자격 없음?"`

const BATCH_USER_PREFIX = `아래 떡밥들을 위 규칙대로 각각 한 줄씩 재작성해라. 출력은 재작성된 문장만 한 줄에 하나씩, 입력 순서대로 출력해라. 번호나 설명 금지.

떡밥 목록:
`

/**
 * 배치로 떡밥 재작성 (한 번에 최대 20개 권장)
 */
export async function rewriteTopicsBatch(topics: string[]): Promise<string[]> {
  if (topics.length === 0) return []
  const list = topics.map((t, i) => `${i + 1}. ${t}`).join('\n')
  const userContent = BATCH_USER_PREFIX + list

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.9,
    messages: [
      { role: 'system', content: REWRITE_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
    max_tokens: 800,
  })

  const raw = res.choices[0]?.message?.content?.trim() ?? ''
  const lines = raw
    .split('\n')
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)

  if (lines.length !== topics.length) {
    console.warn(`rewriteTopicsBatch: expected ${topics.length} lines, got ${lines.length}. Raw:\n${raw}`)
  }
  return lines.length >= topics.length ? lines.slice(0, topics.length) : lines
}
