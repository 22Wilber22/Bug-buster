import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import BattleHeader from './BattleHeader'
import BattleStatus from './BattleStatus'
import HealthBar from './HealthBar'
import SpecialAttackMeter from './SpecialAttackMeter'
import ActionButton from './ActionButton'
import BattleActions from './BattleActions'
import BattleArena from './BattleArena'
import CharacterSprite from './CharacterSprite'
import CombatEffects from './CombatEffects'
import { bosses } from '../data/bosses'
import { createBattle } from '../engine/battle'

const sampleBoss = bosses[0] // El Tag Fantasma

describe('BattleHeader', () => {
  it('renderiza la marca Bug Buster, inventario de monedas y cafés, y botón de volver al menú', () => {
    const html = renderToStaticMarkup(
      createElement(BattleHeader, {
        coins: 45,
        coffees: 2,
        muted: false,
        onMenu: () => {},
      }),
    )

    expect(html).toContain('Bug')
    expect(html).toContain('Buster')
    expect(html).toContain('hud-stat-coin')
    expect(html).toContain('45')
    expect(html).toContain('hud-stat-coffee')
    expect(html).toContain('2')
    expect(html).toContain('🔊 Sonido: ON')
    expect(html).toContain('Volver al menú principal')
  })

  it('muestra el estado muteado (Mutear: OFF) cuando muted es true', () => {
    const html = renderToStaticMarkup(
      createElement(BattleHeader, {
        coins: 10,
        coffees: 0,
        muted: true,
      }),
    )

    expect(html).toContain('🔇 Mutear: OFF')
    expect(html).not.toContain('Volver al menú principal')
  })
})

describe('BattleStatus', () => {
  it('renderiza el nombre del jefe, su mini-sprite pixel art, la burla (taunt) y el turno del jugador', () => {
    const html = renderToStaticMarkup(
      createElement(BattleStatus, {
        boss: sampleBoss,
        taunt: '¿Cerrar etiquetas? Eso es para los que tienen miedo.',
        turnPhase: 'player',
        finished: false,
      }),
    )

    expect(html).toContain(sampleBoss.name)
    expect(html).toContain('boss-title-mini-sprite')
    expect(html).toContain('/assets/bosses/tag-fantasma.png')
    expect(html).toContain('¿Cerrar etiquetas? Eso es para los que tienen miedo.')
    expect(html).toContain('TU TURNO')
    expect(html).toContain('Elegí tu acción')
  })

  it('muestra TURNO DEL JEFE durante boss-turn y COMBATE FINALIZADO al terminar', () => {
    const bossTurnHtml = renderToStaticMarkup(
      createElement(BattleStatus, {
        boss: sampleBoss,
        taunt: '¡Toma esto!',
        turnPhase: 'boss-turn',
        finished: false,
      }),
    )
    expect(bossTurnHtml).toContain('TURNO DEL JEFE')
    expect(bossTurnHtml).toContain(sampleBoss.attackName)

    const finishedHtml = renderToStaticMarkup(
      createElement(BattleStatus, {
        boss: sampleBoss,
        taunt: '',
        turnPhase: 'player',
        finished: true,
      }),
    )
    expect(finishedHtml).toContain('COMBATE FINALIZADO')
  })
})

describe('HealthBar', () => {
  it('muestra nombre, nivel (Nv.), valores reales current / max, porcentaje y 12 segmentos visuales', () => {
    const html = renderToStaticMarkup(
      createElement(HealthBar, {
        label: 'El Tag Fantasma',
        current: 30,
        max: 40,
        tone: 'enemy',
        level: 3,
      }),
    )

    expect(html).toContain('El Tag Fantasma')
    expect(html).toContain('Nv. 3')
    expect(html).toContain('30 / 40')
    expect(html).toContain('width:75%')

    const totalSegments = (html.match(/class="health-seg /g) || []).length
    expect(totalSegments).toBe(12)
  })

  it('activa el estado crítico (low y health-critical) cuando el HP del jugador es <= 30%', () => {
    const criticalHtml = renderToStaticMarkup(
      createElement(HealthBar, {
        label: 'Tú',
        current: 25,
        max: 100,
        tone: 'player',
        level: 6,
      }),
    )

    expect(criticalHtml).toContain('health-critical')
    expect(criticalHtml).toContain('health-fill low')
    expect(criticalHtml).toContain('width:25%')

    const healthyHtml = renderToStaticMarkup(
      createElement(HealthBar, {
        label: 'Tú',
        current: 80,
        max: 100,
        tone: 'player',
        level: 6,
      }),
    )

    expect(healthyHtml).not.toContain('health-critical')
    expect(healthyHtml).not.toContain('health-fill low')
  })
})

describe('SpecialAttackMeter', () => {
  it('muestra la carga streak/3 y marca los slots llenos (slot-filled)', () => {
    const html = renderToStaticMarkup(
      createElement(SpecialAttackMeter, {
        streak: 2,
        maxStreak: 3,
        shielded: false,
      }),
    )

    expect(html).toContain('2/3')
    const filledCount = (html.match(/slot-filled/g) || []).length
    const emptyCount = (html.match(/slot-empty/g) || []).length
    expect(filledCount).toBe(2)
    expect(emptyCount).toBe(1)
    expect(html).not.toContain('¡LISTO (Daño x2)!')
  })

  it('muestra el badge listo cuando llega a 3/3 y el indicador de escudo cuando shielded es true', () => {
    const html = renderToStaticMarkup(
      createElement(SpecialAttackMeter, {
        streak: 3,
        maxStreak: 3,
        shielded: true,
      }),
    )

    expect(html).toContain('3/3')
    expect(html).toContain('special-meter-ready')
    expect(html).toContain('¡LISTO (Daño x2)!')
    expect(html).toContain('special-meter-shielded')
    expect(html).toContain('🛡 Comentario activo: bloquea el próximo ataque')
  })
})

describe('BattleActions y ActionButton', () => {
  it('renderiza los 4 botones rediseñados con sus variantes de color y subtítulos', () => {
    const baseState = createBattle(sampleBoss, () => 0.5)
    const html = renderToStaticMarkup(
      createElement(BattleActions, {
        state: baseState,
        onAction: () => {},
        busy: false,
        coffees: 2,
        onDrinkCoffee: () => {},
      }),
    )

    expect(html).toContain('action-comment')
    expect(html).toContain('Comentar (2)')
    expect(html).toContain('Bloquea el próximo golpe')

    expect(html).toContain('action-debug')
    expect(html).toContain('Debug')
    expect(html).toContain('Corrige el error')

    expect(html).toContain('action-special')
    expect(html).toContain('⚡ Ataque Especial (0/3)')
    expect(html).toContain('Daño x2')

    expect(html).toContain('action-coffee')
    expect(html).toContain('☕ Tomar Café (2)')
    expect(html).toContain('+35 HP')
  })

  it('deshabilita Ataque Especial cuando streak < 3 y lo habilita con action-ready cuando streak === 3', () => {
    const baseState = createBattle(sampleBoss, () => 0.5)
    const notReadyHtml = renderToStaticMarkup(
      createElement(BattleActions, {
        state: { ...baseState, streak: 2 },
        onAction: () => {},
        busy: false,
        coffees: 1,
        onDrinkCoffee: () => {},
      }),
    )
    expect(notReadyHtml).not.toContain('action-ready')

    const readyHtml = renderToStaticMarkup(
      createElement(BattleActions, {
        state: { ...baseState, streak: 3 },
        onAction: () => {},
        busy: false,
        coffees: 1,
        onDrinkCoffee: () => {},
      }),
    )
    expect(readyHtml).toContain('action-special action-ready')
  })

  it('deshabilita Tomar Café cuando coffees === 0 o playerHp === 100, y lo habilita cuando coffees > 0 y playerHp < 100', () => {
    const baseState = createBattle(sampleBoss, () => 0.5)

    // playerHp === 100 -> café bloqueado
    const fullHpHtml = renderToStaticMarkup(
      createElement(BattleActions, {
        state: { ...baseState, playerHp: 100 },
        onAction: () => {},
        busy: false,
        coffees: 2,
        onDrinkCoffee: () => {},
      }),
    )
    expect(fullHpHtml).toContain('action-coffee  action-locked')

    // coffees === 0 y playerHp < 100 -> café bloqueado
    const noCoffeeHtml = renderToStaticMarkup(
      createElement(BattleActions, {
        state: { ...baseState, playerHp: 60 },
        onAction: () => {},
        busy: false,
        coffees: 0,
        onDrinkCoffee: () => {},
      }),
    )
    expect(noCoffeeHtml).toContain('action-coffee  action-locked')

    // coffees > 0 y playerHp < 100 -> café habilitado
    const canDrinkHtml = renderToStaticMarkup(
      createElement(BattleActions, {
        state: { ...baseState, playerHp: 60 },
        onAction: () => {},
        busy: false,
        coffees: 2,
        onDrinkCoffee: () => {},
      }),
    )
    expect(canDrinkHtml).not.toContain('action-coffee  action-locked')
  })

  it('bloquea todos los botones cuando busy es true', () => {
    const baseState = createBattle(sampleBoss, () => 0.5)
    const html = renderToStaticMarkup(
      createElement(BattleActions, {
        state: { ...baseState, streak: 3, playerHp: 50 },
        onAction: () => {},
        busy: true,
        coffees: 3,
        onDrinkCoffee: () => {},
      }),
    )

    const disabledCount = (html.match(/disabled=""/g) || []).length
    expect(disabledCount).toBe(4)
  })

  it('ActionButton aplica clases de estado correctamente', () => {
    const html = renderToStaticMarkup(
      createElement(ActionButton, {
        variant: 'special',
        title: 'Especial',
        subtitle: 'x2',
        ready: true,
        disabled: false,
      }),
    )
    expect(html).toContain('action-special')
    expect(html).toContain('action-ready')
    expect(html).not.toContain('action-locked')
  })
})

describe('BattleArena, CharacterSprite y CombatEffects', () => {
  it('renderiza el escenario pixel art con luna, pilares, terminales, pedestales holográficos y los dos personajes con sus estados', () => {
    const html = renderToStaticMarkup(
      createElement(BattleArena, {
        boss: sampleBoss,
        bossHp: 25,
        playerHp: 80,
        bossFx: 'hurt',
        playerFx: 'attack',
        turnPhase: 'player-attack',
        shielded: false,
        floorId: 'html',
        bossLevel: 1,
        playerLevel: 6,
      }),
    )

    expect(html).toContain('arena-moon')
    expect(html).toContain('arena-pillar-left')
    expect(html).toContain('arena-pillar-right')
    expect(html).toContain('arena-terminal-left')
    expect(html).toContain('arena-terminal-right')
    expect(html).toContain('holo-pedestal-enemy')
    expect(html).toContain('holo-pedestal-player')
    expect(html).toContain('boss-fx-hurt')
    expect(html).toContain('fx-attack')
    expect(html).toContain('25 / 40')
    expect(html).toContain('80 / 100')
  })

  it('soporta todos los estados de animación en CharacterSprite (idle, attack, hurt, victory, defeat) y muestra el aura de escudo', () => {
    const states = ['idle', 'attack', 'hurt', 'victory', 'defeat']
    for (const fx of states) {
      const playerHtml = renderToStaticMarkup(
        createElement(CharacterSprite, {
          role: 'player',
          fx,
          shielded: true,
        }),
      )
      expect(playerHtml).toContain(`fx-${fx}`)
      expect(playerHtml).toContain('/* SHIELD */')

      const enemyHtml = renderToStaticMarkup(
        createElement(CharacterSprite, {
          role: 'enemy',
          bossId: sampleBoss.id,
          fx,
        }),
      )
      expect(enemyHtml).toContain(`boss-fx-${fx}`)
    }
  })

  it('muestra números flotantes de daño, curación, crítico y bloqueo en CombatEffects, y activa stage-shake en special-hit', () => {
    const specialArenaHtml = renderToStaticMarkup(
      createElement(BattleArena, {
        boss: sampleBoss,
        bossHp: 20,
        playerHp: 90,
        bossFx: 'hurt',
        playerFx: 'attack',
        turnPhase: 'player-attack',
        shielded: false,
        floorId: 'js',
        combatEffect: {
          id: 1,
          kind: 'special-hit',
          enemyPopup: { text: '⚡ -20 HP', tone: 'special' },
        },
      }),
    )

    expect(specialArenaHtml).toContain('stage-shake')
    expect(specialArenaHtml).toContain('⚡ -20 HP')
    expect(specialArenaHtml).toContain('REFACTOR x2')

    const healFxHtml = renderToStaticMarkup(
      createElement(CombatEffects, {
        effect: {
          id: 2,
          kind: 'coffee-heal',
          playerPopup: { text: '+35 HP ☕', tone: 'heal' },
        },
      }),
    )
    expect(healFxHtml).toContain('+35 HP ☕')
    expect(healFxHtml).toContain('popup-heal')

    const critFxHtml = renderToStaticMarkup(
      createElement(CombatEffects, {
        effect: {
          id: 3,
          kind: 'boss-hit',
          critical: true,
          playerPopup: { text: '-12 CRÍTICO!', tone: 'crit' },
        },
      }),
    )
    expect(critFxHtml).toContain('-12 CRÍTICO!')
    expect(critFxHtml).toContain('popup-crit')

    const blockFxHtml = renderToStaticMarkup(
      createElement(CombatEffects, {
        effect: {
          id: 4,
          kind: 'boss-blocked',
          playerPopup: { text: '🛡 BLOQUEADO (0)', tone: 'block' },
        },
      }),
    )
    expect(blockFxHtml).toContain('🛡 BLOQUEADO (0)')
    expect(blockFxHtml).toContain('popup-block')
  })
})
