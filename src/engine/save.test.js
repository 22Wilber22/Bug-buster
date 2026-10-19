import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PLAYER_MAX_HP } from './battle'
import {
  loadSave, writeSave, resetSave, saveDefeated, buyCoffee, canResume, canContinue, SAVE_KEY, COFFEE_COST,
} from './save'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

const fresh = {
  version: 2,
  defeatedBossIds: [],
  playerHp: PLAYER_MAX_HP,
  coins: 0,
  coffees: 0,
  inProgress: false,
  screen: null,
  bossId: null,
  battle: null,
}
const stored = () => JSON.parse(localStorage.getItem(SAVE_KEY))

describe('save', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()))

  it('returns a fresh save when nothing is stored', () => {
    expect(loadSave()).toEqual(fresh)
  })

  it('saves defeated bosses without duplicates', () => {
    saveDefeated('tag-fantasma')
    saveDefeated('tag-fantasma')
    saveDefeated('etiqueta-roja')
    expect(loadSave().defeatedBossIds).toEqual(['tag-fantasma', 'etiqueta-roja'])
  })

  it.each([undefined, null, '', 42, {}])('ignores invalid id %s without touching progress', (id) => {
    saveDefeated('tag-fantasma')
    expect(saveDefeated(id).defeatedBossIds).toEqual(['tag-fantasma'])
    expect(stored().defeatedBossIds).toEqual(['tag-fantasma'])
  })

  it('dedupes and drops non-string ids instead of wiping progress', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, defeatedBossIds: ['a', 'a', null, 3, '', 'b'] }))
    expect(loadSave().defeatedBossIds).toEqual(['a', 'b'])
  })

  it('migrates a v1 save without inventing a mid-run session', () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, defeatedBossIds: ['tag-fantasma'] }))
    expect(loadSave()).toMatchObject({
      version: 2,
      defeatedBossIds: ['tag-fantasma'],
      inProgress: false,
      playerHp: PLAYER_MAX_HP,
      screen: null,
    })
    expect(canContinue()).toBe(true)
    expect(canResume()).toBe(false)
  })

  it.each([
    ['invalid JSON', '{not json'],
    ['wrong version', JSON.stringify({ version: 3, defeatedBossIds: ['a'] })],
    ['missing list', JSON.stringify({ version: 2 })],
    ['list is not an array', JSON.stringify({ version: 2, defeatedBossIds: 'a' })],
    ['null', 'null'],
  ])('falls back to fresh on %s', (_, raw) => {
    localStorage.setItem(SAVE_KEY, raw)
    expect(loadSave()).toEqual(fresh)
  })

  it('falls back to fresh when storage throws', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } })
    expect(loadSave()).toEqual(fresh)
    expect(saveDefeated('tag-fantasma').defeatedBossIds).toEqual(['tag-fantasma'])
  })

  it('persists hp and an in-progress session for resume', () => {
    const battle = { phase: 'choose', playerHp: 64, bossHp: 20 }
    writeSave({
      inProgress: true,
      screen: 'battle',
      bossId: 'tag-fantasma',
      playerHp: 64,
      battle,
    })
    expect(loadSave()).toMatchObject({
      inProgress: true,
      screen: 'battle',
      bossId: 'tag-fantasma',
      playerHp: 64,
      battle,
    })
    expect(canResume()).toBe(true)
  })

  it('does not mark resume if there is no play screen', () => {
    writeSave({ inProgress: true, screen: 'menu' })
    expect(canResume()).toBe(false)
    expect(loadSave().inProgress).toBe(false)
  })

  it('awards coins on boss defeat and allows buying coffee', () => {
    saveDefeated('tag-fantasma', { rewardCoins: 30 })
    expect(loadSave().coins).toBe(30)
    const afterBuy = buyCoffee()
    expect(afterBuy.coins).toBe(30 - COFFEE_COST)
    expect(afterBuy.coffees).toBe(1)
    expect(buyCoffee().coffees).toBe(1)
  })

  it('new game wipes progress, hp and the session', () => {
    writeSave({
      defeatedBossIds: ['tag-fantasma'],
      inProgress: true,
      screen: 'map',
      playerHp: 40,
      coins: 50,
      coffees: 2,
      bossId: 'etiqueta-roja',
      battle: { phase: 'choose' },
    })
    expect(resetSave()).toEqual(fresh)
    expect(loadSave()).toEqual(fresh)
    expect(canContinue()).toBe(false)
    expect(canResume()).toBe(false)
  })
})
