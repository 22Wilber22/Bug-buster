import { BOSS_SPRITES } from '../data/bosses'
import { getEnemyProfile, getEnemyTelegraph } from '../engine/enemyPatterns'

function TurnBanner({ turnPhase, boss, finished }) {
  if (finished) {
    return (
      <div className="turn-banner turn-ended">
        <span className="turn-banner-text">■ COMBATE FINALIZADO</span>
        <span className="turn-cyber-stripes" aria-hidden="true">////</span>
      </div>
    )
  }
  if (turnPhase === 'boss-turn') {
    return (
      <div className="turn-banner turn-boss" role="status" aria-live="polite">
        <span className="turn-banner-text">
          ⚠ TURNO DEL JEFE · ¡{boss.name} ataca con «{boss.attackName}»!
        </span>
        <span className="turn-cyber-stripes" aria-hidden="true">////</span>
      </div>
    )
  }
  if (turnPhase === 'player-attack') {
    return (
      <div className="turn-banner turn-player" role="status" aria-live="polite">
        <span className="turn-banner-text">
          ⚡ TU TURNO · Ejecutando ataque contra {boss.name}...
        </span>
        <span className="turn-cyber-stripes" aria-hidden="true">////</span>
      </div>
    )
  }
  return (
    <div className="turn-banner turn-player" role="status" aria-live="polite">
      <span className="turn-banner-text">
        <span className="turn-arrow">▶</span> <strong>TU TURNO</strong> · Elegí tu acción
      </span>
      <span className="turn-cyber-stripes" aria-hidden="true">////</span>
    </div>
  )
}

function BattleStatus({
  boss,
  taunt,
  turnPhase,
  finished,
  turnCount = 0,
  bossHp = boss?.hp,
}) {
  const miniIcon = BOSS_SPRITES[boss.id]
  const profile = getEnemyProfile(boss.id)
  const telegraph = !finished ? getEnemyTelegraph(boss, turnCount, bossHp) : null

  return (
    <section className="battle-status-header" aria-label="Estado del combate">
      <div className="boss-title-row">
        {miniIcon && (
          <img
            src={miniIcon}
            alt=""
            aria-hidden="true"
            className="boss-title-mini-sprite"
            draggable={false}
          />
        )}
        <div className="boss-title-wrap">
          <div className="boss-title-headline">
            <h2 className="boss-main-title">{boss.name}</h2>
            <span className={`enemy-pattern-badge pattern-${profile.pattern}`}>
              {profile.archetype.badge}
            </span>
          </div>
          <div className="boss-title-underline" aria-hidden="true" />
        </div>
      </div>

      {taunt && (
        <div className="taunt-box">
          <p className="taunt">“{taunt}”</p>
        </div>
      )}

      {telegraph && (
        <div
          className={`enemy-telegraph-banner ${telegraph.urgent ? 'telegraph-urgent' : 'telegraph-normal'}`}
          role="note"
        >
          <span className="telegraph-badge">{telegraph.badge}</span>
          <span className="telegraph-text">{telegraph.message}</span>
        </div>
      )}

      <TurnBanner turnPhase={turnPhase} boss={boss} finished={finished} />
    </section>
  )
}

export default BattleStatus
