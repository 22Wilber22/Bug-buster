import GameHud from '../components/GameHud'
import { playSfx } from '../engine/sound'

function Victory({ onMap }) {
  return (
    <>
      <h2 className="good">Piso HTML depurado</h2>
      <p>
        El html Corrupto era el código que dejó el último dev antes de desaparecer.
        Pero en sus últimas líneas había un import a un archivo que todavía no existe...
      </p>
      <p className="muted">styles.css — Piso CSS: próximamente.</p>
      <div className="actions">
        <button
          className="btn"
          onClick={() => {
            playSfx('click')
            onMap()
          }}
        >
          Volver al mapa
        </button>
      </div>
    </>
  )
}

function Defeat({ boss, onRetry, onMap }) {
  return (
    <>
      <h2 className="bad">Game over</h2>
      <p>{boss.name} sigue suelto en el código.</p>
      <div className="actions">
        <button
          className="btn"
          onClick={() => {
            playSfx('click')
            onRetry()
          }}
        >
          Reintentar
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            playSfx('click')
            onMap()
          }}
        >
          Volver al mapa
        </button>
      </div>
    </>
  )
}

function Ending({ won, boss, onRetry, onMap, onMenu, muted, onToggleMute }) {
  return (
    <main className="screen">
      <GameHud onMenu={onMenu} muted={muted} onToggleMute={onToggleMute} />
      {won ? <Victory onMap={onMap} /> : <Defeat boss={boss} onRetry={onRetry} onMap={onMap} />}
    </main>
  )
}

export default Ending
