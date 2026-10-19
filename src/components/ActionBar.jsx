import { canComment, canRefactor, MAX_STREAK, PLAYER_MAX_HP } from '../engine/battle'
import { COFFEE_HEAL } from '../engine/save'

function ActionBar({ state, onAction, busy = false, specialCharge, coffees = 0, onDrinkCoffee }) {
  const choosing = state.phase === 'choose' && !busy
  const charge = typeof specialCharge === 'number' ? Math.min(MAX_STREAK, specialCharge) : state.streak
  const refactorReady = choosing && (canRefactor(state) || charge >= MAX_STREAK)
  const canDrink = choosing && coffees > 0 && state.playerHp < PLAYER_MAX_HP

  return (
    <div className="actions">
      <button
        className="btn"
        disabled={busy || !canComment(state)}
        onClick={() => onAction({ type: 'comment' })}
      >
        Comentar ({state.commentsLeft})
      </button>
      <button
        className="btn"
        disabled={!choosing}
        onClick={() => onAction({ type: 'debug' })}
      >
        Debug
      </button>
      <button
        className="btn btn-special"
        disabled={!refactorReady}
        onClick={() => onAction({ type: 'refactor', force: true })}
      >
        ⚡ Ataque Especial ({charge}/{MAX_STREAK}) · Daño x2
      </button>
      {onDrinkCoffee && (
        <button
          className="btn btn-coffee"
          disabled={!canDrink}
          onClick={onDrinkCoffee}
          title={`Restaura +${COFFEE_HEAL} HP`}
        >
          ☕ Tomar Café ({coffees}) · +{COFFEE_HEAL} HP
        </button>
      )}
    </div>
  )
}

export default ActionBar
