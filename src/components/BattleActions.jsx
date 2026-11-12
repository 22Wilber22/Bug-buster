import { canComment, canRefactor, MAX_STREAK, PLAYER_MAX_HP } from '../engine/battle'
import { COFFEE_HEAL } from '../engine/save'
import ActionButton from './ActionButton'

function BattleActions({ state, onAction, busy = false, coffees = 0, onDrinkCoffee }) {
  const choosing = state.phase === 'choose' && !busy
  const commentAllowed = choosing && canComment(state)
  const refactorReady = choosing && canRefactor(state)
  const canDrink = choosing && coffees > 0 && state.playerHp < PLAYER_MAX_HP

  return (
    <div className="actions battle-actions-grid" role="group" aria-label="Acciones de combate">
      <ActionButton
        variant="comment"
        title={`Escudo · Comentar (${state.commentsLeft})`}
        subtitle="Bloquea el próximo golpe"
        disabled={!commentAllowed}
        onClick={() => onAction({ type: 'comment' })}
      />
      <ActionButton
        variant="debug"
        title="Debug"
        subtitle="Corrige el error"
        disabled={!choosing}
        onClick={() => onAction({ type: 'debug' })}
      />
      <ActionButton
        variant="special"
        title={`⚡ Ataque Especial (${state.streak}/${MAX_STREAK})`}
        subtitle="Daño x2"
        disabled={!refactorReady}
        ready={refactorReady}
        onClick={() => onAction({ type: 'refactor' })}
      />
      {onDrinkCoffee && (
        <ActionButton
          variant="coffee"
          title={`☕ Tomar Café (${coffees})`}
          subtitle={`+${COFFEE_HEAL} HP`}
          disabled={!canDrink}
          onClick={onDrinkCoffee}
          titleAttr={`Restaura +${COFFEE_HEAL} HP`}
        />
      )}
    </div>
  )
}

export default BattleActions
