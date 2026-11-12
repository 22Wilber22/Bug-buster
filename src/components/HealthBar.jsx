const SEGMENTS = 12

function HealthBar({ label, current, max, tone = 'player', level }) {
  const safeMax = Math.max(1, max || 1)
  const safeCurrent = Math.max(0, Math.min(safeMax, current ?? 0))
  const percent = Math.round((safeCurrent / safeMax) * 100)
  const isEnemy = tone === 'enemy'
  const isLow = !isEnemy && percent <= 30
  const filledSegments = Math.ceil((safeCurrent / safeMax) * SEGMENTS)
  const displayLevel = level ?? (isEnemy ? 5 : 6)

  const fillClass = isEnemy
    ? 'health-fill health-fill-enemy'
    : `health-fill ${isLow ? 'low' : ''}`

  return (
    <div
      className={`health health-${tone} ${isLow ? 'health-critical' : ''}`.trim()}
      role="region"
      aria-label={`Vida de ${label}: ${safeCurrent} de ${safeMax}`}
    >
      <div className="health-header">
        <span className="health-identity">
          <span className="health-role-icon" aria-hidden="true">
            {isEnemy ? (
              <svg viewBox="0 0 16 16" className="rpg-svg-icon">
                <path
                  fill="currentColor"
                  d="M5 2h6v2h2v2h-1v2h2v2h-2v2h1v2h-2v1H5v-1H3v-2h1v-2H2V8h2V6H3V4h2V2zm1 3v2h4V5H6zm0 4v2h4V9H6z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="rpg-svg-icon">
                <path
                  fill="currentColor"
                  d="M6 2h4v4H6V2zm-2 6h8v2h1v4H3v-4h1V8z"
                />
              </svg>
            )}
          </span>
          <span className="health-name">{label}</span>
        </span>
        <span className="health-level">Nv. {displayLevel}</span>
      </div>

      <div className="health-bar-row">
        <span className="health-heart" aria-hidden="true">
          <svg viewBox="0 0 16 16" className="rpg-svg-icon">
            <path
              fill="currentColor"
              d="M2 4h4v2h4V4h4v4h-2v2h-2v2H6v-2H4V8H2V4z"
            />
          </svg>
        </span>
        <div className="health-track" aria-hidden="true">
          <div className={fillClass} style={{ width: `${percent}%` }} />
          <div className="health-segments">
            {Array.from({ length: SEGMENTS }, (_, idx) => (
              <span
                key={idx}
                className={`health-seg ${idx < filledSegments ? 'seg-active' : 'seg-empty'}`}
              />
            ))}
          </div>
        </div>
        <span className="health-numbers">
          {safeCurrent} / {safeMax}
        </span>
      </div>
    </div>
  )
}

export default HealthBar
