import { describe, it, expect } from 'vitest'
import { battle, createBattle, canRefactor, PLAYER_DAMAGE } from './battle'
import { bosses } from '../data/bosses'

// Misses go first so the streak can still build afterwards: the most forgiving order for Refactor.
function simulate(boss, { useRefactor, misses }) {
  let state = createBattle(boss, () => 0.5)
  let missesLeft = misses
  while (state.phase === 'choose') {
    const refactor = useRefactor && canRefactor(state) && state.bossHp > PLAYER_DAMAGE
    state = battle(state, { type: refactor ? 'refactor' : 'debug' })
    state = battle(state, { type: 'answer', correct: missesLeft-- <= 0 })
  }
  return state
}

function missesToLose(boss, useRefactor) {
  let misses = 0
  while (simulate(boss, { useRefactor, misses }).phase !== 'lost') misses++
  return misses
}

function report(boss) {
  return {
    hpLeft: simulate(boss, { useRefactor: false, misses: 0 }).playerHp,
    hpLeftRefactor: simulate(boss, { useRefactor: true, misses: 0 }).playerHp,
    missesToLose: missesToLose(boss, false),
    missesToLoseRefactor: missesToLose(boss, true),
  }
}

describe('balance (player 100 hp, no shield)', () => {
  const [tag, etiqueta, html] = bosses.map(report)

  it('boss 1: >=70% hp left, survives ~6 misses', () => {
    expect(tag).toEqual({ hpLeft: 82, hpLeftRefactor: 82, missesToLose: 7, missesToLoseRefactor: 7 })
  })

  it('boss 2: 50-70% hp left, survives ~4-5 misses', () => {
    expect(etiqueta).toEqual({ hpLeft: 58, hpLeftRefactor: 64, missesToLose: 5, missesToLoseRefactor: 6 })
  })

  it('boss 3: 25-40% hp left, loses with 3-4 misses', () => {
    expect(html).toEqual({ hpLeft: 28, hpLeftRefactor: 40, missesToLose: 3, missesToLoseRefactor: 4 })
  })
})
