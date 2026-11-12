import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PLAYER_MAX_HP, PLAYER_DAMAGE } from './battle'
import { loadSave, writeSave, resetSave, COFFEE_COST, COFFEE_HEAL } from './save'
import {
  PROGRESSION_KEY,
  SHOP_CATALOG,
  ACHIEVEMENTS_CATALOG,
  loadProgression,
  saveProgression,
  resetProgression,
  calculatePlayerStats,
  purchaseShopItem,
  equipSkin,
  equipAccessory,
  evaluateAchievements,
} from './progression'
import CoffeeShop from '../components/CoffeeShop'
import ItemCard from '../components/ItemCard'
import TrophyRoom from '../components/TrophyRoom'
import { bosses } from '../data/bosses'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

describe('progression & economy engine', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage())
    resetSave()
    resetProgression()
  })

  describe('1. Compra de consumibles, mejoras permanentes, skins y accesorios', () => {
    it('descuenta monedas exactamente una vez al comprar consumibles, mejoras, skins y accesorios', () => {
      // Pre-desbloqueamos logros económicos para medir el descuento exacto de cada ítem
      saveProgression({
        unlockedAchievements: ['first-purchase', 'collector-cyber', 'saver-senior'],
      })
      writeSave({ coins: 500, coffees: 0, playerHp: 60 })

      // 1) Consumible: Café Caliente TechCorp (25 monedas)
      const resCoffee = purchaseShopItem('coffee-pack')
      expect(resCoffee.ok).toBe(true)
      expect(resCoffee.save.coins).toBe(500 - COFFEE_COST)
      expect(resCoffee.save.coffees).toBe(1)

      // 2) Consumible de curación inmediata: Expreso Doble Debug (40 monedas, +50 HP capped a 100)
      const resEspresso = purchaseShopItem('espresso-shot')
      expect(resEspresso.ok).toBe(true)
      expect(resEspresso.save.coins).toBe(500 - COFFEE_COST - 40)
      expect(resEspresso.save.playerHp).toBe(100)

      // 3) Mejora permanente: Chasis de Titanio (60 monedas)
      const resUpgrade = purchaseShopItem('upg-vitality')
      expect(resUpgrade.ok).toBe(true)
      expect(resUpgrade.save.coins).toBe(500 - COFFEE_COST - 40 - 60)
      expect(resUpgrade.progression.ownedUpgrades).toEqual(['upg-vitality'])

      // 4) Skin: Cyber Ninja Neón (50 monedas)
      const resSkin = purchaseShopItem('skin-cyber-ninja')
      expect(resSkin.ok).toBe(true)
      expect(resSkin.save.coins).toBe(500 - COFFEE_COST - 40 - 60 - 50)
      expect(resSkin.progression.unlockedSkins).toContain('cyber-ninja')
      expect(resSkin.progression.equippedSkin).toBe('cyber-ninja')

      // 5) Accesorio: Visor Holográfico (35 monedas)
      const resAcc = purchaseShopItem('acc-visor')
      expect(resAcc.ok).toBe(true)
      expect(resAcc.save.coins).toBe(500 - COFFEE_COST - 40 - 60 - 50 - 35)
      expect(resAcc.progression.unlockedAccessories).toContain('visor')
      expect(resAcc.progression.equippedAccessory).toBe('visor')
      expect(resAcc.progression.purchaseCount).toBe(5)
    })
  })

  describe('2. Rechazo por monedas insuficientes o ítems únicos duplicados', () => {
    it('rechaza compras cuando las monedas son insuficientes y nunca permite saldos negativos', () => {
      writeSave({ coins: 20, coffees: 0 })

      const resCoffee = purchaseShopItem('coffee-pack')
      expect(resCoffee.ok).toBe(false)
      expect(resCoffee.reason).toBe('insufficient_coins')
      expect(loadSave().coins).toBe(20)
      expect(loadSave().coffees).toBe(0)

      const resUpgrade = purchaseShopItem('upg-compiler')
      expect(resUpgrade.ok).toBe(false)
      expect(resUpgrade.reason).toBe('insufficient_coins')
      expect(loadSave().coins).toBe(20)
      expect(loadProgression().ownedUpgrades).toEqual([])
    })

    it('impide comprar una mejora, skin o accesorio único más de una vez (sin duplicados)', () => {
      saveProgression({
        unlockedAchievements: ['first-purchase', 'collector-cyber', 'saver-senior'],
      })
      writeSave({ coins: 300 })

      // Primera compra de mejora: exitosa
      const firstUpg = purchaseShopItem('upg-vitality')
      expect(firstUpg.ok).toBe(true)
      const coinsAfterFirst = firstUpg.save.coins

      // Segunda compra de la misma mejora: rechazada sin descontar monedas
      const duplicateUpg = purchaseShopItem('upg-vitality')
      expect(duplicateUpg.ok).toBe(false)
      expect(duplicateUpg.reason).toBe('already_owned')
      expect(loadSave().coins).toBe(coinsAfterFirst)
      expect(loadProgression().ownedUpgrades).toEqual(['upg-vitality'])

      // Primera compra de skin: exitosa
      const firstSkin = purchaseShopItem('skin-matrix')
      expect(firstSkin.ok).toBe(true)
      const coinsAfterSkin = firstSkin.save.coins

      // Segunda compra de la misma skin: rechazada
      const duplicateSkin = purchaseShopItem('skin-matrix')
      expect(duplicateSkin.ok).toBe(false)
      expect(duplicateSkin.reason).toBe('already_owned')
      expect(loadSave().coins).toBe(coinsAfterSkin)
      expect(loadProgression().unlockedSkins.filter((s) => s === 'matrix')).toHaveLength(1)

      // Primera compra de accesorio: exitosa
      const firstAcc = purchaseShopItem('acc-blade-magenta')
      expect(firstAcc.ok).toBe(true)
      const coinsAfterAcc = firstAcc.save.coins

      // Segunda compra del mismo accesorio: rechazada
      const duplicateAcc = purchaseShopItem('acc-blade-magenta')
      expect(duplicateAcc.ok).toBe(false)
      expect(duplicateAcc.reason).toBe('already_owned')
      expect(loadSave().coins).toBe(coinsAfterAcc)
      expect(
        loadProgression().unlockedAccessories.filter((a) => a === 'blade-magenta'),
      ).toHaveLength(1)
    })

    it('rechaza ítems inexistentes con reason invalid_item', () => {
      writeSave({ coins: 100 })
      const res = purchaseShopItem('item-fantasma-inexistente')
      expect(res.ok).toBe(false)
      expect(res.reason).toBe('invalid_item')
      expect(loadSave().coins).toBe(100)
    })
  })

  describe('3. Cálculo de estadísticas (calculatePlayerStats) sin duplicación al recargar', () => {
    it('separa estadísticas base, bonificaciones permanentes y estadísticas finales', () => {
      const initialStats = calculatePlayerStats()
      expect(initialStats).toEqual({
        base: {
          maxHp: PLAYER_MAX_HP,
          attack: PLAYER_DAMAGE,
          defense: 0,
          coffeeHeal: COFFEE_HEAL,
        },
        bonuses: {
          maxHp: 0,
          attack: 0,
          defense: 0,
          coffeeHeal: 0,
        },
        final: {
          maxHp: PLAYER_MAX_HP,
          attack: PLAYER_DAMAGE,
          defense: 0,
          coffeeHeal: COFFEE_HEAL,
        },
      })

      writeSave({ coins: 400 })
      purchaseShopItem('upg-vitality') // +15 maxHp
      purchaseShopItem('upg-compiler') // +2 attack
      purchaseShopItem('upg-firewall') // +1 defense
      purchaseShopItem('upg-thermos') // +10 coffeeHeal

      const upgradedStats = calculatePlayerStats()
      expect(upgradedStats.base).toEqual({
        maxHp: PLAYER_MAX_HP,
        attack: PLAYER_DAMAGE,
        defense: 0,
        coffeeHeal: COFFEE_HEAL,
      })
      expect(upgradedStats.bonuses).toEqual({
        maxHp: 15,
        attack: 2,
        defense: 1,
        coffeeHeal: 10,
      })
      expect(upgradedStats.final).toEqual({
        maxHp: PLAYER_MAX_HP + 15,
        attack: PLAYER_DAMAGE + 2,
        defense: 1,
        coffeeHeal: COFFEE_HEAL + 10,
      })
    })

    it('no duplica bonificaciones al recargar la partida o si localStorage contiene IDs repetidos', () => {
      localStorage.setItem(
        PROGRESSION_KEY,
        JSON.stringify({
          ownedUpgrades: ['upg-vitality', 'upg-vitality', 'upg-compiler', 'upg-compiler'],
          unlockedSkins: ['default'],
          equippedSkin: 'default',
        }),
      )

      const reloadedFirst = loadProgression()
      const reloadedSecond = loadProgression()
      expect(reloadedFirst.ownedUpgrades).toEqual(['upg-vitality', 'upg-compiler'])

      const stats1 = calculatePlayerStats(reloadedFirst)
      const stats2 = calculatePlayerStats(reloadedSecond)
      expect(stats1).toEqual(stats2)
      expect(stats1.bonuses.maxHp).toBe(15)
      expect(stats1.bonuses.attack).toBe(2)
      expect(stats1.final.maxHp).toBe(PLAYER_MAX_HP + 15)
      expect(stats1.final.attack).toBe(PLAYER_DAMAGE + 2)
    })
  })

  describe('4. Desbloqueo y equipamiento persistente de skins y accesorios', () => {
    it('permite equipar skins y accesorios desbloqueados y persiste tras recargar', () => {
      writeSave({ coins: 300 })
      purchaseShopItem('skin-cyber-ninja')
      purchaseShopItem('skin-golden')
      purchaseShopItem('acc-visor')
      purchaseShopItem('acc-aura-binary')

      // Equipar skin desbloqueada
      const afterSkin = equipSkin('cyber-ninja')
      expect(afterSkin.equippedSkin).toBe('cyber-ninja')
      expect(loadProgression().equippedSkin).toBe('cyber-ninja')

      // Volver a la skin default
      expect(equipSkin('default').equippedSkin).toBe('default')

      // Intentar equipar una skin NO desbloqueada no cambia la equipada
      expect(equipSkin('matrix').equippedSkin).toBe('default')

      // Equipar y desequipar accesorios
      expect(equipAccessory('visor').equippedAccessory).toBe('visor')
      expect(loadProgression().equippedAccessory).toBe('visor')

      // Intentar equipar accesorio no desbloqueado se ignora
      expect(equipAccessory('blade-magenta').equippedAccessory).toBe('visor')

      // Desequipar con null
      expect(equipAccessory(null).equippedAccessory).toBeNull()
      expect(loadProgression().equippedAccessory).toBeNull()
    })
  })

  describe('5. Desbloqueo de logros (evaluateAchievements) y recompensas sin duplicación', () => {
    it('desbloquea first-debug, floor-html-clear, first-purchase, collector-cyber, saver-senior y full-stack-hero una sola vez', () => {
      // 1) first-debug (+15 monedas)
      writeSave({ defeatedBossIds: ['tag-fantasma'], coins: 10 })
      const res1 = evaluateAchievements()
      expect(res1.newlyUnlocked.map((a) => a.id)).toEqual(['first-debug'])
      expect(res1.save.coins).toBe(10 + 15)

      // Llamada repetida no vuelve a otorgar monedas ni duplicar el logro
      const res1Repeat = evaluateAchievements()
      expect(res1Repeat.newlyUnlocked).toEqual([])
      expect(res1Repeat.save.coins).toBe(25)

      // 2) floor-html-clear (+25 monedas)
      writeSave({
        defeatedBossIds: ['tag-fantasma', 'etiqueta-roja', 'html-corrupto'],
      })
      const res2 = evaluateAchievements()
      expect(res2.newlyUnlocked.map((a) => a.id)).toEqual(['floor-html-clear'])
      expect(res2.save.coins).toBe(25 + 25)

      // 3) first-purchase (+10 monedas) y collector-cyber (+25 monedas)
      saveProgression({
        purchaseCount: 3,
        ownedUpgrades: ['upg-vitality', 'upg-compiler'],
        unlockedAccessories: ['visor'],
      })
      const res3 = evaluateAchievements()
      expect(res3.newlyUnlocked.map((a) => a.id)).toEqual(['first-purchase', 'collector-cyber'])
      expect(res3.save.coins).toBe(50 + 10 + 25)

      // 4) saver-senior (+20 monedas al alcanzar >= 100 monedas)
      writeSave({ coins: 105 })
      const res4 = evaluateAchievements()
      expect(res4.newlyUnlocked.map((a) => a.id)).toEqual(['saver-senior'])
      expect(res4.save.coins).toBe(105 + 20)

      // 5) full-stack-hero (+50 monedas al derrotar los 12 jefes) y floor-css-clear (+30 monedas)
      const allTwelveBossIds = bosses.map((b) => b.id)
      expect(allTwelveBossIds).toHaveLength(12)
      writeSave({ defeatedBossIds: allTwelveBossIds })
      const res5 = evaluateAchievements()
      expect(res5.newlyUnlocked.map((a) => a.id)).toEqual(['floor-css-clear', 'full-stack-hero'])
      expect(res5.save.coins).toBe(125 + 30 + 50)

      // Verificar que una evaluación posterior no duplica ningún logro ni monedas
      const finalCheck = evaluateAchievements()
      expect(finalCheck.newlyUnlocked).toEqual([])
      expect(finalCheck.save.coins).toBe(205)
      expect(finalCheck.progression.unlockedAchievements).toEqual(
        expect.arrayContaining([
          'first-debug',
          'floor-html-clear',
          'floor-css-clear',
          'first-purchase',
          'collector-cyber',
          'saver-senior',
          'full-stack-hero',
        ]),
      )
    })
  })

  describe('6. Renderizado de CoffeeShop RPG (3 Zonas: VENDEDOR, CATÁLOGO, JUGADOR)', () => {
    it('renderiza la barra superior TECHCORP · TIENDA y las 3 zonas (VENDEDOR, CATÁLOGO, JUGADOR) con NpcByteSprite y PlayerSprite', () => {
      const html = renderToStaticMarkup(
        createElement(CoffeeShop, {
          playerHp: 80,
          coins: 65,
          coffees: 2,
          onBuyCoffee: () => {},
          onUseCoffee: () => {},
        }),
      )

      // Barra superior y estructura 3 zonas
      expect(html).toContain('store-topbar')
      expect(html).toContain('TECHCORP · TIENDA')
      expect(html).toContain('Tu vida: 80/100 HP · Monedas: 65 · Cafés: 2')
      expect(html).toContain('rpg-store-layout')
      expect(html).toContain('store-zone-vendor')
      expect(html).toContain('VENDEDOR')
      expect(html).toContain('store-zone-catalog')
      expect(html).toContain('CATÁLOGO')
      expect(html).toContain('store-zone-player')
      expect(html).toContain('JUGADOR')

      // Vendedor Byte y cinturón rápido
      expect(html).toContain('npc-byte-stage')
      expect(html).toContain('Byte')
      expect(html).toContain('Comprar Café (+35 HP) · 25')
      expect(html).toContain('Tomar Café ahora (+35 HP)')

      // Panel Jugador
      expect(html).toContain('player-sprite')
      expect(html).toContain('HP 80/100')
      expect(html).toContain('ATQ 10')
      expect(html).toContain('DEF 0')
      expect(html).toContain('CAFÉ +35 HP')
    })

    it('renderiza las pestañas de mejoras con comparativa antes/después en el inspector y +delta en estadísticas', () => {
      const upgradesHtml = renderToStaticMarkup(
        createElement(CoffeeShop, {
          coins: 100,
          initialTab: 'upgrades',
        }),
      )

      expect(upgradesHtml).toContain('Chasis de Titanio')
      expect(upgradesHtml).toContain('Compilador Overclock')
      expect(upgradesHtml).toContain('Firewall de Kernel')
      expect(upgradesHtml).toContain('Termo Térmico Pro')
      expect(upgradesHtml).toContain('item-inspector-panel')
      expect(upgradesHtml).toContain('Vida Máx actual: 100 → Después de mejora: 115 (+15)')
      expect(upgradesHtml).toContain('stat-delta-preview')
      expect(upgradesHtml).toContain('+15 HP')
    })

    it('renderiza las pestañas de skins, accesorios y la sala de trofeos TrophyRoom', () => {
      const skinsHtml = renderToStaticMarkup(
        createElement(CoffeeShop, {
          coins: 100,
          initialTab: 'skins',
        }),
      )
      expect(skinsHtml).toContain('Debugger Clásico')
      expect(skinsHtml).toContain('Cyber Ninja Neón')
      expect(skinsHtml).toContain('Arquitecto Matrix')
      expect(skinsHtml).toContain('Senior Full-Stack Dorado')

      const accessoriesHtml = renderToStaticMarkup(
        createElement(CoffeeShop, {
          coins: 100,
          initialTab: 'accessories',
        }),
      )
      expect(accessoriesHtml).toContain('Visor Holográfico')
      expect(accessoriesHtml).toContain('Hoja Láser Magenta')
      expect(accessoriesHtml).toContain('Aura Binaria 01')
      expect(accessoriesHtml).toContain('VISTA PREVIA: Visor Holográfico')

      const achievementsHtml = renderToStaticMarkup(
        createElement(CoffeeShop, {
          coins: 100,
          initialTab: 'achievements',
        }),
      )
      expect(achievementsHtml).toContain('trophy-room')
      expect(achievementsHtml).toContain('SALA DE TROFEOS TECHCORP')
      expect(achievementsHtml).toContain('Primer Debug')
      expect(achievementsHtml).toContain('Héroe Full-Stack')
      expect(achievementsHtml).toContain(`${ACHIEVEMENTS_CATALOG.length}`)
      expect(SHOP_CATALOG.length).toBeGreaterThanOrEqual(10)
    })

    it('renderiza ItemCard con sus estados reales y TrophyRoom con progreso porcentual', () => {
      const sampleItem = SHOP_CATALOG.find((i) => i.id === 'upg-compiler')
      const cardHtml = renderToStaticMarkup(
        createElement(ItemCard, {
          item: sampleItem,
          state: 'insufficient',
          selected: true,
          actionLabel: 'Instalar Mejora',
          onAction: () => {},
        }),
      )
      expect(cardHtml).toContain('item-card')
      expect(cardHtml).toContain('Sin fondos')
      expect(cardHtml).toContain('Compilador Overclock')

      const trophyHtml = renderToStaticMarkup(
        createElement(TrophyRoom, {
          unlockedIds: ['first-debug', 'first-purchase'],
          defeatedCount: 2,
          purchaseCount: 1,
          coins: 45,
        }),
      )
      expect(trophyHtml).toContain('2 de 8 medallas desbloqueadas')
      expect(trophyHtml).toContain('DESBLOQUEADO')
      expect(trophyHtml).toContain('PENDIENTE')
    })
  })
})
