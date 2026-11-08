import GameHud from '../components/GameHud'
import CoffeeShop from '../components/CoffeeShop'
import { PLAYER_MAX_HP } from '../engine/battle'
import { playSfx } from '../engine/sound'

function Clue({
  boss,
  nextBoss,
  playerHp = PLAYER_MAX_HP,
  coins = 0,
  coffees = 0,
  onBuyCoffee,
  onUseCoffee,
  onNext,
  onMap,
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
      <h2>Pista encontrada</h2>
      <p className="good">
        🪙 Recibiste +{boss.rewardCoins ?? 30} monedas por derrotar a {boss.name}.
      </p>
      <p className="muted">Entre los restos encontrás algo:</p>
      <blockquote className="clue">{boss.clue}</blockquote>
      <CoffeeShop
        playerHp={playerHp}
        coins={coins}
        coffees={coffees}
        onBuyCoffee={onBuyCoffee}
        onUseCoffee={onUseCoffee}
      />
      <div className="actions">
        <button
          className="btn"
          onClick={() => {
            playSfx('click')
            onNext()
          }}
        >
          {nextBoss ? `Enfrentar a ${nextBoss.name}` : 'Continuar'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            playSfx('click')
            onMap()
          }}
        >
          Volver al mapa
        </button>
      </div>
    </main>
  )
}

export default Clue
