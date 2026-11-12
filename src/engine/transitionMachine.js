/**
 * Máquina de estados reutilizable para la transición de fin de nivel y caminata:
 * combat -> enemy_defeated -> victory -> rewards -> walking_right -> exiting -> loading_next_level -> entering -> ready
 */

export const TRANSITION_STATES = [
  'combat',
  'enemy_defeated',
  'victory',
  'rewards',
  'walking_right',
  'exiting',
  'loading_next_level',
  'entering',
  'ready',
]

const ALLOWED_TRANSITIONS = {
  combat: ['enemy_defeated'],
  enemy_defeated: ['victory'],
  victory: ['rewards', 'walking_right'],
  rewards: ['walking_right'],
  walking_right: ['exiting'],
  exiting: ['loading_next_level'],
  loading_next_level: ['entering', 'ready'],
  entering: ['ready'],
  ready: ['combat'],
}

export function createTransitionState(initial = 'combat') {
  const phase = TRANSITION_STATES.includes(initial) ? initial : 'combat'
  return {
    phase,
    playerState: phase === 'entering' ? 'enter' : 'idle',
    enemyState: 'idle',
    facing: 'right',
    walkProgress: 0,
    portalOpen: false,
    nextLevelLoaded: false,
    controlsLocked: phase !== 'combat' && phase !== 'ready' && phase !== 'rewards',
    rewardsGranted: false,
    bannerText: null,
  }
}

export function stepTransition(state, event) {
  if (!state || typeof state !== 'object') return createTransitionState()
  const type = typeof event === 'string' ? event : event?.type

  switch (type) {
    case 'WIN_COMBAT': {
      if (state.phase !== 'combat') return state
      return {
        ...state,
        phase: 'enemy_defeated',
        enemyState: 'defeat',
        playerState: 'idle',
        controlsLocked: true,
        rewardsGranted: true,
        bannerText: null,
      }
    }

    case 'ENEMY_FADED': {
      if (state.phase !== 'enemy_defeated') return state
      return {
        ...state,
        phase: 'victory',
        playerState: 'victory',
        portalOpen: true,
        bannerText: '¡NIVEL COMPLETADO!',
      }
    }

    case 'SHOW_REWARDS': {
      if (state.phase !== 'victory') return state
      return {
        ...state,
        phase: 'rewards',
        playerState: 'victory',
        portalOpen: true,
        controlsLocked: false,
        bannerText: '¡NIVEL COMPLETADO!',
      }
    }

    case 'START_WALK': {
      if (state.phase !== 'victory' && state.phase !== 'rewards') return state
      return {
        ...state,
        phase: 'walking_right',
        playerState: 'walk',
        facing: 'right',
        walkProgress: 50,
        portalOpen: true,
        controlsLocked: true,
        bannerText: '¡NIVEL COMPLETADO!',
      }
    }

    case 'REACH_PORTAL': {
      if (state.phase !== 'walking_right') return state
      return {
        ...state,
        phase: 'exiting',
        playerState: 'exit',
        walkProgress: 100,
        portalOpen: true,
        controlsLocked: true,
      }
    }

    case 'LOAD_NEXT': {
      if (state.phase !== 'exiting' || state.nextLevelLoaded) return state
      return {
        ...state,
        phase: 'loading_next_level',
        nextLevelLoaded: true,
        controlsLocked: true,
      }
    }

    case 'ENTER_SCENE': {
      if (state.phase !== 'loading_next_level') return state
      return {
        ...state,
        phase: 'entering',
        playerState: 'enter',
        walkProgress: 0,
        portalOpen: false,
        controlsLocked: true,
        bannerText: null,
      }
    }

    case 'SCENE_READY': {
      if (state.phase !== 'entering' && state.phase !== 'loading_next_level') return state
      return {
        ...state,
        phase: 'ready',
        playerState: 'idle',
        enemyState: 'idle',
        walkProgress: 0,
        portalOpen: false,
        controlsLocked: false,
        bannerText: null,
      }
    }

    case 'LOSE_COMBAT': {
      // Losing never triggers the victory walk or level completion
      return {
        ...state,
        phase: 'combat',
        playerState: 'defeat',
        enemyState: 'victory',
        portalOpen: false,
        controlsLocked: false,
        bannerText: null,
      }
    }

    default:
      return state
  }
}

export function canTransitionTo(fromPhase, toPhase) {
  return Boolean(ALLOWED_TRANSITIONS[fromPhase]?.includes(toPhase))
}
