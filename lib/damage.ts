export type ReactionType = '공격' | '방어' | '병맛' | '감정'

export interface DamageResult {
  damage: number
  isCritical: boolean
  newHp1: number
  newHp2: number
  newIsDefending1: boolean
  newIsDefending2: boolean
}

export function calculateDamage(
  attackerSide: 1 | 2,
  reaction: ReactionType,
  currentHp1: number,
  currentHp2: number,
  isDefending1: boolean,
  isDefending2: boolean,
): DamageResult {
  let baseDamage = 0
  let isCritical = false
  let newIsDefending1 = false
  let newIsDefending2 = false

  // 배틀 단축: 데미지 추가 상향 (대화 더 짧게)
  switch (reaction) {
    case '공격':
      isCritical = Math.random() < 0.2
      baseDamage = isCritical ? 32 : 22
      break
    case '방어':
      baseDamage = 0
      if (attackerSide === 1) newIsDefending1 = true
      else newIsDefending2 = true
      break
    case '병맛':
      baseDamage = 4 + Math.floor(Math.random() * 18) // 4~21
      break
    case '감정':
      baseDamage = 18
      break
  }

  // 상대가 방어 중이면 데미지 50% 감소
  const defenderIsDefending = attackerSide === 1 ? isDefending2 : isDefending1
  if (defenderIsDefending && reaction !== '방어') {
    baseDamage = Math.floor(baseDamage * 0.5)
  }

  let newHp1 = currentHp1
  let newHp2 = currentHp2
  if (attackerSide === 1) newHp2 = Math.max(0, currentHp2 - baseDamage)
  else newHp1 = Math.max(0, currentHp1 - baseDamage)

  return { damage: baseDamage, isCritical, newHp1, newHp2, newIsDefending1, newIsDefending2 }
}

// 랜덤 자동 행동 (AI 턴)
export function getRandomReaction(): ReactionType {
  const options: ReactionType[] = ['공격', '공격', '병맛', '감정'] // 공격 확률 높게
  return options[Math.floor(Math.random() * options.length)]
}
