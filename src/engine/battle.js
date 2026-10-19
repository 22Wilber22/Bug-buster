export const PLAYER_MAX_HP = 100
export const PLAYER_DAMAGE = 10
export const MAX_STREAK = 3
export const REFACTOR_MULTIPLIER = 2
export const CRIT_MULTIPLIER = 2
export const COMMENT_USES = 2

// Seeded PRNG (mulberry32) so reshuffles stay random in play but battle() stays pure and testable.
function nextRandom(seed) {
  const next = (seed + 0x6d2b79f5) >>> 0
  let t = next
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next }
}

function shuffle(items, seed) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const roll = nextRandom(seed)
    seed = roll.seed
    const j = Math.floor(roll.value * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return { items: result, seed }
}

function clampPlayerHp(hp) {
  if (typeof hp !== 'number' || !Number.isFinite(hp) || hp <= 0) return PLAYER_MAX_HP
  return Math.min(PLAYER_MAX_HP, Math.round(hp))
}

export function createBattle(boss, random = Math.random, playerHp = PLAYER_MAX_HP) {
  if (!boss?.questions?.length) {
    throw new Error(`El jefe "${boss?.id}" no tiene preguntas`)
  }
  const indexes = boss.questions.map((_, i) => i)
  const { items, seed } = shuffle(indexes, Math.floor(random() * 4294967296))
  return {
    boss,
    phase: 'choose',
    playerHp: clampPlayerHp(playerHp),
    bossHp: boss.hp,
    streak: 0,
    shielded: false,
    commentsLeft: COMMENT_USES,
    questionOrder: items,
    questionPos: 0,
    seed,
    question: null,
    refactoring: false,
    lastTurn: null,
  }
}

export function isAnswerCorrect(question, answer) {
  return question.type === 'truefalse'
    ? answer === question.answer
    : answer === question.correctIndex
}

export function canRefactor(state) {
  return state.phase === 'choose' && state.streak >= MAX_STREAK
}

export function canComment(state) {
  return state.phase === 'choose' && !state.shielded && state.commentsLeft > 0
}

function nextRound(state) {
  const last = state.questionOrder[state.questionOrder.length - 1]
  const { items, seed } = shuffle(state.questionOrder, state.seed)
  // The same question twice in a row across rounds feels like a bug to the player.
  if (items.length > 1 && items[0] === last) {
    ;[items[0], items[items.length - 1]] = [items[items.length - 1], items[0]]
  }
  return { ...state, questionOrder: items, questionPos: 0, seed }
}

function askQuestion(state, refactoring) {
  const ready = state.questionPos < state.questionOrder.length ? state : nextRound(state)
  const question = state.boss.questions[ready.questionOrder[ready.questionPos]]
  return { ...ready, phase: 'question', question, refactoring, questionPos: ready.questionPos + 1 }
}

function comment(state) {
  return { ...state, shielded: true, commentsLeft: state.commentsLeft - 1 }
}

function playerDamage(state, correct) {
  if (!correct) return 0
  return state.refactoring ? PLAYER_DAMAGE * REFACTOR_MULTIPLIER : PLAYER_DAMAGE
}

function bossDamage(state, correct) {
  if (state.shielded) return 0
  return correct ? state.boss.damage : state.boss.damage * CRIT_MULTIPLIER
}

function nextStreak(state, correct) {
  if (state.refactoring || !correct) return 0
  return Math.min(state.streak + 1, MAX_STREAK)
}

function answer(state, correct) {
  const dealt = playerDamage(state, correct)
  const bossHp = Math.max(0, state.bossHp - dealt)
  // The boss only strikes back if it survived the player's hit.
  const taken = bossHp === 0 ? 0 : bossDamage(state, correct)
  const playerHp = Math.max(0, state.playerHp - taken)
  return {
    ...state,
    bossHp,
    playerHp,
    streak: nextStreak(state, correct),
    phase: bossHp === 0 ? 'won' : playerHp === 0 ? 'lost' : 'choose',
    lastTurn: { correct, dealt, taken, critical: !correct && taken > 0, blocked: state.shielded && bossHp > 0 },
    shielded: false,
    question: null,
    refactoring: false,
  }
}

export function snapshotBattle(state) {
  if (!state) return null
  return {
    phase: state.phase,
    playerHp: state.playerHp,
    bossHp: state.bossHp,
    streak: state.streak,
    shielded: state.shielded,
    commentsLeft: state.commentsLeft,
    questionOrder: state.questionOrder,
    questionPos: state.questionPos,
    seed: state.seed,
    questionId: state.question?.id ?? null,
    refactoring: Boolean(state.refactoring),
    lastTurn: state.lastTurn,
  }
}

export function restoreBattle(boss, snapshot, random = Math.random) {
  const fresh = createBattle(boss, random, snapshot?.playerHp)
  if (!snapshot || typeof snapshot !== 'object') return fresh
  const question = snapshot.questionId
    ? boss.questions.find((item) => item.id === snapshot.questionId) ?? null
    : null
  const phase = snapshot.phase === 'question' && !question
    ? 'choose'
    : ['choose', 'question', 'won', 'lost'].includes(snapshot.phase)
      ? snapshot.phase
      : 'choose'
  return {
    ...fresh,
    phase,
    playerHp: clampPlayerHp(snapshot.playerHp),
    bossHp: typeof snapshot.bossHp === 'number' ? Math.max(0, snapshot.bossHp) : fresh.bossHp,
    streak: Number.isFinite(snapshot.streak) ? snapshot.streak : fresh.streak,
    shielded: Boolean(snapshot.shielded),
    commentsLeft: Number.isFinite(snapshot.commentsLeft) ? snapshot.commentsLeft : fresh.commentsLeft,
    questionOrder: Array.isArray(snapshot.questionOrder) ? snapshot.questionOrder : fresh.questionOrder,
    questionPos: Number.isFinite(snapshot.questionPos) ? snapshot.questionPos : fresh.questionPos,
    seed: Number.isFinite(snapshot.seed) ? snapshot.seed : fresh.seed,
    question,
    refactoring: Boolean(snapshot.refactoring),
    lastTurn: snapshot.lastTurn ?? null,
  }
}

function cancelQuestion(state) {
  return {
    ...state,
    phase: 'choose',
    question: null,
    refactoring: false,
    questionPos: Math.max(0, state.questionPos - 1),
  }
}

export function battle(state, action) {
  switch (`${state.phase}:${action?.type}`) {
    case 'choose:comment':
      return canComment(state) ? comment(state) : state
    case 'choose:debug':
      return askQuestion(state, false)
    case 'choose:refactor':
      return canRefactor(state) || action.force === true ? askQuestion(state, true) : state
    case 'question:cancel':
      return cancelQuestion(state)
    case 'question:answer':
      return answer(state, action.correct === true)
    default:
      return state
  }
}
