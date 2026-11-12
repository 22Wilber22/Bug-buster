/**
 * Motor puro de Exploración Lateral 2D, Cámara y Colisiones.
 * Permite mover al protagonista a izquierda/derecha, calcular la posición suave de cámara
 * y detectar interacciones con la tienda NPC, el jefe del piso y el portal de salida [ > ].
 */

export const WORLD_WIDTH = 1200
export const VIEWPORT_WIDTH = 720
export const PLAYER_SPEED = 18
export const INTERACTION_RADIUS = 72

export const WORLD_ZONES = {
  spawnX: 90,
  shopX: 340,
  enemyX: 740,
  portalX: 1080,
}

export function createExplorationState({
  floorId = 'html',
  bossId = 'tag-fantasma',
  bossDefeated = false,
} = {}) {
  return {
    floorId,
    bossId,
    playerX: WORLD_ZONES.spawnX,
    facing: 'right',
    animState: 'idle',
    cameraX: 0,
    bossDefeated: Boolean(bossDefeated),
    encounterTriggered: false,
    levelCompleted: false,
    shopOpen: false,
    activePrompt: null,
  }
}

export function clampWorldX(x) {
  return Math.max(40, Math.min(WORLD_WIDTH - 60, Math.round(x)))
}

export function computeCameraX(playerX, viewportWidth = VIEWPORT_WIDTH, worldWidth = WORLD_WIDTH) {
  const maxScroll = Math.max(0, worldWidth - viewportWidth)
  const target = playerX - viewportWidth * 0.4
  return Math.max(0, Math.min(maxScroll, Math.round(target)))
}

export function detectNearbyZone(playerX, bossDefeated = false) {
  if (Math.abs(playerX - WORLD_ZONES.shopX) <= INTERACTION_RADIUS) {
    return {
      zone: 'shop',
      label: 'Presiona [E] o haz clic para hablar con Byte (Tienda Cyber)',
    }
  }
  if (!bossDefeated && Math.abs(playerX - WORLD_ZONES.enemyX) <= INTERACTION_RADIUS) {
    return {
      zone: 'enemy',
      label: '¡Enemigo detectado! Presiona [E] o haz clic para iniciar el combate',
    }
  }
  if (bossDefeated && Math.abs(playerX - WORLD_ZONES.portalX) <= INTERACTION_RADIUS) {
    return {
      zone: 'portal',
      label: 'Portal digital [ > ] activo · Presiona [E] para avanzar a la siguiente zona',
    }
  }
  return null
}

export function stepExploration(state, action) {
  if (!state || typeof state !== 'object') return createExplorationState()

  // Bloquear el movimiento mientras hay un encuentro o transición activa
  if (state.encounterTriggered || state.levelCompleted) {
    return state
  }

  switch (action?.type) {
    case 'move': {
      if (state.shopOpen) return state
      const dir = action.dir === 'left' ? -1 : action.dir === 'right' ? 1 : 0
      if (dir === 0) return state
      const step = typeof action.distance === 'number' ? action.distance : PLAYER_SPEED
      let nextX = clampWorldX(state.playerX + dir * step)

      // No permitir atravesar al jefe sin derrotarlo primero
      if (!state.bossDefeated && nextX > WORLD_ZONES.enemyX + 20) {
        nextX = WORLD_ZONES.enemyX + 20
      }

      const nearby = detectNearbyZone(nextX, state.bossDefeated)
      return {
        ...state,
        playerX: nextX,
        facing: dir < 0 ? 'left' : 'right',
        animState: 'walk',
        cameraX: computeCameraX(nextX),
        activePrompt: nearby,
      }
    }

    case 'stop': {
      return {
        ...state,
        animState: 'idle',
      }
    }

    case 'interact': {
      const nearby = detectNearbyZone(state.playerX, state.bossDefeated)
      if (!nearby) return state
      if (nearby.zone === 'shop') {
        return { ...state, shopOpen: !state.shopOpen, animState: 'idle' }
      }
      if (nearby.zone === 'enemy' && !state.bossDefeated) {
        return { ...state, encounterTriggered: true, animState: 'idle' }
      }
      if (nearby.zone === 'portal' && state.bossDefeated) {
        return { ...state, levelCompleted: true, animState: 'exit' }
      }
      return state
    }

    case 'toggle_shop': {
      return {
        ...state,
        shopOpen: typeof action.open === 'boolean' ? action.open : !state.shopOpen,
        animState: 'idle',
      }
    }

    case 'mark_boss_defeated': {
      const nearby = detectNearbyZone(state.playerX, true)
      return {
        ...state,
        bossDefeated: true,
        encounterTriggered: false,
        activePrompt: nearby,
      }
    }

    default:
      return state
  }
}
