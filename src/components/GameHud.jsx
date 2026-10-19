import { useState } from 'react'
import { isMuted, playSfx, toggleMuted } from '../engine/sound'

function GameHud({ onMenu, muted: mutedProp, onToggleMute, coins, coffees }) {
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
    <div className="game-hud">
      {showInventory && (
        <div className="hud-stats" aria-label="Inventario">
          <span className="hud-stat" title="Monedas">🪙 {coins ?? 0}</span>
          <span className="hud-stat" title="Cafés curativos">☕ {coffees ?? 0}</span>
        </div>
      )}
      <div className="hud-controls">
        <button
          className={`btn hud-menu-btn ${muted ? 'btn-secondary' : ''}`}
          type="button"
          onClick={handleToggle}
          aria-pressed={muted}
        >
          {muted ? '🔇 Mutear: OFF' : '🔊 Sonido: ON'}
        </button>
        {onMenu && (
          <button className="btn btn-secondary hud-menu-btn" type="button" onClick={handleMenu}>
            Volver al menú principal
          </button>
        )}
      </div>
    </div>
  )
}

export default GameHud
