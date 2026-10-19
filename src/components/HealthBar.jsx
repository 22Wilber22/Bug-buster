function HealthBar({ label, current, max, tone = 'player' }) {
  const percent = Math.round((current / max) * 100)
  const fillClass = tone === 'enemy'
    ? 'health-fill health-fill-enemy'
    : `health-fill ${percent <= 30 ? 'low' : ''}`
  return (
    <div className={`health health-${tone}`}>
      <div className="health-label">
        <span>{label}</span>
        <span>{current}/{max}</span>
      </div>
      <div className="health-track">
        <div className={fillClass} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default HealthBar
