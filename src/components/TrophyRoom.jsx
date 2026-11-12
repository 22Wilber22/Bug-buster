import { useState } from 'react'
import { ACHIEVEMENTS_CATALOG } from '../engine/progression'
import { playSfx } from '../engine/sound'
import { PixelCoinIcon, PixelMedalSprite } from './PixelIcons'

function TrophyRoom({
  unlockedIds = [],
  defeatedBossIds = [],
  defeatedCount = 0,
  purchaseCount = 0,
  collectibleCount = 0,
  coins = 0,
}) {
  const [filter, setFilter] = useState('all')
  const unlockedSet = new Set(unlockedIds)
  const totalCount = ACHIEVEMENTS_CATALOG.length
  const unlockedCount = unlockedSet.size
  const percent = Math.round((unlockedCount / Math.max(1, totalCount)) * 100)

  const filtered = ACHIEVEMENTS_CATALOG.filter((ach) => {
    if (filter === 'unlocked') return unlockedSet.has(ach.id)
    if (filter === 'pending') return !unlockedSet.has(ach.id)
    return true
  })

  const htmlCleared = ['tag-fantasma', 'etiqueta-roja', 'html-corrupto'].filter((id) =>
    defeatedBossIds.includes(id),
  ).length
  const cssCleared = ['selector-oscuro', 'flexbox-caotico', 'rey-responsive'].filter((id) =>
    defeatedBossIds.includes(id),
  ).length

  const getProgressLabel = (ach, isUnlocked) => {
    if (isUnlocked) return 'Completado (100%)'
    if (ach.id === 'first-debug') return `${Math.min(1, defeatedCount)} / 1 jefe`
    if (ach.id === 'floor-html-clear') {
      const count = defeatedBossIds.length > 0 ? htmlCleared : Math.min(3, defeatedCount)
      return `${count} / 3 jefes HTML`
    }
    if (ach.id === 'floor-css-clear') return `${cssCleared} / 3 jefes CSS`
    if (ach.id === 'full-stack-hero') return `${Math.min(12, defeatedCount)} / 12 jefes`
    if (ach.id === 'first-purchase') return `${Math.min(1, purchaseCount)} / 1 compra`
    if (ach.id === 'collector-cyber') return `${Math.min(3, collectibleCount)} / 3 ítems`
    if (ach.id === 'saver-senior') return `${Math.min(100, coins)} / 100 monedas`
    return '0 / 1 completado'
  }

  const changeFilter = (next) => {
    playSfx('click')
    setFilter(next)
  }

  return (
    <div className="trophy-room" role="region" aria-label="Colección de Trofeos">
      <div className="trophy-summary-bar">
        <div className="trophy-progress-info">
          <strong className="trophy-title">SALA DE TROFEOS TECHCORP</strong>
          <span className="trophy-counter">
            {unlockedCount} de {totalCount} medallas desbloqueadas ({percent}%)
          </span>
        </div>
        <div className="trophy-progress-track" aria-hidden="true">
          <div className="trophy-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="trophy-filters" role="group" aria-label="Filtrar logros">
          <button
            type="button"
            className={`btn btn-secondary trophy-filter-btn ${filter === 'all' ? 'shop-tab-active' : ''}`}
            onClick={() => changeFilter('all')}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            className={`btn btn-secondary trophy-filter-btn ${filter === 'unlocked' ? 'shop-tab-active' : ''}`}
            onClick={() => changeFilter('unlocked')}
          >
            Desbloqueados ({unlockedCount})
          </button>
          <button
            type="button"
            className={`btn btn-secondary trophy-filter-btn ${filter === 'pending' ? 'shop-tab-active' : ''}`}
            onClick={() => changeFilter('pending')}
          >
            Pendientes ({totalCount - unlockedCount})
          </button>
        </div>
      </div>

      <div className="trophy-grid">
        {filtered.map((ach) => {
          const isUnlocked = unlockedSet.has(ach.id)
          return (
            <article
              key={ach.id}
              className={`trophy-card achievement-card ${isUnlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
            >
              <div className="trophy-medal-col">
                <PixelMedalSprite unlocked={isUnlocked} category={ach.category} size={42} />
              </div>
              <div className="trophy-body-col">
                <div className="trophy-card-head">
                  <h4 className="trophy-name">{ach.name}</h4>
                  <span className="trophy-reward">
                    <PixelCoinIcon size={13} /> +{ach.rewardCoins}
                  </span>
                </div>
                <p className="trophy-desc">{ach.description}</p>
                <div className="trophy-meta-row">
                  <span className="trophy-progress-tag">{getProgressLabel(ach, isUnlocked)}</span>
                  <span className={`trophy-status-pill ${isUnlocked ? 'is-unlocked' : 'is-pending'}`}>
                    {isUnlocked ? 'DESBLOQUEADO' : 'PENDIENTE'}
                  </span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default TrophyRoom
