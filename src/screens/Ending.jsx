import GameHud from '../components/GameHud'
import { playSfx } from '../engine/sound'

function Victory({ onMap }) {
  return (
    <>
      <h2 className="good">¡Edificio TechCorp completamente depurado!</h2>
      <p>
        Derrotaste a los 12 jefes a través de los 4 pisos: HTML (El Piso Vacío),
        CSS (El Reino Desordenado), JavaScript (El Bucle Infinito) y React (La Última Renderización).
      </p>
      <p className="muted">
        El Render Infinito colapsó y los servidores volvieron a estar en verde.
        Podés volver al mapa cuando quieras para repasar cualquier piso o desafío.
      </p>
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
      <p>{boss?.name ?? 'El jefe'} sigue suelto en el código.</p>
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

function Ending({ won, boss, onRetry, onMap, onMenu, muted, onToggleMute, coins, coffees }) {
  return (
    <main className="screen">
      <GameHud onMenu={onMenu} muted={muted} onToggleMute={onToggleMute} coins={coins} coffees={coffees} />
      {won ? <Victory onMap={onMap} /> : <Defeat boss={boss} onRetry={onRetry} onMap={onMap} />}
    </main>
  )
}

export default Ending
