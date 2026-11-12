import { describe, it, expect } from 'vitest'
import { battle, createBattle, canRefactor, PLAYER_DAMAGE } from './battle'
import { bosses } from '../data/bosses'
import { floors } from '../data/floors'

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
    expect(tag).toEqual({ hpLeft: 82, hpLeftRefactor: 82, missesToLose: 7, missesToLoseRefactor: 8 })
  })

  it('boss 2: 50-70% hp left, survives ~4-5 misses', () => {
    expect(etiqueta).toEqual({ hpLeft: 58, hpLeftRefactor: 64, missesToLose: 5, missesToLoseRefactor: 6 })
  })

  it('boss 3: 25-40% hp left, loses with 3-4 misses', () => {
    expect(html).toEqual({ hpLeft: 28, hpLeftRefactor: 40, missesToLose: 3, missesToLoseRefactor: 4 })
  })

  it('all 12 bosses are mathematically defeatable with and without refactor', () => {
    expect(bosses).toHaveLength(12)
    for (const boss of bosses) {
      const noRefactor = simulate(boss, { useRefactor: false, misses: 0 })
      const withRefactor = simulate(boss, { useRefactor: true, misses: 0 })
      expect(noRefactor.phase).toBe('won')
      expect(noRefactor.playerHp).toBeGreaterThan(0)
      expect(withRefactor.phase).toBe('won')
      expect(withRefactor.playerHp).toBeGreaterThanOrEqual(noRefactor.playerHp)
      expect(missesToLose(boss, true)).toBeGreaterThanOrEqual(2)
    }
  })

  it('scales HP and rewardCoins progressively within each floor and across floors', () => {
    const floorTotals = floors.map((floor) => {
      const floorBosses = floor.bossIds.map((id) => bosses.find((b) => b.id === id))
      expect(floorBosses).toHaveLength(3)
      // Within each floor: boss 1 < boss 2 < boss 3 in both HP and rewardCoins
      expect(floorBosses[0].hp).toBeLessThan(floorBosses[1].hp)
      expect(floorBosses[1].hp).toBeLessThan(floorBosses[2].hp)
      expect(floorBosses[0].rewardCoins).toBeLessThan(floorBosses[1].rewardCoins)
      expect(floorBosses[1].rewardCoins).toBeLessThan(floorBosses[2].rewardCoins)

      return {
        hp: floorBosses.reduce((sum, b) => sum + b.hp, 0),
        coins: floorBosses.reduce((sum, b) => sum + b.rewardCoins, 0),
      }
    })

    for (let i = 1; i < floorTotals.length; i++) {
      expect(floorTotals[i].hp).toBeGreaterThan(floorTotals[i - 1].hp)
      expect(floorTotals[i].coins).toBeGreaterThan(floorTotals[i - 1].coins)
    }
  })
})
