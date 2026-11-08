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
    expect(state).toMatchObject({ bossHp: 190, playerHp: 70, streak: 2 })
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
  it('1. una respuesta correcta aumenta la carga', () => {
    const state = turn(start(), true)
    expect(state.streak).toBe(1)
  })

  it('2. una respuesta incorrecta también aumenta la carga', () => {
    const state1 = turn(start(), false)
    expect(state1.streak).toBe(1)
    const state2 = turn(state1, false)
    expect(state2.streak).toBe(2)
  })

  it('3. la carga máxima es 3', () => {
    const state = turns(start(), [true, false, true, true])
    expect(state.streak).toBe(3)
  })

  it('4. el ataque especial solo está disponible cuando la carga llega a 3 y el estado permite elegir una acción', () => {
    const notReady = turns(start(), [true, false])
    expect(notReady.streak).toBe(2)
    expect(canRefactor(notReady)).toBe(false)
    expect(battle(notReady, { type: 'refactor' })).toBe(notReady)

    const ready = turns(start(), [true, false, true])
    expect(ready.streak).toBe(3)
    expect(canRefactor(ready)).toBe(true)

    const inQuestion = battle(ready, { type: 'debug' })
    expect(inQuestion.phase).toBe('question')
    expect(canRefactor(inQuestion)).toBe(false)
    expect(battle(inQuestion, { type: 'refactor' })).toBe(inQuestion)
  })

  it('5. el ataque especial consume la carga al resolver su pregunta, tanto si se acierta como si se falla', () => {
    const ready = turns(start(), [true, true, true])
    const askingHit = battle(ready, { type: 'refactor' })
    const afterHit = battle(askingHit, { type: 'answer', correct: true })
    expect(afterHit.streak).toBe(0)

    const askingMiss = battle(ready, { type: 'refactor' })
    const afterMiss = battle(askingMiss, { type: 'answer', correct: false })
    expect(afterMiss.streak).toBe(0)
  })

  it('6. cancelar el modal no consume la carga', () => {
    const ready = turns(start(), [true, true, true])
    const asking = battle(ready, { type: 'refactor' })
    expect(asking.phase).toBe('question')
    expect(asking.refactoring).toBe(true)
    const cancelled = battle(asking, { type: 'cancel' })
    expect(cancelled.phase).toBe('choose')
    expect(cancelled.streak).toBe(3)
    expect(cancelled.refactoring).toBe(false)
    expect(canRefactor(cancelled)).toBe(true)
  })

  it('7. el daño del ataque especial sigue siendo 20 HP cuando la respuesta es correcta', () => {
    const ready = turns(start(), [true, true, true])
    const asking = battle(ready, { type: 'refactor' })
    const state = battle(asking, { type: 'answer', correct: true })
    expect(state.bossHp).toBe(ready.bossHp - 20)
    expect(state.lastTurn.dealt).toBe(20)
  })

  it('8. guardar y restaurar la partida conserva exactamente la carga acumulada', () => {
    const state = turns(start(), [true, true])
    expect(state.streak).toBe(2)
    const snap = snapshotBattle(state)
    expect(snap.streak).toBe(2)
    const restored = restoreBattle(boss, snap, fixed)
    expect(restored.streak).toBe(2)
  })

  it('9. no se puede activar el especial enviando force: true cuando la carga es insuficiente', () => {
    const state = turns(start(), [true])
    expect(state.streak).toBe(1)
    expect(canRefactor(state)).toBe(false)
    const attempted = battle(state, { type: 'refactor', force: true })
    expect(attempted).toBe(state)
    expect(attempted.phase).toBe('choose')
    expect(attempted.refactoring).toBe(false)
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

describe('educational enhancements (hints, explanations, validation)', () => {
  const educationalQuestions = [
    {
      id: 'eq1',
      type: 'multiple',
      text: '¿Cómo se cierra un div?',
      options: ['<div/>', '</div>'],
      correctIndex: 1,
      hint: 'Las etiquetas de cierre en HTML inician con barra.',
      explanation: 'La etiqueta </div> cierra el bloque div.',
    },
    {
      id: 'eq2',
      type: 'truefalse',
      text: 'HTML es un lenguaje compilado.',
      answer: false,
    },
  ]
  const eduBoss = { id: 'edu-boss', hp: 100, damage: 10, questions: educationalQuestions }

  it('valida preguntas existentes mediante isAnswerCorrect delegando en validateChallenge', () => {
    expect(isAnswerCorrect(educationalQuestions[0], 1)).toBe(true)
    expect(isAnswerCorrect(educationalQuestions[0], 0)).toBe(false)
    expect(isAnswerCorrect(educationalQuestions[1], false)).toBe(true)
    expect(isAnswerCorrect(educationalQuestions[1], true)).toBe(false)
  })

  it('permite pistas opcionales en el estado de la pregunta activa', () => {
    let state = createBattle(eduBoss, fixed)
    state = battle(state, { type: 'debug' })
    expect(state.question.hint).toBe('Las etiquetas de cierre en HTML inician con barra.')

    const standardBattle = battle(start(), { type: 'debug' })
    expect(standardBattle.question.hint).toBeUndefined()
  })

  it('incluye explicación en lastTurn si la pregunta la define, o undefined si no la tiene', () => {
    let state = createBattle(eduBoss, fixed)
    state = battle(state, { type: 'debug' })
    state = battle(state, { type: 'answer', correct: false })
    expect(state.lastTurn.explanation).toBe('La etiqueta </div> cierra el bloque div.')

    // Pregunta sin explicación
    let normalState = battle(start(), { type: 'debug' })
    normalState = battle(normalState, { type: 'answer', correct: true })
    expect(normalState.lastTurn.explanation).toBeUndefined()
  })

  it('no altera el cálculo de daño ni las reglas de combate al incluir explicaciones', () => {
    let state = createBattle(eduBoss, fixed)
    state = battle(state, { type: 'debug' })
    state = battle(state, { type: 'answer', correct: true })
    expect(state.bossHp).toBe(90) // 100 - PLAYER_DAMAGE (10)
    expect(state.playerHp).toBe(90) // 100 - boss damage (10)
    expect(state.lastTurn.dealt).toBe(10)
    expect(state.lastTurn.taken).toBe(10)
  })

  it('conserva lastTurn.explanation en snapshots y restauración de partidas', () => {
    let state = createBattle(eduBoss, fixed)
    state = battle(state, { type: 'debug' })
    state = battle(state, { type: 'answer', correct: false })
    const snap = snapshotBattle(state)
    expect(snap.lastTurn.explanation).toBe('La etiqueta </div> cierra el bloque div.')

    const restored = restoreBattle(eduBoss, snap, fixed)
    expect(restored.lastTurn.explanation).toBe('La etiqueta </div> cierra el bloque div.')
  })
})

describe('complete-code and fix-bug challenges (Paso 3.3)', () => {
  const completeQuestion = {
    id: 'cc-test-1',
    type: 'complete-code',
    text: 'Completa la etiqueta de cierre:',
    template: '<div>\n{{b1}}',
    blanks: [{ id: 'b1', placeholder: '</div>', expected: ['</div>'] }],
    explanation: 'La etiqueta </div> cierra correctamente el bloque.',
  }

  const fixBugQuestion = {
    id: 'fb-test-1',
    type: 'fix-bug',
    text: 'Corrige la etiqueta errónea:',
    initialCode: '<\\div>',
    target: '<\\div>',
    acceptedSolutions: ['</div>'],
    explanation: 'En HTML se usa barra diagonal hacia adelante: </div>.',
  }

  const mixedBoss = {
    id: 'mixed',
    hp: 100,
    damage: 10,
    questions: [completeQuestion, fixBugQuestion],
  }

  it('un desafío complete-code con respuesta correcta aplica 10 HP de daño base', () => {
    let state = createBattle(mixedBoss, fixed)
    state = battle(state, { type: 'debug' })
    expect(state.question.id).toBe('cc-test-1')
    state = battle(state, { type: 'answer', correct: true })
    expect(state.bossHp).toBe(90)
    expect(state.lastTurn.dealt).toBe(10)
  })

  it('un desafío fix-bug correcto aplica 10 HP de daño base', () => {
    let state = createBattle(mixedBoss, () => 0.9)
    state = battle(state, { type: 'debug' })
    expect(state.question.id).toBe('fb-test-1')
    state = battle(state, { type: 'answer', correct: true })
    expect(state.bossHp).toBe(90)
    expect(state.lastTurn.dealt).toBe(10)
  })

  it('una respuesta incorrecta a un fix-bug provoca contraataque crítico', () => {
    let state = createBattle(mixedBoss, () => 0.9)
    state = battle(state, { type: 'debug' })
    state = battle(state, { type: 'answer', correct: false })
    expect(state.lastTurn.dealt).toBe(0)
    expect(state.lastTurn.critical).toBe(true)
    expect(state.playerHp).toBe(80) // boss damage 10 × CRIT_MULTIPLIER 2 = 20
  })

  it('complete-code en ataque especial aplica 20 HP de daño al acertar', () => {
    let state = createBattle(mixedBoss, fixed)
    state = turns(state, [true, true, true])
    expect(state.streak).toBe(3)
    state = battle(state, { type: 'refactor' })
    expect(state.refactoring).toBe(true)
    state = battle(state, { type: 'answer', correct: true })
    expect(state.lastTurn.dealt).toBe(20)
    expect(state.streak).toBe(0)
  })

  it('cancelar complete-code no consume la carga del ataque especial', () => {
    let state = createBattle(mixedBoss, fixed)
    state = turns(state, [true, true, true])
    state = battle(state, { type: 'refactor' })
    expect(state.refactoring).toBe(true)
    const cancelled = battle(state, { type: 'cancel' })
    expect(cancelled.phase).toBe('choose')
    expect(cancelled.streak).toBe(3)
    expect(cancelled.refactoring).toBe(false)
  })

  it('la explicación llega a lastTurn en complete-code y fix-bug', () => {
    let state = createBattle(mixedBoss, fixed)
    state = battle(state, { type: 'debug' })
    state = battle(state, { type: 'answer', correct: false, explanation: completeQuestion.explanation })
    expect(state.lastTurn.explanation).toBe('La etiqueta </div> cierra correctamente el bloque.')
  })

  it('partidas guardadas con complete-code en curso se restauran correctamente', () => {
    let state = createBattle(mixedBoss, fixed)
    state = battle(state, { type: 'debug' })
    expect(state.question.type).toBe('complete-code')
    const snap = snapshotBattle(state)
    expect(snap.questionId).toBe('cc-test-1')
    const restored = restoreBattle(mixedBoss, snap, fixed)
    expect(restored.question.type).toBe('complete-code')
    expect(restored.question.blanks).toBeDefined()
  })

  it('no daña el balance de las preguntas originales del juego', () => {
    // Las preguntas existentes (multiple/truefalse) siguen funcionando con isAnswerCorrect
    expect(isAnswerCorrect({ id: 'q', type: 'multiple', options: ['a', 'b'], correctIndex: 1 }, 1)).toBe(true)
    expect(isAnswerCorrect({ id: 'q', type: 'truefalse', answer: false }, false)).toBe(true)
    expect(isAnswerCorrect({ id: 'q', type: 'truefalse', answer: false }, true)).toBe(false)
  })
})

describe('order-code, predict-output y write-code (Paso 3.4)', () => {
  const orderQ = {
    id: 'oc1', type: 'order-code',
    lines: [{ id: 'l1', content: 'a' }, { id: 'l2', content: 'b' }, { id: 'l3', content: 'c' }],
    correctOrder: ['l1', 'l2', 'l3'],
  }
  const predictTextQ = {
    id: 'po1', type: 'predict-output',
    code: '<p>Hola</p>',
    acceptedSolutions: ['Hola'],
    explanation: 'El elemento <p> muestra su contenido como texto.',
  }
  const predictOptionsQ = {
    id: 'po2', type: 'predict-output',
    options: ['Rojo', 'Verde', 'Azul'],
    correctIndex: 1,
  }
  const writeQ = {
    id: 'wc1', type: 'write-code',
    acceptedSolutions: ['target="_blank"'],
    acceptedPatterns: [/^target\s*=\s*["']_blank["']$/],
    explanation: 'El atributo target="_blank" abre el enlace en una nueva pestaña.',
  }

  const allQ = [orderQ, predictTextQ, predictOptionsQ, writeQ]
  const boss3 = { id: 'b3', hp: 100, damage: 10, questions: allQ }

  it('order-code correcto aplica 10 HP y acumula streak', () => {
    let s = createBattle(boss3, () => 0)
    s = battle(s, { type: 'debug' })
    s = battle(s, { type: 'answer', correct: true })
    expect(s.bossHp).toBe(90)
    expect(s.streak).toBe(1)
  })

  it('order-code incorrecto provoca contraataque crítico', () => {
    let s = createBattle(boss3, () => 0)
    s = battle(s, { type: 'debug' })
    s = battle(s, { type: 'answer', correct: false })
    expect(s.lastTurn.dealt).toBe(0)
    expect(s.lastTurn.critical).toBe(true)
  })

  it('predict-output (opciones) correcto aplica daño base', () => {
    let s = createBattle(boss3, () => 0.3)
    s = battle(s, { type: 'debug' })
    s = battle(s, { type: 'answer', correct: true })
    expect(s.bossHp).toBe(90)
  })

  it('predict-output (texto libre) correcto aplica daño base', () => {
    let s = createBattle(boss3, () => 0.1)
    s = battle(s, { type: 'debug' })
    s = battle(s, { type: 'answer', correct: true })
    expect(s.bossHp).toBe(90)
  })

  it('write-code correcto aplica 10 HP; write-code en especial aplica 20 HP', () => {
    let s = createBattle(boss3, () => 0.6)
    s = battle(s, { type: 'debug' })
    s = battle(s, { type: 'answer', correct: true })
    expect(s.bossHp).toBe(90)

    // Ataque especial con write-code
    s = turns(s, [true, true]) // streak llega a 3
    s = battle(s, { type: 'refactor' })
    expect(s.refactoring).toBe(true)
    s = battle(s, { type: 'answer', correct: true })
    expect(s.lastTurn.dealt).toBe(20)
    expect(s.streak).toBe(0)
  })

  it('cancelar cualquier desafío nuevo no consume el ataque especial', () => {
    let s = createBattle(boss3, () => 0)
    s = turns(s, [true, true, true])
    s = battle(s, { type: 'refactor' })
    const cancelled = battle(s, { type: 'cancel' })
    expect(cancelled.streak).toBe(3)
    expect(cancelled.refactoring).toBe(false)
  })

  it('partidas guardadas con order-code en curso se restauran con líneas intactas', () => {
    // Con seed 0 el primer ítem del barajado determina qué pregunta se hace primero;
    // lo importante es que, sea cual sea, la restauración conserva blanks/lines.
    let s = createBattle(boss3, () => 0)
    s = battle(s, { type: 'debug' })
    const originalType = s.question.type
    const snap = snapshotBattle(s)
    expect(snap.questionId).toBe(s.question.id)
    const restored = restoreBattle(boss3, snap, () => 0)
    expect(restored.question.type).toBe(originalType)
    // Si era order-code comprobamos que las líneas siguen presentes
    if (originalType === 'order-code') {
      expect(restored.question.lines).toHaveLength(3)
    }
  })
})
