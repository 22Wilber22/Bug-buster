import { Fragment, useState } from 'react'
import { bosses, BOSS_SPRITES } from '../data/bosses'
import { floors, isFloorUnlocked, isBossUnlocked } from '../data/floors'
import { PLAYER_MAX_HP } from '../engine/battle'
import { playSfx } from '../engine/sound'
import GameHud from '../components/GameHud'
import CoffeeShop from '../components/CoffeeShop'
import { PixelCoinIcon, PixelStatIcon } from '../components/PixelIcons'

function BossButton({ boss, unlocked, defeated, onSelect }) {
  if (!boss) return null
  const status = defeated ? '[OK] ' : unlocked ? '▶ ' : '[LOCK] '
  return (
    <button
      type="button"
      className="btn boss-btn"
      disabled={!unlocked}
      onClick={() => {
        playSfx('click')
        onSelect(boss.id)
      }}
    >
      {status}
      {boss.name}{' '}
      <span className="muted">
        (+{boss.rewardCoins ?? 30} <PixelCoinIcon size={13} />)
      </span>
    </button>
  )
}

function FloorMap({
  defeatedBossIds = [],
  playerHp = PLAYER_MAX_HP,
  coins = 0,
  coffees = 0,
  onBuyCoffee,
  onUseCoffee,
  onProgressionChange,
  onSelectBoss,
  onExploreFloor,
  onMenu,
  muted,
  onToggleMute,
}) {
  // Por defecto mostramos la Ruta de Nodos limpia; la Tienda Byte se abre desde la pestaña o el nodo seguro
  const [viewMode, setViewMode] = useState('map')

  const floorStates = floors.map((floor, floorIndex) => {
    const floorUnlocked = !floor.comingSoon && isFloorUnlocked(floorIndex, defeatedBossIds)
    const floorCompleted =
      floor.bossIds.length > 0 && floor.bossIds.every((id) => defeatedBossIds.includes(id))
    const defeatedCount = floor.bossIds.filter((id) => defeatedBossIds.includes(id)).length
    return {
      floor,
      floorIndex,
      floorUnlocked,
      floorCompleted,
      defeatedCount,
    }
  })

  const activeFloorEntry = floorStates.find((entry) => entry.floorUnlocked && !entry.floorCompleted)
  const currentFloorIndex = activeFloorEntry
    ? activeFloorEntry.floorIndex
    : floorStates.every((entry) => entry.floorCompleted)
      ? floors.length - 1
      : 0

  const showShopPanel = viewMode === 'all' || viewMode === 'shop'
  const showMapPanel = viewMode === 'all' || viewMode === 'map'

  const handleSelectView = (mode) => {
    playSfx('click')
    setViewMode(mode)
  }

  return (
    <main className="screen floor-map-screen">
      <GameHud
        onMenu={onMenu}
        muted={muted}
        onToggleMute={onToggleMute}
        coins={coins}
        coffees={coffees}
      />

      <header className="map-command-header">
        <div className="map-title-block">
          <h2>Mapa de Progresión — Torre TechCorp</h2>
          <p className="muted map-subtitle">
            Seleccioná un nodo desbloqueado para iniciar la depuración o recorré el piso en 2D.
          </p>
        </div>

        <div className="map-view-Toggle shop-tabs" role="tablist" aria-label="Vista del mapa y tienda">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'map'}
            className={`shop-tab-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => handleSelectView('map')}
          >
            [◈] Ruta de Nodos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'shop'}
            className={`shop-tab-btn ${viewMode === 'shop' ? 'active' : ''}`}
            onClick={() => handleSelectView('shop')}
          >
            <PixelStatIcon type="coffee" size={14} />
            <span>Tienda Byte</span>
            <span className="map-shop-coin-pill">
              <PixelCoinIcon size={13} /> {coins}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'all'}
            className={`shop-tab-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectView('all')}
          >
            [≡] Vista Completa
          </button>
        </div>
      </header>

      {/* Ruta Superior de la Torre TechCorp */}
      <section className="tower-circuit-bar" aria-label="Progresión de la Torre TechCorp">
        {floorStates.map(({ floor, floorIndex, floorUnlocked, floorCompleted }) => {
          const isCurrent = floorIndex === currentFloorIndex
          const stateClass = floorCompleted
            ? 'circuit-completed'
            : isCurrent
              ? 'circuit-current'
              : floorUnlocked
                ? 'circuit-unlocked'
                : 'circuit-locked'

          return (
            <Fragment key={floor.id}>
              <div
                className={`tower-circuit-step floor-theme-${floor.id} ${stateClass}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCurrent && (
                  <span className="tower-position-badge">▶ POSICIÓN ACTUAL</span>
                )}
                <span className="tower-circuit-label">
                  Piso {floorIndex + 1}: {floor.name}
                </span>
                <span className="tower-circuit-status muted">
                  {floorCompleted
                    ? '✔ Depurado'
                    : floorUnlocked
                      ? '▶ Activo'
                      : '[LOCK] Bloqueado'}
                </span>
              </div>

              {floorIndex < floors.length - 1 && (
                <span
                  className={`tower-circuit-connector ${floorCompleted ? 'connector-active' : ''}`}
                  aria-hidden="true"
                >
                  ──►
                </span>
              )}
            </Fragment>
          )
        })}
      </section>

      {/* Tienda Integrada */}
      {showShopPanel && (
        <section className="map-shop-section" aria-label="Tienda Byte">
          <CoffeeShop
            playerHp={playerHp}
            coins={coins}
            coffees={coffees}
            onBuyCoffee={onBuyCoffee}
            onUseCoffee={onUseCoffee}
            onProgressionChange={onProgressionChange}
          />
        </section>
      )}

      {/* Mapa Visual de Nodos por Piso */}
      {showMapPanel && (
        <ul className="floors progression-map-list">
          {floorStates.map(
            ({ floor, floorIndex, floorUnlocked, floorCompleted, defeatedCount }) => {
              const isCurrentFloor = floorIndex === currentFloorIndex
              const nextFloor = floors[floorIndex + 1]

              return (
                <li
                  key={floor.id}
                  className={`floor floor-theme-${floor.id} ${!floorUnlocked ? 'floor-locked' : ''} ${floorCompleted ? 'floor-completed' : ''} ${isCurrentFloor ? 'floor-current' : ''}`.trim()}
                >
                  <div className="floor-header">
                    <div className="floor-title-group">
                      <h3>
                        Piso {floorIndex + 1} — {floor.name}
                        {floor.subtitle ? `: ${floor.subtitle}` : ''}
                      </h3>
                      {isCurrentFloor && (
                        <span className="floor-current-pill">▶ POSICIÓN ACTUAL</span>
                      )}
                    </div>
                    <span className="floor-status muted">
                      {floorCompleted
                        ? '✔ Depurado (3/3)'
                        : floorUnlocked
                          ? `▶ Desbloqueado (${defeatedCount}/3)`
                          : '[LOCK] Bloqueado'}
                    </span>
                  </div>

                  {!floorUnlocked && floorIndex > 0 && (
                    <p className="muted floor-lock-msg">
                      Derrota a los 3 jefes del Piso {floors[floorIndex - 1].name} para
                      desbloquear este piso.
                    </p>
                  )}

                  {floorUnlocked && onExploreFloor && (
                    <div className="floor-explore-row">
                      <button
                        type="button"
                        className="btn btn-secondary floor-explore-btn"
                        onClick={() => {
                          playSfx('click')
                          onExploreFloor(floor.id)
                        }}
                      >
                        [2D] Explorar piso en 2D
                      </button>
                    </div>
                  )}

                  {/* Ruta de Nodos Conectados del Piso */}
                  <div
                    className="floor-node-track"
                    role="group"
                    aria-label={`Ruta de nodos del Piso ${floorIndex + 1}: ${floor.name}`}
                  >
                    {/* Nodo Inicial de Zona: Tienda Byte / Descanso */}
                    <div
                      className={`map-node map-node-shop ${floorUnlocked ? 'node-unlocked' : 'node-locked'}`}
                    >
                      <span className="map-node-step-tag">ZONA SEGURA</span>
                      <div className="map-node-icon-wrap">
                        <PixelStatIcon type="coffee" size={22} />
                      </div>
                      <strong className="map-node-title">Tienda Byte / Descanso</strong>
                      <span className="map-node-state muted">
                        {floorUnlocked ? 'Disponible' : 'Bloqueado'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-coffee map-node-shop-btn"
                        disabled={!floorUnlocked}
                        onClick={() => handleSelectView(viewMode === 'map' ? 'all' : 'shop')}
                      >
                        Abastecer
                      </button>
                    </div>

                    {/* 3 Nodos de Jefes unidos por conectores visuales */}
                    {floor.bossIds.map((id, bossIndex) => {
                      const boss = bosses.find((item) => item.id === id)
                      const unlocked =
                        floorUnlocked && isBossUnlocked(floorIndex, bossIndex, defeatedBossIds)
                      const defeated = defeatedBossIds.includes(id)
                      const spriteSrc = BOSS_SPRITES[id]
                      const encounterLabel =
                        bossIndex === 2 ? 'JEFE DE PISO 3/3' : `${bossIndex + 1}/3`
                      const visualState = defeated
                        ? 'Depurado'
                        : unlocked
                          ? 'Disponible'
                          : 'Bloqueado'
                      const nodeStateClass = defeated
                        ? 'node-defeated'
                        : unlocked
                          ? 'node-available'
                          : 'node-locked'

                      return (
                        <Fragment key={id}>
                          <div
                            className={`map-node-connector ${unlocked || defeated ? 'connector-unlocked' : 'connector-locked'}`}
                            aria-hidden="true"
                          >
                            <span className="connector-line">──►</span>
                          </div>

                          <div
                            className={`map-node map-node-boss ${nodeStateClass} ${bossIndex === 2 ? 'map-node-floor-boss' : ''}`}
                          >
                            <div className="map-node-meta">
                              <span className="map-node-encounter">{encounterLabel}</span>
                              <span className={`map-node-badge state-${visualState.toLowerCase()}`}>
                                {visualState}
                              </span>
                            </div>

                            {spriteSrc && (
                              <div className="map-node-sprite-frame">
                                <img
                                  src={spriteSrc}
                                  alt={boss?.name || id}
                                  className="boss-title-mini-sprite map-node-boss-sprite"
                                />
                              </div>
                            )}

                            <div className="map-node-reward">
                              <span>+{boss?.rewardCoins ?? 30}</span>
                              <PixelCoinIcon size={13} />
                            </div>

                            <div className="boss-list">
                              <BossButton
                                boss={boss}
                                unlocked={unlocked}
                                defeated={defeated}
                                onSelect={onSelectBoss}
                              />
                            </div>
                          </div>
                        </Fragment>
                      )
                    })}

                    {/* Conector hacia el Portal de Salida */}
                    <div
                      className={`map-node-connector ${floorCompleted ? 'connector-unlocked' : 'connector-locked'}`}
                      aria-hidden="true"
                    >
                      <span className="connector-line">──►</span>
                    </div>

                    {/* Nodo Portal de Salida */}
                    <div
                      className={`map-node map-node-portal ${floorCompleted ? 'portal-active node-defeated' : 'portal-locked node-locked'}`}
                    >
                      <span className="map-node-step-tag">SALIDA</span>
                      <div className="map-portal-symbol" aria-hidden="true">
                        [ &gt; ]
                      </div>
                      <strong className="map-node-title">
                        {nextFloor ? `Portal a Piso ${floorIndex + 2}: ${nextFloor.name}` : 'Núcleo Central'}
                      </strong>
                      <span className="map-node-state muted">
                        {floorCompleted ? 'Portal Activo' : 'Requiere 3/3 jefes'}
                      </span>
                    </div>
                  </div>
                </li>
              )
            },
          )}
        </ul>
      )}
    </main>
  )
}

export default FloorMap
