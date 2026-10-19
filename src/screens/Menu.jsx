import PlayerSprite from '../components/PlayerSprite'
import GameHud from '../components/GameHud'
import { canContinue, canResume } from '../engine/save'
import { playSfx } from '../engine/sound'

function Menu({ save, onResume, onNewGame, onContinue, muted, onToggleMute }) {
  const resume = canResume(save)
  const cont = canContinue(save)

  const handleClick = (callback) => () => {
    playSfx('click')
    callback?.()
  }

  return (
    <main className="screen intro menu">
      <div className="intro-fallback" />
      <div className="intro-hud">
        <GameHud muted={muted} onToggleMute={onToggleMute} />
      </div>
      <div className="intro-content">
        <PlayerSprite />
        <h1 className="title">Bug Buster</h1>
        <p className="menu-subtitle">El Piso Vacío</p>
        <p className="muted">RPG educativo por turnos. Depurá el piso HTML.</p>
        <div className="actions menu-actions">
          {resume && (
            <button className="btn" type="button" onClick={handleClick(onResume)}>Reanudar</button>
          )}
          <button className="btn" type="button" onClick={handleClick(onNewGame)}>Nueva partida</button>
          <button className="btn btn-secondary" type="button" disabled={!cont} onClick={handleClick(onContinue)}>
            Continuar desde el último jefe vencido
          </button>
        </div>
      </div>
    </main>
  )
}

export default Menu
