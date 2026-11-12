import { useState } from 'react'
import { isMuted, playSfx, toggleMuted } from '../engine/sound'
import { PixelCoinIcon, PixelStatIcon } from './PixelIcons'

function BattleHeader({ onMenu, muted: mutedProp, onToggleMute, coins, coffees, showBrand = true }) {
  const [localMuted, setLocalMuted] = useState(() => isMuted())
  const muted = mutedProp !== undefined ? mutedProp : localMuted
  const showInventory = typeof coins === 'number' || typeof coffees === 'number'

  const handleToggle = () => {
    if (onToggleMute) {
      onToggleMute()
      return
    }
    const next = toggleMuted()
    setLocalMuted(next)
    if (!next) playSfx('click')
  }

  const handleMenu = () => {
    playSfx('click')
    onMenu?.()
  }

  return (
    <header className="game-hud battle-header">
      {showBrand && (
        <div className="hud-brand" aria-hidden="true">
          <span className="hud-brand-icon">
            <svg viewBox="0 0 20 20" className="hud-svg-icon">
              <path
                fill="currentColor"
                d="M7 2h6v2h2v3h3v2h-3v2h3v2h-3v3h-2v2H7v-2H5v-3H2v-2h3V9H2V7h3V4h2V2zm2 4v2h2V6H9zm0 4v4h2v-4H9z"
              />
            </svg>
          </span>
          <span className="hud-brand-text">
            <strong className="brand-cyan">Bug</strong> <strong className="brand-white">Buster</strong>
          </span>
        </div>
      )}

      {showInventory && (
        <div className="hud-stats" aria-label="Inventario">
          <span className="hud-stat hud-stat-coin" title="Monedas">
            <PixelCoinIcon size={16} />
            <strong>{coins ?? 0}</strong>
          </span>
          <span className="hud-stat hud-stat-coffee" title="Cafés curativos">
            <PixelStatIcon type="coffee" size={16} />
            <strong>{coffees ?? 0}</strong>
          </span>
        </div>
      )}

      <div className="hud-controls">
        <button
          className={`btn hud-menu-btn hud-sound-btn ${muted ? 'btn-secondary' : 'hud-sound-on'}`}
          type="button"
          onClick={handleToggle}
          aria-pressed={muted}
        >
          {muted ? '🔇 Mutear: OFF' : '🔊 Sonido: ON'}
        </button>
        {onMenu && (
          <button className="btn btn-secondary hud-menu-btn hud-home-btn" type="button" onClick={handleMenu}>
            <span aria-hidden="true">🏠 </span>Volver al menú principal
          </button>
        )}
      </div>
    </header>
  )
}

export default BattleHeader
