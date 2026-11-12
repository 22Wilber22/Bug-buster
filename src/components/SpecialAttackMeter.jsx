import { MAX_STREAK } from '../engine/battle'

function SpecialAttackMeter({ streak = 0, maxStreak = MAX_STREAK, shielded = false }) {
  const ready = streak >= maxStreak

  return (
    <div
      className={`special-meter ${ready ? 'special-meter-ready' : ''} ${shielded ? 'special-meter-shielded' : ''}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="special-meter-info">
        <span className="special-bolt" aria-hidden="true">⚡</span>
        <span className="special-meter-label">
          Carga Ataque Especial: <strong>{streak}/{maxStreak}</strong>
        </span>
        {ready && <span className="special-ready-badge">¡LISTO (Daño x2)!</span>}
      </div>

      <div className="special-slots" aria-hidden="true">
        {Array.from({ length: maxStreak }, (_, idx) => (
          <span
            key={idx}
            className={`special-slot ${idx < streak ? 'slot-filled' : 'slot-empty'}`}
          />
        ))}
      </div>

      {shielded && (
        <span className="shield-active-pill">
          🛡 Comentario activo: bloquea el próximo ataque
        </span>
      )}
    </div>
  )
}

export default SpecialAttackMeter
