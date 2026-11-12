/**
 * Sistema de Economía, Mejoras Permanentes, Skins, Accesorios y Logros.
 * Almacena los metadatos extendidos en `bug-buster-progression` y sincroniza monedas/cafés
 * con `src/engine/save.js` (`bug-buster-save`) para mantener 100% de compatibilidad hacia atrás.
 */

import { PLAYER_MAX_HP, PLAYER_DAMAGE } from './battle'
import { loadSave, writeSave, COFFEE_COST, COFFEE_HEAL } from './save'

export const PROGRESSION_KEY = 'bug-buster-progression'

export const SHOP_CATALOG = [
  // Consumibles
  {
    id: 'coffee-pack',
    category: 'consumables',
    name: 'Café Caliente TechCorp',
    icon: '☕',
    price: COFFEE_COST,
    effectLabel: `+${COFFEE_HEAL} HP`,
    description: 'Café recién filtrado. Restaura energía vital en el mapa o en pleno combate.',
    repeatable: true,
  },
  {
    id: 'espresso-shot',
    category: 'consumables',
    name: 'Expreso Doble Debug',
    icon: '⚡',
    price: 40,
    effectLabel: '+50 HP inmediatos',
    description: 'Carga concentrada de cafeína que restaura +50 HP al instante.',
    repeatable: true,
    instantHeal: 50,
  },

  // Mejoras permanentes
  {
    id: 'upg-vitality',
    category: 'upgrades',
    name: 'Chasis de Titanio',
    icon: '🛡',
    price: 60,
    effectLabel: '+15 Vida Máxima',
    description: 'Refuerza tu entorno local aumentando la salud máxima base en +15 HP.',
    statBonus: { maxHp: 15, attack: 0, defense: 0, coffeeBonus: 0 },
  },
  {
    id: 'upg-compiler',
    category: 'upgrades',
    name: 'Compilador Overclock',
    icon: '⚔',
    price: 75,
    effectLabel: '+2 Ataque Debug',
    description: 'Optimiza tus parches de código sumando +2 de poder ofensivo permanente.',
    statBonus: { maxHp: 0, attack: 2, defense: 0, coffeeBonus: 0 },
  },
  {
    id: 'upg-firewall',
    category: 'upgrades',
    name: 'Firewall de Kernel',
    icon: '🔒',
    price: 70,
    effectLabel: '+1 Defensa',
    description: 'Filtra paquetes corruptos reduciendo el impacto de los ataques enemigos.',
    statBonus: { maxHp: 0, attack: 0, defense: 1, coffeeBonus: 0 },
  },
  {
    id: 'upg-thermos',
    category: 'upgrades',
    name: 'Termo Térmico Pro',
    icon: '🧪',
    price: 55,
    effectLabel: '+10 HP por Café',
    description: 'Conserva la temperatura ideal del café para potenciar su efecto curativo.',
    statBonus: { maxHp: 0, attack: 0, defense: 0, coffeeBonus: 10 },
  },

  // Skins
  {
    id: 'skin-default',
    category: 'skins',
    name: 'Debugger Clásico',
    icon: '🧑‍💻',
    price: 0,
    effectLabel: 'Skin Base',
    description: 'Sudadera cian oficial del equipo de soporte de TechCorp.',
    skinId: 'default',
  },
  {
    id: 'skin-cyber-ninja',
    category: 'skins',
    name: 'Cyber Ninja Neón',
    icon: '🥷',
    price: 50,
    effectLabel: 'Skin Cosmética',
    description: 'Atuendo furtivo magenta y cian para infiltrarse en servidores críticos.',
    skinId: 'cyber-ninja',
  },
  {
    id: 'skin-matrix',
    category: 'skins',
    name: 'Arquitecto Matrix',
    icon: '🕶',
    price: 80,
    effectLabel: 'Skin Cosmética',
    description: 'Gabardina verde fósforo inspirada en las terminales mainframe clásicas.',
    skinId: 'matrix',
  },
  {
    id: 'skin-golden',
    category: 'skins',
    name: 'Senior Full-Stack Dorado',
    icon: '👑',
    price: 120,
    effectLabel: 'Skin Legendaria',
    description: 'Armadura dorada de alto rango para quienes dominan los 4 pisos.',
    skinId: 'golden',
  },

  // Accesorios
  {
    id: 'acc-visor',
    category: 'accessories',
    name: 'Visor Holográfico',
    icon: '🥽',
    price: 35,
    effectLabel: 'Accesorio HUD',
    description: 'Lentes de realidad aumentada que resaltan bugs en la oscuridad.',
    accessoryId: 'visor',
  },
  {
    id: 'acc-blade-magenta',
    category: 'accessories',
    name: 'Hoja Láser Magenta',
    icon: '🗡',
    price: 45,
    effectLabel: 'Efecto de Espada',
    description: 'Recubre tu espada depuradora con un haz de plasma magenta.',
    accessoryId: 'blade-magenta',
  },
  {
    id: 'acc-aura-binary',
    category: 'accessories',
    name: 'Aura Binaria 01',
    icon: '✨',
    price: 65,
    effectLabel: 'Aura Decorativa',
    description: 'Anillo de partículas binarias flotando alrededor del protagonista.',
    accessoryId: 'aura-binary',
  },
]

export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first-debug',
    name: 'Primer Debug',
    description: 'Derrota a tu primer enemigo en el edificio.',
    icon: '🐛',
    category: 'combate',
    rewardCoins: 15,
  },
  {
    id: 'floor-html-clear',
    name: 'Maestro del DOM',
    description: 'Derrota a los 3 jefes del Piso HTML.',
    icon: '📄',
    category: 'progreso',
    rewardCoins: 25,
  },
  {
    id: 'floor-css-clear',
    name: 'Arquitecto del Estilo',
    description: 'Derrota a los 3 jefes del Piso CSS.',
    icon: '🎨',
    category: 'progreso',
    rewardCoins: 30,
  },
  {
    id: 'flawless-victory',
    name: 'Sin Errores',
    description: 'Completa un combate conservando el 100% de tu vida.',
    icon: '💎',
    category: 'combate',
    rewardCoins: 30,
  },
  {
    id: 'first-purchase',
    name: 'Cliente TechCorp',
    description: 'Realiza tu primera adquisición en la tienda cyberpunk.',
    icon: '🛒',
    category: 'economia',
    rewardCoins: 10,
  },
  {
    id: 'collector-cyber',
    name: 'Coleccionista Cyber',
    description: 'Desbloquea al menos 3 mejoras, skins o accesorios en la tienda.',
    icon: '🎒',
    category: 'coleccion',
    rewardCoins: 25,
  },
  {
    id: 'saver-senior',
    name: 'Ahorrador Senior',
    description: 'Acumula 100 o más monedas en tu inventario.',
    icon: '🪙',
    category: 'economia',
    rewardCoins: 20,
  },
  {
    id: 'full-stack-hero',
    name: 'Héroe Full-Stack',
    description: 'Derrota a los 12 jefes de los 4 pisos (HTML, CSS, JS y React).',
    icon: '🏆',
    category: 'progreso',
    rewardCoins: 50,
  },
]

function freshProgression() {
  return {
    ownedUpgrades: [],
    unlockedSkins: ['default'],
    equippedSkin: 'default',
    unlockedAccessories: [],
    equippedAccessory: null,
    unlockedAchievements: [],
    purchaseCount: 0,
    flawlessWins: 0,
  }
}

function cleanStringList(list, fallback = []) {
  if (!Array.isArray(list)) return [...fallback]
  return [...new Set(list.filter((item) => typeof item === 'string' && item.length > 0))]
}

export function loadProgression() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESSION_KEY))
    if (!raw || typeof raw !== 'object') return freshProgression()
    const unlockedSkins = cleanStringList(raw.unlockedSkins, ['default'])
    if (!unlockedSkins.includes('default')) unlockedSkins.unshift('default')
    const unlockedAccessories = cleanStringList(raw.unlockedAccessories)
    return {
      ownedUpgrades: cleanStringList(raw.ownedUpgrades),
      unlockedSkins,
      equippedSkin: unlockedSkins.includes(raw.equippedSkin) ? raw.equippedSkin : 'default',
      unlockedAccessories,
      equippedAccessory:
        raw.equippedAccessory && unlockedAccessories.includes(raw.equippedAccessory)
          ? raw.equippedAccessory
          : null,
      unlockedAchievements: cleanStringList(raw.unlockedAchievements),
      purchaseCount: Number.isFinite(raw.purchaseCount) ? Math.max(0, Math.floor(raw.purchaseCount)) : 0,
      flawlessWins: Number.isFinite(raw.flawlessWins) ? Math.max(0, Math.floor(raw.flawlessWins)) : 0,
    }
  } catch {
    return freshProgression()
  }
}

export function saveProgression(patch) {
  const current = loadProgression()
  const next = { ...current, ...patch }
  try {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage write errors in private mode
  }
  return next
}

export function resetProgression() {
  const fresh = freshProgression()
  try {
    localStorage.setItem(PROGRESSION_KEY, JSON.stringify(fresh))
  } catch {
    // Ignore storage write errors
  }
  return fresh
}

/**
 * Calcula estadísticas separando: base, bonificaciones permanentes y estadísticas finales.
 * Nunca duplica bonificaciones al recargar.
 */
export function calculatePlayerStats(prog = loadProgression()) {
  const base = {
    maxHp: PLAYER_MAX_HP,
    attack: PLAYER_DAMAGE,
    defense: 0,
    coffeeHeal: COFFEE_HEAL,
  }

  const bonuses = {
    maxHp: 0,
    attack: 0,
    defense: 0,
    coffeeHeal: 0,
  }

  const uniqueUpgrades = cleanStringList(prog?.ownedUpgrades)
  for (const upgId of uniqueUpgrades) {
    const item = SHOP_CATALOG.find((entry) => entry.id === upgId)
    if (item?.statBonus) {
      bonuses.maxHp += item.statBonus.maxHp || 0
      bonuses.attack += item.statBonus.attack || 0
      bonuses.defense += item.statBonus.defense || 0
      bonuses.coffeeHeal += item.statBonus.coffeeBonus || 0
    }
  }

  return {
    base,
    bonuses,
    final: {
      maxHp: base.maxHp + bonuses.maxHp,
      attack: base.attack + bonuses.attack,
      defense: base.defense + bonuses.defense,
      coffeeHeal: base.coffeeHeal + bonuses.coffeeHeal,
    },
  }
}

/**
 * Compra un producto del catálogo validando monedas y evitando duplicados o saldos negativos.
 */
export function purchaseShopItem(itemId) {
  const item = SHOP_CATALOG.find((entry) => entry.id === itemId)
  if (!item) {
    return { ok: false, reason: 'invalid_item', save: loadSave(), progression: loadProgression() }
  }

  const save = loadSave()
  const prog = loadProgression()

  // Verificar si ya fue adquirido (para ítems no repetibles)
  if (!item.repeatable) {
    const alreadyOwned =
      (item.category === 'upgrades' && prog.ownedUpgrades.includes(item.id)) ||
      (item.category === 'skins' && prog.unlockedSkins.includes(item.skinId)) ||
      (item.category === 'accessories' && prog.unlockedAccessories.includes(item.accessoryId))

    if (alreadyOwned) {
      return { ok: false, reason: 'already_owned', save, progression: prog }
    }
  }

  if (save.coins < item.price) {
    return { ok: false, reason: 'insufficient_coins', save, progression: prog }
  }

  const nextCoins = save.coins - item.price
  let nextSavePatch = { coins: nextCoins }
  let nextProgPatch = { purchaseCount: prog.purchaseCount + 1 }

  if (item.id === 'coffee-pack') {
    nextSavePatch.coffees = save.coffees + 1
  } else if (item.instantHeal) {
    nextSavePatch.playerHp = Math.min(PLAYER_MAX_HP, save.playerHp + item.instantHeal)
  } else if (item.category === 'upgrades') {
    nextProgPatch.ownedUpgrades = [...prog.ownedUpgrades, item.id]
  } else if (item.category === 'skins') {
    nextProgPatch.unlockedSkins = [...prog.unlockedSkins, item.skinId]
    nextProgPatch.equippedSkin = item.skinId
  } else if (item.category === 'accessories') {
    nextProgPatch.unlockedAccessories = [...prog.unlockedAccessories, item.accessoryId]
    nextProgPatch.equippedAccessory = item.accessoryId
  }

  const updatedSave = writeSave(nextSavePatch)
  const updatedProg = saveProgression(nextProgPatch)
  const achResult = evaluateAchievements(updatedSave, updatedProg)

  return {
    ok: true,
    item,
    save: achResult.save,
    progression: achResult.progression,
    newlyUnlockedAchievements: achResult.newlyUnlocked,
  }
}

export function equipSkin(skinId) {
  const prog = loadProgression()
  if (!prog.unlockedSkins.includes(skinId)) return prog
  return saveProgression({ equippedSkin: skinId })
}

export function equipAccessory(accessoryId) {
  const prog = loadProgression()
  if (accessoryId !== null && !prog.unlockedAccessories.includes(accessoryId)) return prog
  return saveProgression({ equippedAccessory: accessoryId })
}

/**
 * Evalúa y desbloquea logros basados en el estado real sin duplicar notificaciones ni recompensas.
 */
export function evaluateAchievements(save = loadSave(), prog = loadProgression()) {
  const unlocked = new Set(prog.unlockedAchievements)
  const newlyUnlocked = []
  let bonusCoins = 0

  const tryUnlock = (achId, condition) => {
    if (!condition || unlocked.has(achId)) return
    const ach = ACHIEVEMENTS_CATALOG.find((a) => a.id === achId)
    if (!ach) return
    unlocked.add(achId)
    newlyUnlocked.push(ach)
    bonusCoins += ach.rewardCoins || 0
  }

  const defeated = save.defeatedBossIds || []
  tryUnlock('first-debug', defeated.length >= 1)
  tryUnlock(
    'floor-html-clear',
    ['tag-fantasma', 'etiqueta-roja', 'html-corrupto'].every((id) => defeated.includes(id)),
  )
  tryUnlock(
    'floor-css-clear',
    ['selector-oscuro', 'flexbox-caotico', 'rey-responsive'].every((id) => defeated.includes(id)),
  )
  tryUnlock('flawless-victory', prog.flawlessWins >= 1)
  tryUnlock('first-purchase', prog.purchaseCount >= 1)
  const totalCollectibles =
    prog.ownedUpgrades.length +
    (prog.unlockedSkins.length - 1) +
    prog.unlockedAccessories.length
  tryUnlock('collector-cyber', totalCollectibles >= 3)
  tryUnlock('saver-senior', save.coins >= 100)
  tryUnlock('full-stack-hero', defeated.length >= 12)

  if (newlyUnlocked.length === 0) {
    return { save, progression: prog, newlyUnlocked: [] }
  }

  const updatedProg = saveProgression({
    unlockedAchievements: [...unlocked],
  })
  const updatedSave = bonusCoins > 0 ? writeSave({ coins: save.coins + bonusCoins }) : save

  return {
    save: updatedSave,
    progression: updatedProg,
    newlyUnlocked,
  }
}
