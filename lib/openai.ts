import OpenAI from 'openai'
import { ReactionType } from './damage'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// 공통 시스템 프롬프트
const SYSTEM_PROMPT = `이 배틀은 게임이다.
목표는 상대의 멘탈을 깎는 것이다.

캐릭터 몰입 (필수): 주제가 무엇이든 지정된 캐릭터의 말투·가치관·페르소나를 절대 바꾸지 마라. 그 캐릭터로만 대사해라. 캐릭터 이탈 금지.

규칙:
- 한 문장만 출력
- 설명하지 마라
- 교훈 금지
- 중립 금지
- 상대를 직접적으로 겨냥하라
- 밈처럼 짧고 강하게
- 논리 설명 대신 공격적 비유 사용
- 말 끝을 흐리지 마라

출력 형식 (반드시):
ATTACK: [공격자 대사]
COUNTER: [수비자 대사]`

// 6인 캐릭터별 전용 프롬프트
const PERSONA_PROMPTS: Record<string, string> = {
  '회식강요 상무':
    '당신은 회사 20년차 상무다. 권위적이고 꼰대적이다. 요즘 세대를 이해 못한다. ' +
    '말투는 단정적이며 위에서 내려다본다. 상대를 훈계하듯 공격하라. ' +
    '"요즘 것들" 프레임을 자주 사용하라. 폭발 키워드: 책임, 조직, 예의, 근성',

  '퇴사 3번 MZ':
    '당신은 회사를 3번 퇴사한 MZ다. 냉소적이고 자기중심적이다. ' +
    '권위에 거부감이 강하다. 말투는 짧고 비꼬는 식. 상대를 꼰대로 몰아가라. ' +
    '폭발 키워드: 워라밸, 가스라이팅, 시대착오',

  '디시 고인물':
    '당신은 디시인사이드 5년 고인물이다. 말투는 조롱+ㅋㅋ+밈. ' +
    '상대를 진지충으로 몰아가라. 논리보다 비꼬기가 우선이다. ' +
    '폭발 키워드: 현실, 망상, 자아도취',

  '인스타 감성러':
    '당신은 인스타 감성러다. 자기 확신이 강하고 감성적이다. ' +
    '도덕적 우위를 점하려 한다. 상대를 부정적인 사람으로 몰아라. ' +
    '폭발 키워드: 에너지, 사랑, 긍정',

  '현실 팩폭러':
    '당신은 숫자와 통계를 중시하는 팩폭러다. ' +
    '감정을 무시하고 논리로 누른다. 상대를 비합리적으로 몰아라. ' +
    '짧고 차갑게 말하라. 폭발 키워드: 통계, 객관적, 데이터',

  '과몰입 감정파':
    '당신은 과몰입 감정파다. 억울함과 분노가 많다. ' +
    '과장과 감정 폭발을 사용한다. 상대를 인성 문제로 몰아라. ' +
    '폭발 키워드: 열받네, 말이 돼, 인성',
}

// 행동별 톤 지시
const REACTION_TONE: Record<ReactionType, string> = {
  공격: '상대의 가장 약한 부분을 집요하게 파고들어라. 논리보다 기세로 압박.',
  방어: '침착하게 상대 논리를 정면으로 되받아쳐라. 냉소적이고 여유 있게.',
  병맛: '논리 완전 무시. 엉뚱한 비유나 황당한 과장으로 상대를 당황시켜라.',
  감정: '억울함, 분노, 과몰입 느낌. 감정적으로 폭발하되 공감 호소.',
}

const getPersonaPrompt = (name: string, description: string) =>
  PERSONA_PROMPTS[name] || `${name}: ${description}`

// 배틀 1턴 생성 (공격 + 자동반응 동시) — 1 API 호출
export async function generateBattleTurn(params: {
  attackerName: string
  attackerDesc: string
  defenderName: string
  defenderDesc: string
  topic: string
  reaction: ReactionType
  lastDefenderStatement: string
  turnNumber: number
  isFirstTurn: boolean
}): Promise<{ attackStatement: string; counterStatement: string }> {
  const {
    attackerName, attackerDesc, defenderName, defenderDesc,
    topic, reaction, lastDefenderStatement, isFirstTurn,
  } = params

  const prompt = `주제: "${topic}"
(이 주제에 대해서도 반드시 아래 캐릭터 그대로 유지. 말투·페르소나 이탈 금지.)

[공격자: ${attackerName}]
${getPersonaPrompt(attackerName, attackerDesc)}
선택 행동: ${reaction}
행동 지시: ${REACTION_TONE[reaction]}
${!isFirstTurn ? `상대 방금 대사: "${lastDefenderStatement}"` : '배틀 시작. 첫 도발 한마디.'}

[수비자 자동반응: ${defenderName}]
${getPersonaPrompt(defenderName, defenderDesc)}
지시: 공격자 대사에 즉각 반응. 지지 않고 맞받아쳐라. 캐릭터 유지.`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.95,
      top_p: 0.9,
      max_tokens: 120,
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
}): Promise<{ statement1: string; statement2: string }> {
  const { fighter1Name, fighter1Desc, fighter2Name, fighter2Desc, topic } = params

  const prompt = `주제: "${topic}"
(주제와 관계없이 아래 캐릭터 말투·페르소나 그대로만 첫 도발.)

두 캐릭터가 배틀 시작. 각자 첫 도발 한마디.

[${fighter1Name}]
${getPersonaPrompt(fighter1Name, fighter1Desc)}

[${fighter2Name}]
${getPersonaPrompt(fighter2Name, fighter2Desc)}

각 1문장, 15자 이내. 도발적. 상대 은근히 무시.

P1: [${fighter1Name} 대사]
P2: [${fighter2Name} 대사]`

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '짧고 강한 첫 도발 대사. 각 1줄. P1: / P2: 형식.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.95,
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
