import { useEffect, useRef, useState } from 'react'
import { bosses } from '../data/bosses'
import { floors } from '../data/floors'
import {
  battle, createBattle, restoreBattle, snapshotBattle, PLAYER_MAX_HP, MAX_STREAK,
} from '../engine/battle'
import { COFFEE_HEAL } from '../engine/save'
import { playSfx } from '../engine/sound'
import { createTransitionState, stepTransition } from '../engine/transitionMachine'
import BattleHeader from '../components/BattleHeader'
import BattleStatus from '../components/BattleStatus'
import BattleArena from '../components/BattleArena'
import SpecialAttackMeter from '../components/SpecialAttackMeter'
import BattleActions from '../components/BattleActions'
import QuestionModal from '../components/QuestionModal'

function randomItem(list, fallback = '') {
  if (!list?.length) return fallback
  return list[Math.floor(Math.random() * list.length)]
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
          {lastTurn.explanation && (
            <p className="explanation">
              💡 <strong>Explicación:</strong> {lastTurn.explanation}
            </p>
          )}
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

function BattleResult({ phase, boss, transition, onAdvancePortal, onLose }) {
  const won = phase === 'won'
  const walkingOut =
    transition?.phase === 'walking_right' ||
    transition?.phase === 'exiting' ||
    transition?.phase === 'loading_next_level'

  return (
    <div className="result">
      {won && (
        <p className="level-complete-badge">
          ✨ {transition?.bannerText || '¡NIVEL COMPLETADO!'}
        </p>
      )}
      <p className={won ? 'good' : 'bad'}>
        {won
          ? `¡Derrotaste a ${boss.name}! Ganaste +${boss.rewardCoins ?? 30} 🪙 monedas.`
          : `${boss.name} te venció.`}
      </p>
      <button
        className="btn"
        disabled={walkingOut}
        onClick={() => {
          playSfx('click')
          if (won) {
            onAdvancePortal()
          } else {
            onLose()
          }
        }}
      >
        {won
          ? walkingOut
            ? 'Caminando hacia el portal [ > ]...'
            : 'Avanzar al portal [ > ] y ver tienda'
          : 'Continuar'}
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
  const [turnCount, setTurnCount] = useState(0)
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(null)
  const [healNote, setHealNote] = useState(null)
  const [fx, setFx] = useState('idle')
  const [bossFx, setBossFx] = useState('idle')
  const [combatEffect, setCombatEffect] = useState(null)
  const [transition, setTransition] = useState(() => {
    if (snapshot?.phase === 'won') {
      let t = stepTransition(createTransitionState('combat'), 'WIN_COMBAT')
      t = stepTransition(t, 'ENEMY_FADED')
      return stepTransition(t, 'SHOW_REWARDS')
    }
    return createTransitionState('combat')
  })
  const effectSeqRef = useRef(0)
  const timersRef = useRef([])
  const winTriggeredRef = useRef(false)

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    onProgress?.(snapshotBattle(state), state.playerHp)
  }, [state, onProgress])

  const triggerEffect = (payload) => {
    effectSeqRef.current += 1
    setCombatEffect({ id: effectSeqRef.current, ...payload })
  }

  const finished = (state.phase === 'won' || state.phase === 'lost') && turnPhase === 'player'
  const visiblePlayerHp = displayedPlayerHp !== null ? displayedPlayerHp : state.playerHp

  const resolvedPlayerFx = finished
    ? state.phase === 'won'
      ? transition.playerState || 'victory'
      : 'defeat'
    : (fx || 'idle')
  const resolvedBossFx = finished
    ? (state.phase === 'won' ? 'defeat' : 'victory')
    : (bossFx || 'idle')

  const handleVictoryWalk = () => {
    if (winTriggeredRef.current) return
    winTriggeredRef.current = true
    clearTimers()

    setTransition((prev) => stepTransition(prev, 'START_WALK'))
    setFx('walk')

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setTransition((prev) => {
        const exited = stepTransition(prev, 'REACH_PORTAL')
        return stepTransition(exited, 'LOAD_NEXT')
      })
      onWin?.()
      return
    }

    const tReach = setTimeout(() => {
      setTransition((prev) => stepTransition(prev, 'REACH_PORTAL'))
      setFx('exit')
    }, 420)

    const tLoad = setTimeout(() => {
      setTransition((prev) => stepTransition(prev, 'LOAD_NEXT'))
      onWin?.()
    }, 840)

    timersRef.current = [tReach, tLoad]
  }

  const handleDrinkCoffee = () => {
    if (turnPhase !== 'player' || coffees <= 0 || state.playerHp >= PLAYER_MAX_HP) return
    const healed = Math.min(PLAYER_MAX_HP, state.playerHp + COFFEE_HEAL)
    const gained = healed - state.playerHp
    setState((prev) => ({ ...prev, playerHp: healed }))
    onUseCoffee?.(healed)
    playSfx('heal')
    setFx('glow')
    setHealNote(`☕ Tomaste un Café caliente y recuperaste +${gained} de vida.`)
    triggerEffect({
      kind: 'coffee-heal',
      playerPopup: { text: `+${gained} HP ☕`, tone: 'heal' },
    })
  }

  const dispatch = (action) => {
    const prevPlayerHp = state.playerHp
    const wasRefactoring = state.refactoring
    const next = battle(state, action)
    setState(next)

    if (action.type === 'comment') {
      playSfx('shield')
      setFx('glow')
      triggerEffect({
        kind: 'comment-shield',
        playerPopup: { text: '🛡 ESCUDO ACTIVO', tone: 'shield' },
      })
      return
    }
    if (action.type === 'debug' || action.type === 'refactor') {
      playSfx('open')
      return
    }
    if (action.type !== 'answer') return

    clearTimers()
    setHealNote(null)
    setTurnCount((c) => c + 1)

    // Phase 1: Player's attack resolves first
    const hitCorrect = Boolean(next.lastTurn?.correct)
    setFx(hitCorrect ? 'attack' : 'idle')
    setBossFx(hitCorrect ? 'hurt' : 'idle')

    if (hitCorrect) {
      triggerEffect({
        kind: wasRefactoring ? 'special-hit' : 'debug-hit',
        enemyPopup: {
          text: wasRefactoring ? `⚡ -${next.lastTurn.dealt} HP` : `-${next.lastTurn.dealt} HP`,
          tone: wasRefactoring ? 'special' : 'damage',
        },
      })
    } else {
      triggerEffect({
        kind: 'miss',
        enemyPopup: { text: 'FALLO', tone: 'miss' },
      })
    }

    if (next.phase === 'won') {
      playSfx('win')
      setDisplayedPlayerHp(null)
      setFx('victory')
      setBossFx('defeat')
      setTurnPhase('player')
      let wonTransition = stepTransition(createTransitionState('combat'), 'WIN_COMBAT')
      wonTransition = stepTransition(wonTransition, 'ENEMY_FADED')
      wonTransition = stepTransition(wonTransition, 'SHOW_REWARDS')
      setTransition(wonTransition)
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
        triggerEffect({
          kind: 'boss-blocked',
          playerPopup: { text: '🛡 BLOQUEADO', tone: 'shield' },
        })
      } else if (next.lastTurn?.taken > 0) {
        playSfx(next.phase === 'lost' ? 'lose' : 'hurt')
        setFx(next.phase === 'lost' ? 'defeat' : 'hurt')
        if (next.phase === 'lost') {
          setTransition((prev) => stepTransition(prev, 'LOSE_COMBAT'))
        }
        triggerEffect({
          kind: 'boss-hit',
          critical: Boolean(next.lastTurn?.critical),
          playerPopup: {
            text: next.lastTurn?.critical
              ? `💥 -${next.lastTurn.taken} CRÍTICO`
              : `-${next.lastTurn.taken} HP`,
            tone: next.lastTurn?.critical ? 'crit' : 'damage',
          },
        })
      }
    }, 900)

    // Phase 3: Return control to the player's turn (or show defeat screen)
    const t2 = setTimeout(() => {
      setBossFx(next.phase === 'lost' ? 'victory' : 'idle')
      setFx(next.phase === 'lost' ? 'defeat' : 'idle')
      setTurnPhase('player')
    }, 2400)

    timersRef.current = [t1, t2]
  }

  const currentFloor = floors.find((f) => f.bossIds.includes(boss.id))
  const floorId = currentFloor?.id || 'html'
  const floorThemeClass = `battle-floor-${floorId}`
  const bossIdx = Math.max(0, bosses.findIndex((b) => b.id === boss.id))
  const bossLevel = 5 + bossIdx
  const playerLevel = 6 + Math.floor(bossIdx / 2)

  return (
    <main className={`screen battle ${floorThemeClass}`.trim()}>
      <BattleHeader
        onMenu={onMenu}
        muted={muted}
        onToggleMute={onToggleMute}
        coins={coins}
        coffees={coffees}
      />

      <BattleStatus
        boss={boss}
        taunt={taunt}
        turnPhase={turnPhase}
        finished={finished}
        turnCount={turnCount}
        bossHp={state.bossHp}
      />

      <BattleArena
        boss={boss}
        bossHp={state.bossHp}
        playerHp={visiblePlayerHp}
        bossFx={resolvedBossFx}
        playerFx={resolvedPlayerFx}
        playerFacing={transition.facing || 'right'}
        turnPhase={turnPhase}
        shielded={state.shielded}
        floorId={floorId}
        bossLevel={bossLevel}
        playerLevel={playerLevel}
        combatEffect={combatEffect}
        transitionState={transition}
      />

      <SpecialAttackMeter
        streak={state.streak}
        maxStreak={MAX_STREAK}
        shielded={state.shielded}
      />

      <TurnFeedback
        lastTurn={state.lastTurn}
        turnPhase={turnPhase}
        bossName={boss.name}
        attackName={boss.attackName}
        attackQuote={attackQuote}
        healNote={healNote}
      />

      {finished ? (
        <BattleResult
          phase={state.phase}
          boss={boss}
          transition={transition}
          onAdvancePortal={handleVictoryWalk}
          onLose={onLose}
        />
      ) : (
        <BattleActions
          state={state}
          onAction={dispatch}
          busy={turnPhase !== 'player' || transition.controlsLocked}
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
