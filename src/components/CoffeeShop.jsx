import { PLAYER_MAX_HP } from '../engine/battle'
import { COFFEE_COST, COFFEE_HEAL } from '../engine/save'
import { playSfx } from '../engine/sound'

function CoffeeShop({
  playerHp = PLAYER_MAX_HP,
  coins = 0,
  coffees = 0,
  onBuyCoffee,
  onUseCoffee,
}) {
  const canBuy = coins >= COFFEE_COST
  const canDrink = coffees > 0 && playerHp < PLAYER_MAX_HP

  return (
    <section className="coffee-shop" aria-label="Máquina de café">
      <div className="coffee-shop-info">
        <strong>☕ Máquina de Café TechCorp</strong>
        <p className="muted">
          Tu vida: {playerHp}/{PLAYER_MAX_HP} HP · Monedas: {coins} 🪙 · Cafés: {coffees} ☕
        </p>
      </div>
      <div className="actions">
        <button
          className="btn btn-coffee"
          type="button"
          disabled={!canBuy}
          onClick={() => {
            playSfx('heal')
            onBuyCoffee?.()
          }}
        >
          Comprar Café (+{COFFEE_HEAL} HP) · {COFFEE_COST} 🪙
        </button>
        {coffees > 0 && (
          <button
            className="btn"
            type="button"
            disabled={!canDrink}
            onClick={() => {
              playSfx('heal')
              onUseCoffee?.(Math.min(PLAYER_MAX_HP, playerHp + COFFEE_HEAL))
            }}
          >
            Tomar Café ahora (+{COFFEE_HEAL} HP)
          </button>
        )}
      </div>
    </section>
  )
}

export default CoffeeShop
