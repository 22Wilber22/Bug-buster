function CombatEffects({ effect }) {
  if (!effect) return null

  return (
    <div className={`combat-effects-layer effect-kind-${effect.kind}`} aria-hidden="true">
      {effect.enemyPopup && (
        <div
          key={`enemy-${effect.id}`}
          className={`floating-popup popup-enemy popup-${effect.enemyPopup.tone || 'damage'}`}
        >
          {effect.enemyPopup.text}
        </div>
      )}

      {effect.playerPopup && (
        <div
          key={`player-${effect.id}`}
          className={`floating-popup popup-player popup-${effect.playerPopup.tone || 'damage'}`}
        >
          {effect.playerPopup.text}
        </div>
      )}

      {effect.kind === 'debug-hit' && (
        <div className="fx-burst fx-burst-enemy fx-debug-scan">
          <span className="fx-code-bit">01</span>
          <span className="fx-code-bit">{'</>'}</span>
          <span className="fx-code-bit">BUG!</span>
        </div>
      )}

      {effect.kind === 'special-hit' && (
        <div className="fx-burst fx-burst-enemy fx-special-lightning">
          <span className="fx-bolt">⚡</span>
          <span className="fx-code-bit">REFACTOR x2</span>
          <span className="fx-bolt">⚡</span>
        </div>
      )}

      {effect.kind === 'comment-shield' && (
        <div className="fx-burst fx-burst-player fx-comment-barrier">
          <span className="fx-code-bit">{'/* BLOCK */'}</span>
        </div>
      )}

      {effect.kind === 'coffee-heal' && (
        <div className="fx-burst fx-burst-player fx-coffee-particles">
          <span className="fx-heal-plus">+HP</span>
          <span className="fx-heal-plus">☕</span>
          <span className="fx-heal-plus">+</span>
        </div>
      )}

      {effect.kind === 'boss-hit' && (
        <div className="fx-burst fx-burst-player fx-boss-strike">
          <span className="fx-impact-spark">💥</span>
        </div>
      )}

      {effect.kind === 'boss-blocked' && (
        <div className="fx-burst fx-burst-player fx-comment-barrier">
          <span className="fx-code-bit">🛡 BLOQUEADO</span>
        </div>
      )}
    </div>
  )
}

export default CombatEffects
