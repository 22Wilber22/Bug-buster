import { useEffect, useRef, useState } from 'react'
import { bosses } from '../data/bosses'
import { floors } from '../data/floors'
import { PLAYER_MAX_HP } from '../engine/battle'
import {
  createExplorationState,
  stepExploration,
  WORLD_ZONES,
  WORLD_WIDTH,
} from '../engine/exploration'
import { getEnemyProfile } from '../engine/enemyPatterns'
import { playSfx } from '../engine/sound'
import GameHud from '../components/GameHud'
import PlayerSprite from '../components/PlayerSprite'
import BossSprite from '../components/BossSprite'
import CoffeeShop from '../components/CoffeeShop'

function Exploration({
  floorId = 'html',
  bossId,
  defeatedBossIds = [],
  playerHp = PLAYER_MAX_HP,
  coins = 0,
  coffees = 0,
  onBuyCoffee,
  onUseCoffee,
  onProgressionChange,
  onStartEncounter,
  onMap,
  onMenu,
  muted,
  onToggleMute,
}) {
  const floor = floors.find((f) => f.id === floorId) || floors[0]
  const resolvedBossId =
    bossId ||
    floor.bossIds.find((id) => !defeatedBossIds.includes(id)) ||
    floor.bossIds[floor.bossIds.length - 1]
  const boss = bosses.find((b) => b.id === resolvedBossId) || bosses[0]
  const bossDefeated = defeatedBossIds.includes(boss.id)
  const enemyProfile = getEnemyProfile(boss.id)

  const [state, setState] = useState(() =>
    createExplorationState({
      floorId: floor.id,
      bossId: boss.id,
      bossDefeated,
    }),
  )
  const encounterSentRef = useRef(false)

  useEffect(() => {
    if (state.encounterTriggered && !encounterSentRef.current) {
      encounterSentRef.current = true
      playSfx('open')
      onStartEncounter?.(boss.id)
    }
  }, [state.encounterTriggered, boss.id, onStartEncounter])

  useEffect(() => {
    if (state.levelCompleted) {
      playSfx('win')
      onMap?.()
    }
  }, [state.levelCompleted, onMap])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        setState((prev) => stepExploration(prev, { type: 'move', dir: 'left' }))
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setState((prev) => stepExploration(prev, { type: 'move', dir: 'right' }))
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        setState((prev) => stepExploration(prev, { type: 'interact' }))
      }
    }

    const handleKeyUp = (e) => {
      if (
        ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)
      ) {
        setState((prev) => stepExploration(prev, { type: 'stop' }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const moveStep = (dir) => {
    playSfx('click')
    setState((prev) => stepExploration(prev, { type: 'move', dir, distance: 56 }))
  }

  const handleInteract = () => {
    playSfx('click')
    setState((prev) => stepExploration(prev, { type: 'interact' }))
  }

  const triggerDirectCombat = () => {
    if (encounterSentRef.current) return
    encounterSentRef.current = true
    playSfx('open')
    onStartEncounter?.(boss.id)
  }

  return (
    <main className={`screen exploration-screen floor-theme-${floor.id}`}>
      <GameHud
        onMenu={onMenu}
        muted={muted}
        onToggleMute={onToggleMute}
        coins={coins}
        coffees={coffees}
      />

      <header className="exploration-header">
        <div>
          <h2>
            Corredor 2D · Piso {floor.name}: {floor.subtitle}
          </h2>
          <p className="muted">
            Usa <strong>A / D</strong> o <strong>◀ / ▶</strong> para caminar por el piso y{' '}
            <strong>[E]</strong> para interactuar con la tienda, el enemigo o el portal.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            playSfx('click')
            onMap?.()
          }}
        >
          🗺 Volver al mapa
        </button>
      </header>

      {/* Viewport con seguimiento suave de cámara horizontal */}
      <section
        className="exploration-viewport"
        aria-label={`Corredor explorable del piso ${floor.name}`}
      >
        <div
          className="exploration-world"
          style={{
            width: `${WORLD_WIDTH}px`,
            transform: `translateX(-${state.cameraX}px)`,
          }}
        >
          <div className="exploration-backdrop-grid" aria-hidden="true" />

          {/* Zona 1: Punto de entrada */}
          <div
            className="world-landmark world-spawn"
            style={{ left: `${WORLD_ZONES.spawnX}px` }}
          >
            <span className="landmark-tag">[ ENTRADA ]</span>
          </div>

          {/* Zona 2: Puesto del Vendedor NPC Byte */}
          <div
            className={`world-landmark world-shop-booth ${state.activePrompt?.zone === 'shop' ? 'landmark-active' : ''}`}
            style={{ left: `${WORLD_ZONES.shopX}px` }}
          >
            <span className="landmark-tag">☕ TIENDA CYBER · BYTE</span>
            <button
              type="button"
              className="btn btn-coffee world-station-btn"
              onClick={() => {
                playSfx('click')
                setState((prev) => stepExploration(prev, { type: 'toggle_shop' }))
              }}
            >
              {state.shopOpen ? 'Cerrar Tienda' : 'Hablar con Byte'}
            </button>
          </div>

          {/* Zona 3: Guardián / Jefe del Piso */}
          <div
            className={`world-landmark world-enemy-zone ${bossDefeated ? 'enemy-cleared' : ''} ${state.activePrompt?.zone === 'enemy' ? 'landmark-active' : ''}`}
            style={{ left: `${WORLD_ZONES.enemyX}px` }}
          >
            <span className="landmark-tag">
              {bossDefeated ? `✔ ${boss.name} (Depurado)` : `⚠ ${boss.name} · ${enemyProfile.archetype.badge}`}
            </span>
            {!bossDefeated && (
              <div className="world-enemy-sprite-wrap">
                <BossSprite bossId={boss.id} fx="idle" />
                <button
                  type="button"
                  className="btn world-station-btn"
                  onClick={triggerDirectCombat}
                >
                  ⚔ ¡Iniciar Combate!
                </button>
              </div>
            )}
          </div>

          {/* Zona 4: Portal digital de salida [ > ] */}
          <div
            className={`world-landmark world-portal-zone ${bossDefeated ? 'portal-unlocked' : 'portal-locked'}`}
            style={{ left: `${WORLD_ZONES.portalX}px` }}
          >
            <div className={`digital-exit-portal ${bossDefeated ? 'portal-open' : ''}`}>
              <span className="portal-brackets">[ &gt; ]</span>
              <span className="portal-caption">
                {bossDefeated ? 'PORTAL ACTIVO' : 'BLOQUEADO'}
              </span>
            </div>
          </div>

          {/* Protagonista en el mundo 2D */}
          <div
            className="exploration-player-actor"
            style={{ left: `${state.playerX}px` }}
            data-player-x={state.playerX}
          >
            <PlayerSprite fx={state.animState} facing={state.facing} />
          </div>

          <div className="exploration-floor-track" aria-hidden="true" />
        </div>
      </section>

      {/* Banner de aviso contextual según cercanía */}
      <div className="exploration-prompt-bar" role="status" aria-live="polite">
        <span>
          {state.activePrompt
            ? state.activePrompt.label
            : bossDefeated
              ? '✔ Camino despejado: camina hacia la derecha hasta el portal [ > ].'
              : `Camina hacia la derecha (X: ${state.playerX}m) para visitar a Byte o enfrentar a ${boss.name}.`}
        </span>
      </div>

      {/* Controles táctiles y de teclado en pantalla */}
      <div className="exploration-controls" aria-label="Controles de movimiento">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => moveStep('left')}
        >
          ◀ Izquierda [A]
        </button>
        <button
          type="button"
          className="btn"
          disabled={!state.activePrompt}
          onClick={handleInteract}
        >
          ⚡ Interactuar [E]
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => moveStep('right')}
        >
          Derecha [D] ▶
        </button>
      </div>

      {/* Modal/Sección de Tienda cuando el jugador habla con Byte */}
      {state.shopOpen && (
        <div className="exploration-shop-drawer">
          <CoffeeShop
            playerHp={playerHp}
            coins={coins}
            coffees={coffees}
            onBuyCoffee={onBuyCoffee}
            onUseCoffee={onUseCoffee}
            onProgressionChange={onProgressionChange}
          />
        </div>
      )}
    </main>
  )
}

export default Exploration
