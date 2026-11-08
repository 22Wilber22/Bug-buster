import { bosses } from '../data/bosses'
import { floors } from '../data/floors'
import { PLAYER_MAX_HP } from '../engine/battle'
import { playSfx } from '../engine/sound'
import GameHud from '../components/GameHud'
import CoffeeShop from '../components/CoffeeShop'

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
      <CoffeeShop
        playerHp={playerHp}
        coins={coins}
        coffees={coffees}
        onBuyCoffee={onBuyCoffee}
        onUseCoffee={onUseCoffee}
      />
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
