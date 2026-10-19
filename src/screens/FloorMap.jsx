import { bosses } from '../data/bosses'
import { floors } from '../data/floors'
import { PLAYER_MAX_HP } from '../engine/battle'
import { COFFEE_COST, COFFEE_HEAL } from '../engine/save'
import { playSfx } from '../engine/sound'
import GameHud from '../components/GameHud'

function isUnlocked(bossIds, index, defeated) {
  return index === 0 || defeated.includes(bossIds[index - 1])
}

function BossButton({ boss, unlocked, defeated, onSelect }) {
  const status = defeated ? '✔ ' : unlocked ? '▶ ' : '🔒 '
  return (
    <button
      className="btn boss-btn"
      disabled={!unlocked}
      onClick={() => {
        playSfx('click')
        onSelect(boss.id)
      }}
    >
      {status}{boss.name} <span className="muted">(+{boss.rewardCoins ?? 30} 🪙)</span>
    </button>
  )
}

function FloorMap({
  defeatedBossIds,
  playerHp = PLAYER_MAX_HP,
  coins = 0,
  coffees = 0,
  onBuyCoffee,
  onUseCoffee,
  onSelectBoss,
  onMenu,
  muted,
  onToggleMute,
}) {
  const canBuy = coins >= COFFEE_COST
  const canDrink = coffees > 0 && playerHp < PLAYER_MAX_HP

  return (
    <main className="screen">
      <GameHud
        onMenu={onMenu}
        muted={muted}
        onToggleMute={onToggleMute}
        coins={coins}
        coffees={coffees}
      />
      <h2>Mapa de pisos</h2>
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
      <ul className="floors">
        {floors.map((floor) => (
          <li key={floor.id} className={`floor ${floor.comingSoon ? 'floor-soon' : ''}`}>
            <h3>Piso {floor.name}</h3>
            {floor.comingSoon ? (
              <p className="muted">Próximamente</p>
            ) : (
              <div className="boss-list">
                {floor.bossIds.map((id, index) => (
                  <BossButton
                    key={id}
                    boss={bosses.find((boss) => boss.id === id)}
                    unlocked={isUnlocked(floor.bossIds, index, defeatedBossIds)}
                    defeated={defeatedBossIds.includes(id)}
                    onSelect={onSelectBoss}
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default FloorMap
