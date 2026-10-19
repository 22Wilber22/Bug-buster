import { useEffect, useRef, useState } from 'react'
import {
  battle, createBattle, restoreBattle, snapshotBattle, PLAYER_MAX_HP, MAX_STREAK,
} from '../engine/battle'
import { COFFEE_HEAL } from '../engine/save'
import { playSfx } from '../engine/sound'
import HealthBar from '../components/HealthBar'
import ActionBar from '../components/ActionBar'
import QuestionModal from '../components/QuestionModal'
import PlayerSprite from '../components/PlayerSprite'
import BossSprite from '../components/BossSprite'
import GameHud from '../components/GameHud'

function randomItem(list, fallback = '') {
  if (!list?.length) return fallback
  return list[Math.floor(Math.random() * list.length)]
}

function TurnIndicator({ turnPhase, boss, finished }) {
  if (finished) {
    return (
      <div className="turn-banner turn-ended">
        <span>■ COMBATE FINALIZADO</span>
      </div>
    )
  }
  if (turnPhase === 'boss-turn') {
    return (
      <div className="turn-banner turn-boss" role="status" aria-live="polite">
        <span>⚠ TURNO DEL JEFE · ¡{boss.name} ataca con «{boss.attackName}»!</span>
      </div>
    )
  }
  if (turnPhase === 'player-attack') {
    return (
      <div className="turn-banner turn-player" role="status" aria-live="polite">
        <span>⚡ TU TURNO · Ejecutando ataque contra {boss.name}...</span>
      </div>
    )
  }
  return (
    <div className="turn-banner turn-player" role="status" aria-live="polite">
      <span>▶ TU TURNO · Elegí tu acción</span>
    </div>
  )
}

function TurnFeedback({ lastTurn, turnPhase, bossName, attackName, attackQuote, healNote }) {
  if (!lastTurn && !healNote) return null
  const showBossStrike = turnPhase !== 'player-attack'

  return (
    <div className={`feedback ${turnPhase === 'boss-turn' ? 'feedback-boss-active' : ''}`}>
      {healNote && <p className="good">{healNote}</p>}
      {lastTurn && (
        <>
          <p className={lastTurn.correct ? 'good' : 'bad'}>
            <strong>[Tu turno]</strong>{' '}
            {lastTurn.correct ? `¡Correcto! Hiciste ${lastTurn.dealt} de daño.` : 'Incorrecto. No hiciste daño.'}
          </p>
          {!showBossStrike && (
            <p className="muted">Preparando el turno de {bossName}...</p>
          )}
          {showBossStrike && (lastTurn.blocked || lastTurn.taken > 0) && (
            <div className="boss-turn-box">
              {attackQuote && (
                <p className="boss-attack-quote">
                  <strong>[Turno de {bossName}]</strong> “{attackQuote}”
                </p>
              )}
              {lastTurn.blocked && (
                <p className="good">
                  🛡 ¡Tu comentario bloqueó el ataque «{attackName}» de {bossName}!
                </p>
              )}
              {lastTurn.taken > 0 && (
                <p className="bad">
                  💥 {lastTurn.critical && '¡ATAQUE CRÍTICO! '}
                  {bossName} usó <strong>{attackName}</strong> y te quitó {lastTurn.taken} de vida.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BattleResult({ phase, boss, onWin, onLose }) {
  const won = phase === 'won'
  return (
    <div className="result">
      <p className={won ? 'good' : 'bad'}>
        {won
          ? `¡Derrotaste a ${boss.name}! Ganaste +${boss.rewardCoins ?? 30} 🪙 monedas.`
          : `${boss.name} te venció.`}
      </p>
      <button
        className="btn"
        onClick={() => {
          playSfx('click')
          ;(won ? onWin : onLose)()
        }}
      >
        {won ? 'Ver pista y tienda de café' : 'Continuar'}
      </button>
    </div>
  )
}

function Battle({
  boss,
  snapshot,
  playerHp,
  coins = 0,
  coffees = 0,
  onUseCoffee,
  onWin,
  onLose,
  onMenu,
  onProgress,
  muted,
  onToggleMute,
}) {
  const [state, setState] = useState(() => (
    snapshot ? restoreBattle(boss, snapshot) : createBattle(boss, Math.random, playerHp)
  ))
  const [taunt, setTaunt] = useState(() => randomItem(boss.taunts))
  const [attackQuote, setAttackQuote] = useState(() => randomItem(boss.attackQuotes, randomItem(boss.taunts)))
  const [turnPhase, setTurnPhase] = useState('player')
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(null)
  const [specialCharge, setSpecialCharge] = useState(() => snapshot?.streak ?? 0)
  const [healNote, setHealNote] = useState(null)
  const [fx, setFx] = useState(null)
  const [bossFx, setBossFx] = useState(null)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    onProgress?.(snapshotBattle(state), state.playerHp)
  }, [state, onProgress])

  const finished = (state.phase === 'won' || state.phase === 'lost') && turnPhase === 'player'
  const visiblePlayerHp = displayedPlayerHp !== null ? displayedPlayerHp : state.playerHp

  const handleDrinkCoffee = () => {
    if (turnPhase !== 'player' || coffees <= 0 || state.playerHp >= PLAYER_MAX_HP) return
    const healed = Math.min(PLAYER_MAX_HP, state.playerHp + COFFEE_HEAL)
    const gained = healed - state.playerHp
    setState((prev) => ({ ...prev, playerHp: healed }))
    onUseCoffee?.(healed)
    playSfx('heal')
    setFx('glow')
    setHealNote(`☕ Tomaste un Café caliente y recuperaste +${gained} de vida.`)
  }

  const dispatch = (action) => {
    const prevPlayerHp = state.playerHp
    const wasRefactoring = state.refactoring
    const next = battle(state, action)
    setState(next)

    if (action.type === 'comment') {
      playSfx('shield')
      return
    }
    if (action.type === 'debug' || action.type === 'refactor') {
      playSfx('open')
      return
    }
    if (action.type !== 'answer') return

    clearTimers()
    setHealNote(null)
    setSpecialCharge((prev) => (wasRefactoring ? 0 : Math.min(MAX_STREAK, prev + 1)))

    // Phase 1: Player's attack resolves first
    const hitCorrect = Boolean(next.lastTurn?.correct)
    setFx(hitCorrect ? 'glow' : null)
    setBossFx(hitCorrect ? 'hurt' : null)

    if (next.phase === 'won') {
      playSfx('win')
      setDisplayedPlayerHp(null)
      setTurnPhase('player')
      return
    }

    if (hitCorrect) {
      playSfx(wasRefactoring ? 'refactor' : 'hit')
    } else {
      playSfx('wrong')
    }

    // Hold player's HP at pre-counterattack value until the boss takes its turn
    setDisplayedPlayerHp(prevPlayerHp)
    setTurnPhase('player-attack')

    // Phase 2: Boss's turn to counterattack after a brief pause
    const t1 = setTimeout(() => {
      const nextQuote = randomItem(boss.attackQuotes, randomItem(boss.taunts))
      setAttackQuote(nextQuote)
      setTaunt(randomItem(boss.taunts))
      setTurnPhase('boss-turn')
      setDisplayedPlayerHp(null)
      setBossFx('attack')

      if (next.lastTurn?.blocked) {
        playSfx('shield')
        setFx('glow')
      } else if (next.lastTurn?.taken > 0) {
        playSfx(next.phase === 'lost' ? 'lose' : 'hurt')
        setFx('hurt')
      }
    }, 900)

    // Phase 3: Return control to the player's turn (or show defeat screen)
    const t2 = setTimeout(() => {
      setBossFx(null)
      setTurnPhase('player')
    }, 2400)

    timersRef.current = [t1, t2]
  }

  return (
    <main className="screen battle">
      <GameHud onMenu={onMenu} muted={muted} onToggleMute={onToggleMute} coins={coins} coffees={coffees} />
      <h2>{boss.name}</h2>
      <p className="taunt">“{taunt}”</p>
      <TurnIndicator turnPhase={turnPhase} boss={boss} finished={finished} />
      <div className="battle-arena">
        <div className={`fighter fighter-enemy ${turnPhase === 'boss-turn' ? 'fighter-active-enemy' : ''}`}>
          <BossSprite bossId={boss.id} fx={bossFx} />
          <HealthBar label={boss.name} current={state.bossHp} max={boss.hp} tone="enemy" />
        </div>
        <div className={`fighter fighter-player ${turnPhase === 'player' ? 'fighter-active-player' : ''}`}>
          <PlayerSprite fx={fx} />
          <HealthBar label="Tú" current={visiblePlayerHp} max={PLAYER_MAX_HP} />
        </div>
      </div>
      <p className="muted">
        Carga Ataque Especial: {specialCharge}/{MAX_STREAK}
        {specialCharge >= MAX_STREAK && ' · ¡LISTO PARA USAR (Daño x2)!'}
        {state.shielded && ' · Comentario activo: el próximo ataque se bloquea'}
      </p>
      <TurnFeedback
        lastTurn={state.lastTurn}
        turnPhase={turnPhase}
        bossName={boss.name}
        attackName={boss.attackName}
        attackQuote={attackQuote}
        healNote={healNote}
      />
      {finished ? (
        <BattleResult phase={state.phase} boss={boss} onWin={onWin} onLose={onLose} />
      ) : (
        <ActionBar
          state={state}
          onAction={dispatch}
          busy={turnPhase !== 'player'}
          specialCharge={specialCharge}
          coffees={coffees}
          onDrinkCoffee={handleDrinkCoffee}
        />
      )}
      {state.phase === 'question' && (
        <QuestionModal
          question={state.question}
          refactoring={state.refactoring}
          onAnswer={dispatch}
          onCancel={() => dispatch({ type: 'cancel' })}
        />
      )}
    </main>
  )
}

export default Battle
