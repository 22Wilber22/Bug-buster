import { describe, it, expect } from 'vitest'
import {
  battle, createBattle, snapshotBattle, restoreBattle, isAnswerCorrect, canRefactor, canComment,
  PLAYER_MAX_HP, PLAYER_DAMAGE, COMMENT_USES,
} from './battle'

const questions = [
  { id: 'q1', type: 'multiple', text: '?', options: ['a', 'b'], correctIndex: 1 },
  { id: 'q2', type: 'truefalse', text: '?', answer: true },
  { id: 'q3', type: 'truefalse', text: '?', answer: false },
]
const boss = { id: 'test', hp: 200, damage: 10, questions }
const fixed = () => 0.5

const start = (overrides = {}, random = fixed) => createBattle({ ...boss, ...overrides }, random)
const turn = (state, correct, type = 'debug') =>
  battle(battle(state, { type }), { type: 'answer', correct })
const turns = (state, answers) => answers.reduce((s, correct) => turn(s, correct), state)

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze)
    Object.freeze(value)
  }
  return value
}

describe('createBattle', () => {
  it('starts every fight with full player hp and fresh counters', () => {
    expect(start()).toMatchObject({
      phase: 'choose', playerHp: PLAYER_MAX_HP, bossHp: 200, streak: 0,
      shielded: false, commentsLeft: COMMENT_USES, question: null,
    })
  })

  it('throws a clear error for a boss without questions', () => {
    expect(() => createBattle({ ...boss, questions: [] })).toThrow('no tiene preguntas')
    expect(() => createBattle({ id: 'x' })).toThrow('no tiene preguntas')
  })

  it('can start a fight with leftover player hp from the run', () => {
    expect(createBattle(boss, fixed, 64).playerHp).toBe(64)
    expect(createBattle(boss, fixed, 0).playerHp).toBe(PLAYER_MAX_HP)
  })
})

describe('battle snapshots', () => {
  it('round-trips mid-fight state without the live boss object', () => {
    const asking = battle(start(), { type: 'debug' })
    const snap = snapshotBattle(asking)
    expect(snap.questionId).toBe(asking.question.id)
    expect(snap.boss).toBeUndefined()
    const restored = restoreBattle(boss, snap, fixed)
    expect(restored).toMatchObject({
      phase: 'question',
      playerHp: asking.playerHp,
      bossHp: asking.bossHp,
      question: asking.question,
    })
  })
})

describe('turn resolution', () => {
  it('correct answer: player hits, then boss hits normally', () => {
    const state = turn(start(), true)
    expect(state).toMatchObject({ phase: 'choose', bossHp: 190, playerHp: 90, streak: 1, question: null })
    expect(state.lastTurn).toEqual({ correct: true, dealt: 10, taken: 10, critical: false, blocked: false })
  })

  it('wrong answer: no damage to boss, boss crits for 2x', () => {
    const state = turn(turn(start(), true), false)
    expect(state).toMatchObject({ bossHp: 190, playerHp: 70, streak: 0 })
    expect(state.lastTurn.critical).toBe(true)
  })

  it('only correct === true counts as correct', () => {
    for (const correct of ['true', 'false', 1, {}, undefined]) {
      const state = battle(battle(start(), { type: 'debug' }), { type: 'answer', correct })
      expect(state.bossHp).toBe(200)
    }
  })

  it('boss at 0 means won with no counterattack', () => {
    const state = turn(start({ hp: PLAYER_DAMAGE }), true)
    expect(state).toMatchObject({ phase: 'won', bossHp: 0, playerHp: PLAYER_MAX_HP })
  })

  it('player at 0 means lost', () => {
    const state = turn(start({ damage: 50 }), false)
    expect(state).toMatchObject({ phase: 'lost', playerHp: 0 })
  })

  it('player and boss never both reach 0', () => {
    const state = turn(start({ hp: PLAYER_DAMAGE, damage: PLAYER_MAX_HP }), true)
    expect(state).toMatchObject({ phase: 'won', playerHp: PLAYER_MAX_HP })
  })
})

describe('comment (shield)', () => {
  it('does not end the turn and does not touch streak', () => {
    const before = turn(start(), true)
    const state = battle(before, { type: 'comment' })
    expect(state).toMatchObject({ phase: 'choose', shielded: true, streak: 1, commentsLeft: 1 })
  })

  it('blocks the boss hit completely, even a crit, then expires', () => {
    let state = turn(battle(start(), { type: 'comment' }), false)
    expect(state).toMatchObject({ playerHp: PLAYER_MAX_HP, shielded: false })
    expect(state.lastTurn).toMatchObject({ taken: 0, critical: false, blocked: true })
    state = turn(state, true)
    expect(state.playerHp).toBe(PLAYER_MAX_HP - 10)
  })

  it('max once per turn and 2 uses per fight', () => {
    let state = battle(start(), { type: 'comment' })
    expect(battle(state, { type: 'comment' })).toBe(state)
    state = battle(turn(state, true), { type: 'comment' })
    state = turn(state, true)
    expect(state.commentsLeft).toBe(0)
    expect(canComment(state)).toBe(false)
    expect(battle(state, { type: 'comment' })).toBe(state)
  })

  it('a use is spent even if the boss dies that turn', () => {
    const state = turn(battle(start({ hp: PLAYER_DAMAGE }), { type: 'comment' }), true)
    expect(state).toMatchObject({ phase: 'won', commentsLeft: 1, shielded: false })
  })
})

describe('streak and refactor', () => {
  it('streak caps at 3 and resets on a wrong answer', () => {
    let state = turns(start(), [true, true, true, true])
    expect(state.streak).toBe(3)
    expect(turn(state, false).streak).toBe(0)
  })

  it('refactor is blocked below streak 3', () => {
    const state = turns(start(), [true, true])
    expect(canRefactor(state)).toBe(false)
    expect(battle(state, { type: 'refactor' })).toBe(state)
  })

  it('refactor asks a question; correct deals 2x and resets streak', () => {
    const ready = turns(start(), [true, true, true])
    const asking = battle(ready, { type: 'refactor' })
    expect(asking).toMatchObject({ phase: 'question', refactoring: true })
    expect(asking.question).toBeTruthy()
    const state = battle(asking, { type: 'answer', correct: true })
    expect(state).toMatchObject({ bossHp: ready.bossHp - PLAYER_DAMAGE * 2, streak: 0, refactoring: false })
  })

  it('wrong refactor answer: boss crits and streak resets', () => {
    const ready = turns(start(), [true, true, true])
    const state = turn(ready, false, 'refactor')
    expect(state).toMatchObject({ bossHp: ready.bossHp, playerHp: ready.playerHp - 20, streak: 0 })
  })
})

describe('questions', () => {
  const askedIds = (state, count) => {
    const ids = []
    for (let i = 0; i < count; i++) {
      state = battle(state, { type: 'debug' })
      ids.push(state.question.id)
      state = battle(state, { type: 'answer', correct: false })
      state = { ...state, playerHp: PLAYER_MAX_HP }
    }
    return ids
  }

  it('no repeats within a round and no back-to-back repeat across rounds', () => {
    for (let i = 0; i < 50; i++) {
      const ids = askedIds(start({}, () => i / 50), 12)
      for (let round = 0; round < 4; round++) {
        expect(new Set(ids.slice(round * 3, round * 3 + 3)).size).toBe(3)
      }
      ids.slice(1).forEach((id, j) => expect(id).not.toBe(ids[j]))
    }
  })

  it('is deterministic for the same random source', () => {
    expect(askedIds(start({}, () => 0.3), 9)).toEqual(askedIds(start({}, () => 0.3), 9))
  })

  it('works with a single-question boss', () => {
    expect(askedIds(start({ questions: [questions[0]] }), 3)).toEqual(['q1', 'q1', 'q1'])
  })

  it('checks answers for both question types', () => {
    expect(isAnswerCorrect(questions[0], 1)).toBe(true)
    expect(isAnswerCorrect(questions[0], 0)).toBe(false)
    expect(isAnswerCorrect(questions[1], true)).toBe(true)
    expect(isAnswerCorrect(questions[1], 'true')).toBe(false)
  })

  it('can cancel an open question to switch to comment without losing the question', () => {
    const asking = battle(start(), { type: 'debug' })
    const firstId = asking.question.id
    const cancelled = battle(asking, { type: 'cancel' })
    expect(cancelled).toMatchObject({ phase: 'choose', question: null, refactoring: false })
    const shielded = battle(cancelled, { type: 'comment' })
    expect(shielded.shielded).toBe(true)
    const askingAgain = battle(shielded, { type: 'debug' })
    expect(askingAgain.question.id).toBe(firstId)
  })
})

describe('invalid input and purity', () => {
  it('ignores null, undefined, unknown and out-of-phase actions', () => {
    const choose = start()
    for (const action of [null, undefined, {}, { type: 'fly' }, { type: 'answer', correct: true }]) {
      expect(battle(choose, action)).toBe(choose)
    }
    const question = battle(choose, { type: 'debug' })
    for (const type of ['debug', 'refactor', 'comment']) {
      expect(battle(question, { type })).toBe(question)
    }
    const won = turn(start({ hp: 1 }), true)
    for (const type of ['debug', 'refactor', 'comment', 'answer']) {
      expect(battle(won, { type, correct: true })).toBe(won)
    }
  })

  it('never mutates state across a full fight', () => {
    let state = deepFreeze(start({ hp: 50 }))
    const actions = [
      { type: 'comment' }, { type: 'debug' }, { type: 'answer', correct: false },
      ...Array(3).fill([{ type: 'debug' }, { type: 'answer', correct: true }]).flat(),
      { type: 'refactor' }, { type: 'answer', correct: true },
    ]
    for (const action of actions) state = deepFreeze(battle(state, action))
    expect(state.phase).toBe('won')
  })
})
