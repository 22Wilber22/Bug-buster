import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  createTransitionState,
  stepTransition,
  canTransitionTo,
  TRANSITION_STATES,
} from './transitionMachine'
import {
  getEnemyProfile,
  getEnemyTelegraph,
  ENEMY_ARCHETYPES,
  BOSS_PATTERN_PROFILES,
} from './enemyPatterns'
import {
  createExplorationState,
  stepExploration,
  computeCameraX,
  detectNearbyZone,
  WORLD_ZONES,
  WORLD_WIDTH,
} from './exploration'
import { bosses } from '../data/bosses'
import PlayerSprite from '../components/PlayerSprite'
import CharacterSprite from '../components/CharacterSprite'
import BattleStatus from '../components/BattleStatus'
import BattleArena from '../components/BattleArena'
import Exploration from '../screens/Exploration'

describe('Máquina de Estados de Transición y Caminata (transitionMachine.js)', () => {
  it('define todos los estados requeridos en el orden esperado', () => {
    expect(TRANSITION_STATES).toEqual([
      'combat',
      'enemy_defeated',
      'victory',
      'rewards',
      'walking_right',
      'exiting',
      'loading_next_level',
      'entering',
      'ready',
    ])
    expect(canTransitionTo('combat', 'enemy_defeated')).toBe(true)
    expect(canTransitionTo('combat', 'walking_right')).toBe(false)
    expect(canTransitionTo('rewards', 'walking_right')).toBe(true)
    expect(canTransitionTo('walking_right', 'exiting')).toBe(true)
  })

  it('recorre el flujo completo de victoria -> recompensas -> caminata a la derecha -> portal -> siguiente nivel', () => {
    let state = createTransitionState('combat')
    expect(state.phase).toBe('combat')
    expect(state.controlsLocked).toBe(false)
    expect(state.portalOpen).toBe(false)

    // Paso 1: Enemigo derrotado
    state = stepTransition(state, 'WIN_COMBAT')
    expect(state.phase).toBe('enemy_defeated')
    expect(state.enemyState).toBe('defeat')
    expect(state.controlsLocked).toBe(true)
    expect(state.rewardsGranted).toBe(true)

    // Paso 2: Enemigo se desvanece y aparece el portal con ¡NIVEL COMPLETADO!
    state = stepTransition(state, 'ENEMY_FADED')
    expect(state.phase).toBe('victory')
    expect(state.playerState).toBe('victory')
    expect(state.portalOpen).toBe(true)
    expect(state.bannerText).toBe('¡NIVEL COMPLETADO!')

    // Paso 2b: Mostrar recompensas antes de avanzar
    state = stepTransition(state, 'SHOW_REWARDS')
    expect(state.phase).toBe('rewards')
    expect(state.controlsLocked).toBe(false)

    // Paso 3: Protagonista gira a la derecha y camina hacia el portal
    state = stepTransition(state, 'START_WALK')
    expect(state.phase).toBe('walking_right')
    expect(state.playerState).toBe('walk')
    expect(state.facing).toBe('right')
    expect(state.walkProgress).toBe(50)
    expect(state.controlsLocked).toBe(true)

    // Paso 4: Cruza el portal y carga el siguiente nivel una sola vez
    state = stepTransition(state, 'REACH_PORTAL')
    expect(state.phase).toBe('exiting')
    expect(state.playerState).toBe('exit')
    expect(state.walkProgress).toBe(100)

    state = stepTransition(state, 'LOAD_NEXT')
    expect(state.phase).toBe('loading_next_level')
    expect(state.nextLevelLoaded).toBe(true)

    // Intentar disparar LOAD_NEXT una segunda vez no debe alterar ni recargar
    const duplicateLoad = stepTransition(state, 'LOAD_NEXT')
    expect(duplicateLoad).toEqual(state)

    // Entrada al nuevo escenario y listo para jugar
    state = stepTransition(state, 'ENTER_SCENE')
    expect(state.phase).toBe('entering')
    expect(state.playerState).toBe('enter')
    expect(state.controlsLocked).toBe(true)

    state = stepTransition(state, 'SCENE_READY')
    expect(state.phase).toBe('ready')
    expect(state.playerState).toBe('idle')
    expect(state.controlsLocked).toBe(false)
  })

  it('NO activa la caminata de victoria ni abre el portal si el jugador pierde el combate', () => {
    let state = createTransitionState('combat')
    state = stepTransition(state, 'LOSE_COMBAT')

    expect(state.phase).toBe('combat')
    expect(state.playerState).toBe('defeat')
    expect(state.enemyState).toBe('victory')
    expect(state.portalOpen).toBe(false)

    // Intentar iniciar caminata tras perder es ignorado
    const afterWalkAttempt = stepTransition(state, 'START_WALK')
    expect(afterWalkAttempt.phase).toBe('combat')
    expect(afterWalkAttempt.portalOpen).toBe(false)
  })
})

describe('Patrones de Enemigos y Señales de Anticipación (enemyPatterns.js)', () => {
  it('asigna un arquetipo válido y movimiento especial a cada uno de los 12 jefes', () => {
    expect(Object.keys(BOSS_PATTERN_PROFILES).length).toBe(12)
    for (const boss of bosses) {
      const profile = getEnemyProfile(boss.id)
      expect(profile.pattern).toBeTruthy()
      expect(ENEMY_ARCHETYPES[profile.pattern]).toBeDefined()
      expect(profile.specialMove.length).toBeGreaterThan(3)
      expect(profile.weakness.length).toBeGreaterThan(3)
    }
  })

  it('genera señales de anticipación (telegraphing) normales, de carga y de fase crítica para jefes de piso', () => {
    const htmlBoss = bosses.find((b) => b.id === 'html-corrupto')
    const normalTel = getEnemyTelegraph(htmlBoss, 0, htmlBoss.hp)
    expect(normalTel.urgent).toBe(false)
    expect(normalTel.message).toContain(htmlBoss.attackName)

    const chargingTel = getEnemyTelegraph(htmlBoss, 1, htmlBoss.hp)
    expect(chargingTel.urgent).toBe(true)
    expect(chargingTel.message).toContain('cargando')

    const enragedTel = getEnemyTelegraph(htmlBoss, 2, Math.floor(htmlBoss.hp * 0.3))
    expect(enragedTel.urgent).toBe(true)
    expect(enragedTel.message).toContain('¡FASE CRÍTICA!')
  })
})

describe('Motor de Exploración Lateral 2D (exploration.js)', () => {
  it('mueve al personaje a izquierda y derecha actualizando la orientación, animación walk y cámara', () => {
    let state = createExplorationState({ floorId: 'html', bossId: 'tag-fantasma' })
    expect(state.playerX).toBe(WORLD_ZONES.spawnX)
    expect(state.animState).toBe('idle')

    state = stepExploration(state, { type: 'move', dir: 'right', distance: 100 })
    expect(state.playerX).toBe(WORLD_ZONES.spawnX + 100)
    expect(state.facing).toBe('right')
    expect(state.animState).toBe('walk')

    state = stepExploration(state, { type: 'move', dir: 'left', distance: 40 })
    expect(state.playerX).toBe(WORLD_ZONES.spawnX + 60)
    expect(state.facing).toBe('left')
    expect(state.animState).toBe('walk')

    state = stepExploration(state, { type: 'stop' })
    expect(state.animState).toBe('idle')
  })

  it('calcula el desplazamiento suave de cámara dentro de los límites del escenario', () => {
    expect(computeCameraX(50)).toBe(0)
    expect(computeCameraX(600)).toBeGreaterThan(0)
    expect(computeCameraX(WORLD_WIDTH + 500)).toBeLessThanOrEqual(WORLD_WIDTH - 720)
  })

  it('impide atravesar al jefe si no ha sido derrotado y activa el encuentro al interactuar', () => {
    let state = createExplorationState({
      floorId: 'html',
      bossId: 'tag-fantasma',
      bossDefeated: false,
    })

    // Intentar caminar más allá del jefe
    state = stepExploration(state, { type: 'move', dir: 'right', distance: 900 })
    expect(state.playerX).toBeLessThanOrEqual(WORLD_ZONES.enemyX + 20)
    expect(state.activePrompt?.zone).toBe('enemy')

    // Interactuar con el jefe inicia el encuentro y bloquea movimiento posterior
    state = stepExploration(state, { type: 'interact' })
    expect(state.encounterTriggered).toBe(true)

    const frozen = stepExploration(state, { type: 'move', dir: 'left', distance: 50 })
    expect(frozen.playerX).toBe(state.playerX)
  })

  it('permite abrir la tienda en la zona de Byte y cruzar el portal [ > ] cuando el jefe fue derrotado', () => {
    let state = createExplorationState({
      floorId: 'html',
      bossId: 'tag-fantasma',
      bossDefeated: true,
    })

    // Moverse hasta la tienda
    const distToShop = WORLD_ZONES.shopX - state.playerX
    state = stepExploration(state, { type: 'move', dir: 'right', distance: distToShop })
    expect(detectNearbyZone(state.playerX, true)?.zone).toBe('shop')

    state = stepExploration(state, { type: 'interact' })
    expect(state.shopOpen).toBe(true)

    // Cerrar tienda y caminar hasta el portal
    state = stepExploration(state, { type: 'toggle_shop', open: false })
    const distToPortal = WORLD_ZONES.portalX - state.playerX
    state = stepExploration(state, { type: 'move', dir: 'right', distance: distToPortal })
    expect(state.activePrompt?.zone).toBe('portal')

    state = stepExploration(state, { type: 'interact' })
    expect(state.levelCompleted).toBe(true)
    expect(state.animState).toBe('exit')
  })
})

describe('Componentes Visuales de Caminata, Portal y Escenario 2D', () => {
  it('PlayerSprite y CharacterSprite soportan estados walk, enter, exit, dirección y skins', () => {
    for (const fx of ['walk', 'enter', 'exit']) {
      const html = renderToStaticMarkup(
        createElement(PlayerSprite, {
          fx,
          facing: 'right',
          skin: 'cyber-ninja',
          accessory: 'visor',
        }),
      )
      expect(html).toContain(`fx-${fx}`)
      expect(html).toContain('facing-right')
      expect(html).toContain('skin-cyber-ninja')
      expect(html).toContain('acc-visor')
      if (fx === 'walk') {
        expect(html).toContain('walk-dust-steps')
      }
    }

    const walkingCharHtml = renderToStaticMarkup(
      createElement(CharacterSprite, {
        role: 'player',
        fx: 'walk',
        walkProgress: 50,
      }),
    )
    expect(walkingCharHtml).toContain('player-walking-right')
  })

  it('BattleStatus muestra la insignia del patrón y el banner de anticipación (telegraph)', () => {
    const html = renderToStaticMarkup(
      createElement(BattleStatus, {
        boss: bosses[0],
        taunt: '¡Veremos si cierras este tag!',
        turnPhase: 'player',
        finished: false,
        turnCount: 1,
        bossHp: 20,
      }),
    )
    expect(html).toContain('enemy-pattern-badge')
    expect(html).toContain('enemy-telegraph-banner')
    expect(html).toContain('telegraph-urgent')
  })

  it('BattleArena renderiza el portal digital [ > ] y el banner ¡NIVEL COMPLETADO! durante la transición de victoria', () => {
    let t = stepTransition(createTransitionState('combat'), 'WIN_COMBAT')
    t = stepTransition(t, 'ENEMY_FADED')
    t = stepTransition(t, 'START_WALK')

    const html = renderToStaticMarkup(
      createElement(BattleArena, {
        boss: bosses[0],
        bossHp: 0,
        playerHp: 90,
        bossFx: 'defeat',
        playerFx: 'walk',
        turnPhase: 'player',
        shielded: false,
        floorId: 'html',
        transitionState: t,
      }),
    )
    expect(html).toContain('¡NIVEL COMPLETADO!')
    expect(html).toContain('digital-exit-portal')
    expect(html).toContain('[ &gt; ]')
    expect(html).toContain('player-walking-right')
  })

  it('Exploration renderiza el corredor 2D con tienda de Byte, jefe, portal [ > ] y controles de movimiento', () => {
    const html = renderToStaticMarkup(
      createElement(Exploration, {
        floorId: 'html',
        defeatedBossIds: [],
        playerHp: 100,
        coins: 30,
        coffees: 1,
      }),
    )
    expect(html).toContain('Corredor 2D')
    expect(html).toContain('TIENDA CYBER · BYTE')
    expect(html).toContain('digital-exit-portal')
    expect(html).toContain('Izquierda [A]')
    expect(html).toContain('Derecha [D]')
  })
})
