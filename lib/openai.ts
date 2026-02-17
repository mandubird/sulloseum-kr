import OpenAI from 'openai'
import { ReactionType } from './damage'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// 공통 시스템 프롬프트
const SYSTEM_PROMPT = `이것은 말싸움 게임이다.
목표는 상대 멘탈을 깎는 것이다.

규칙:
- 한 문장만 출력
- 10~20자 이내
- 완곡어법 금지
- 설명 금지
- 교훈 금지
- 중립 금지
- 감정 분석 금지
- 같은 단어 2회 이상 사용 금지
- 이전 턴에서 사용된 핵심 단어 반복 금지
- 직설, 비꼼, 패러디만 허용
- 논리보다 공격적 비유 우선

출력 형식:
ATTACK: [공격자 대사]
COUNTER: [수비자 대사]`

// 6인 캐릭터별 전용 프롬프트 (성향/공격패턴/금지/예시)
const PERSONA_PROMPTS: Record<string, string> = {
  '회식강요 상무': `성향: 권위적, 위에서 내려다봄
공격패턴: 훈계, 책임론, 세대비하
금지: 밈 사용 금지, 감성적 표현 금지
예시: "요즘 것들은 책임이 없지", "20년 해본 나한테 말대꾸야"`,

  '퇴사 3번 MZ': `성향: 냉소적, 권위 거부
공격패턴: 꼰대 프레임 씌우기, 비꼬기
금지: 훈계 금지, 논리 설명 금지
예시: "그 마인드가 문제라니까", "아직도 그 소리 해"`,

  '디시 고인물': `성향: 조롱 전문, 밈 장인
공격패턴: 진지충 몰이, 비현실 지적
금지: 진지한 논리 금지, 도덕 우위 금지
예시: "ㅋㅋ 그게 말이 됨", "현실 좀 살아라"`,

  '인스타 감성러': `성향: 감성적, 자기 확신 강함
공격패턴: 도덕적 우위, 부정적 프레임
금지: 논리 팩폭 금지, 조롱 금지
예시: "그래서 행복해", "왜 그렇게 부정적이야"`,

  '현실 팩폭러': `성향: 차갑고 논리적
공격패턴: 통계 드립, 비합리 지적
금지: 감정 호소 금지, 밈 금지
예시: "숫자가 증명하는데", "객관적으로 틀렸어"`,

  '과몰입 감정파': `성향: 억울함 많음, 분노 폭발
공격패턴: 인성 공격, 과장, 피해자 코스프레
금지: 논리 금지, 침착함 금지
예시: "진짜 열받네", "그게 말이 돼"`,
}

// 행동별 톤 지시 (구체적 행동 기반)
const REACTION_TONE: Record<ReactionType, string> = {
  공격: `직설 + 조롱. 비유 1개 포함. 물음표 사용 금지.
예: "그게 네 수준이지", "딱 그 정도야"`,

  방어: `상대를 되치기. "너나 잘해"형 구조.
예: "그건 네가 못해서 그래", "네 말이 맞으면 내가 이렇겠냐"`,

  병맛: `논리 무시. 엉뚱한 비교. 밈 구조. 현실성 깨기.
예: "그럼 달도 치즈냐", "ㅋㅋ 그게 말이 됨"`,

  감정: `과장. 단어 강세. 짧고 거칠게.
예: "진짜 열받네", "그게 말이 돼"`,
}

// 전장별 톤 추가
const BATTLEFIELD_TONE: Record<string, string> = {
  work: '책임, 세대, 조직 키워드 적극 사용. 감정보다 프레임 싸움.',
  love: '자존심, 집착, 가치관 공격. 인성 문제로 몰아가기.',
  game: '실력 비하. 현실 드립.',
  marriage: '헌신, 희생 프레임. 피해자 코스프레.',
  money: '경제력 비하. 현실 직시 강요.',
}

const getPersonaPrompt = (name: string, description: string) =>
  PERSONA_PROMPTS[name] || `${name}: ${description}`

// 이전 대사에서 핵심 단어 추출 (반복 방지)
function extractKeywords(text: string): string[] {
  const common = ['그', '이', '저', '것', '거', '게', '데', '게', '까', '네', '나', '너', '그래', '이런', '저런']
  const words = text.split(/[\s,?.!]+/).filter(w => w.length >= 2 && !common.includes(w))
  return [...new Set(words)].slice(0, 5) // 최대 5개
}

// 배틀 1턴 생성 (공격 + 자동반응 동시) — 1 API 호출
export async function generateBattleTurn(params: {
  attackerName: string
  attackerDesc: string
  defenderName: string
  defenderDesc: string
  topic: string
  battlefield?: string
  reaction: ReactionType
  lastDefenderStatement: string
  previousStatements?: string[]
  turnNumber: number
  isFirstTurn: boolean
}): Promise<{ attackStatement: string; counterStatement: string }> {
  const {
    attackerName, attackerDesc, defenderName, defenderDesc,
    topic, battlefield = 'work', reaction, lastDefenderStatement,
    previousStatements = [], turnNumber, isFirstTurn,
  } = params

  // 이전 대사에서 사용된 핵심 단어 추출 (반복 방지)
  const usedKeywords = previousStatements.flatMap(s => extractKeywords(s))
  const bannedWords = [...new Set(usedKeywords)].slice(0, 8)

  const battlefieldTone = BATTLEFIELD_TONE[battlefield] || BATTLEFIELD_TONE.work

  const prompt = `주제: "${topic}"
전장 특성: ${battlefieldTone}

[공격자: ${attackerName}]
${getPersonaPrompt(attackerName, attackerDesc)}
선택 행동: ${reaction}
${REACTION_TONE[reaction]}
${!isFirstTurn ? `상대 방금 대사: "${lastDefenderStatement}"` : '배틀 시작. 첫 도발 한마디.'}

[수비자 자동반응: ${defenderName}]
${getPersonaPrompt(defenderName, defenderDesc)}
지시: 공격자 대사에 즉각 반응. 지지 않고 맞받아쳐라.

${bannedWords.length > 0 ? `⚠️ 다음 단어 사용 금지: ${bannedWords.join(', ')}` : ''}`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 1.0,
      top_p: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
      max_tokens: 100,
    })

    const raw = res.choices[0]?.message?.content?.trim() || ''
    const attackMatch = raw.match(/ATTACK:\s*(.+)/i)
    const counterMatch = raw.match(/COUNTER:\s*(.+)/i)

    return {
      attackStatement: attackMatch?.[1]?.trim() || '...할 말 없다.',
      counterStatement: counterMatch?.[1]?.trim() || '...그래서?',
    }
  } catch (err) {
    console.error('OpenAI error:', err)
    return { attackStatement: '...', counterStatement: '...' }
  }
}

// 첫 대사 생성 — 1 API 호출
export async function generateFirstStatements(params: {
  fighter1Name: string
  fighter1Desc: string
  fighter2Name: string
  fighter2Desc: string
  topic: string
  battlefield?: string
}): Promise<{ statement1: string; statement2: string }> {
  const { fighter1Name, fighter1Desc, fighter2Name, fighter2Desc, topic, battlefield = 'work' } = params

  const battlefieldTone = BATTLEFIELD_TONE[battlefield] || BATTLEFIELD_TONE.work

  const prompt = `주제: "${topic}"
전장 특성: ${battlefieldTone}

두 캐릭터가 배틀 시작. 각자 첫 도발 한마디.

[${fighter1Name}]
${getPersonaPrompt(fighter1Name, fighter1Desc)}

[${fighter2Name}]
${getPersonaPrompt(fighter2Name, fighter2Desc)}

각 1문장, 10~18자. 도발적. 상대 무시.

P1: [${fighter1Name} 대사]
P2: [${fighter2Name} 대사]`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '짧고 강한 첫 도발 대사. 각 1줄. P1: / P2: 형식.' },
        { role: 'user', content: prompt },
      ],
      temperature: 1.0,
      presence_penalty: 0.6,
      frequency_penalty: 0.7,
      max_tokens: 80,
    })

    const raw = res.choices[0]?.message?.content?.trim() || ''
    return {
      statement1: raw.match(/P1:\s*(.+)/i)?.[1]?.trim() || '덤벼봐.',
      statement2: raw.match(/P2:\s*(.+)/i)?.[1]?.trim() || '해보자고.',
    }
  } catch (err) {
    console.error('OpenAI error:', err)
    return { statement1: '덤벼봐.', statement2: '해보자고.' }
  }
}
