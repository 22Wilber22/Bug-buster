import { PLAYER_MAX_HP } from './battle'

export const SAVE_KEY = 'bug-buster-save'
export const SAVE_VERSION = 2
export const PLAY_SCREENS = ['map', 'battle', 'clue', 'ending', 'defeat']
export const COFFEE_COST = 25
export const COFFEE_HEAL = 35

function freshSave() {
  return {
    version: SAVE_VERSION,
    defeatedBossIds: [],
    playerHp: PLAYER_MAX_HP,
    coins: 0,
    coffees: 0,
    inProgress: false,
    screen: null,
    bossId: null,
    battle: null,
  }
}

function isValidId(id) {
  return typeof id === 'string' && id.length > 0
}

function cleanIds(ids) {
  return [...new Set(ids.filter(isValidId))]
}

function clampHp(hp) {
  if (typeof hp !== 'number' || !Number.isFinite(hp)) return PLAYER_MAX_HP
  return Math.max(0, Math.min(PLAYER_MAX_HP, Math.round(hp)))
}

function clampCount(val) {
  if (typeof val !== 'number' || !Number.isFinite(val)) return 0
  return Math.max(0, Math.floor(val))
}

function parseBattle(raw) {
  if (!raw || typeof raw !== 'object') return null
  return raw
}

function readRaw() {
  return JSON.parse(localStorage.getItem(SAVE_KEY))
}

function persist(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save))
  } catch {
    // Private mode or full storage: keep playing, progress just won't persist.
  }
  return save
}

export function loadSave() {
  // A broken save must never block the game; salvage valid ids instead of wiping progress.
  try {
    const data = readRaw()
    if (!data || typeof data !== 'object') return freshSave()
    if (data.version === 1 && Array.isArray(data.defeatedBossIds)) {
      return {
        ...freshSave(),
        defeatedBossIds: cleanIds(data.defeatedBossIds),
      }
    }
    if (data.version !== SAVE_VERSION || !Array.isArray(data.defeatedBossIds)) return freshSave()
    const screen = PLAY_SCREENS.includes(data.screen) ? data.screen : null
    return {
      version: SAVE_VERSION,
      defeatedBossIds: cleanIds(data.defeatedBossIds),
      playerHp: clampHp(data.playerHp),
      coins: clampCount(data.coins),
      coffees: clampCount(data.coffees),
      inProgress: data.inProgress === true && Boolean(screen),
      screen,
      bossId: isValidId(data.bossId) ? data.bossId : null,
      battle: parseBattle(data.battle),
    }
  } catch {
    return freshSave()
  }
}

export function writeSave(patch) {
  const current = loadSave()
  const next = {
    ...current,
    ...patch,
    version: SAVE_VERSION,
  }
  if (patch?.defeatedBossIds) next.defeatedBossIds = cleanIds(patch.defeatedBossIds)
  if (patch?.playerHp !== undefined) next.playerHp = clampHp(patch.playerHp)
  if (patch?.coins !== undefined) next.coins = clampCount(patch.coins)
  if (patch?.coffees !== undefined) next.coffees = clampCount(patch.coffees)
  if (patch?.screen !== undefined) {
    next.screen = PLAY_SCREENS.includes(patch.screen) ? patch.screen : null
  }
  if (patch?.bossId !== undefined) next.bossId = isValidId(patch.bossId) ? patch.bossId : null
  if (patch?.battle !== undefined) next.battle = parseBattle(patch.battle)
  if (patch?.inProgress !== undefined) next.inProgress = patch.inProgress === true && Boolean(next.screen)
  return persist(next)
}

export function resetSave() {
  return persist(freshSave())
}

export function saveDefeated(bossId, extra = {}) {
  const save = loadSave()
  const reward = typeof extra.rewardCoins === 'number' ? extra.rewardCoins : 0
  const { rewardCoins: _unused, ...restExtra } = extra
  const nextCoins = save.coins + Math.max(0, reward)
  if (!isValidId(bossId) || save.defeatedBossIds.includes(bossId)) {
    return writeSave({ ...restExtra, coins: nextCoins })
  }
  return writeSave({
    ...restExtra,
    coins: nextCoins,
    defeatedBossIds: [...save.defeatedBossIds, bossId],
  })
}

export function buyCoffee() {
  const save = loadSave()
  if (save.coins < COFFEE_COST) return save
  return writeSave({
    coins: save.coins - COFFEE_COST,
    coffees: save.coffees + 1,
  })
}

export function canResume(save = loadSave()) {
  return save.inProgress === true && PLAY_SCREENS.includes(save.screen)
}

export function canContinue(save = loadSave()) {
  return save.defeatedBossIds.length > 0
}
