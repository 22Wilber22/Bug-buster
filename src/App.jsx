import { useCallback, useEffect, useState } from 'react'
import { bosses } from './data/bosses'
import { PLAYER_MAX_HP } from './engine/battle'
import { buyCoffee, loadSave, resetSave, saveDefeated, writeSave } from './engine/save'
import { isMuted, playSfx, setSceneAudio, toggleMuted, unlockAudio } from './engine/sound'
import Intro from './screens/Intro'
import Menu from './screens/Menu'
import FloorMap from './screens/FloorMap'
import Battle from './screens/Battle'
import Clue from './screens/Clue'
import Ending from './screens/Ending'

function App() {
  const [save, setSave] = useState(() => loadSave())
  const [screen, setScreen] = useState('menu')
  const [bossId, setBossId] = useState(null)
  const [battleSnap, setBattleSnap] = useState(null)
  const [introKey, setIntroKey] = useState(0)
  const [fightKey, setFightKey] = useState(0)
  const [muted, setMuted] = useState(() => isMuted())

  const persist = (patch) => setSave(writeSave(patch))
  const bossIndex = bosses.findIndex((boss) => boss.id === bossId)
  const boss = bosses[bossIndex]
  const nextBoss = bosses[bossIndex + 1]

  useEffect(() => {
    if (screen !== 'intro') {
      setSceneAudio(screen)
    }
  }, [screen])

  useEffect(() => {
    const handleUnlock = () => unlockAudio()
    window.addEventListener('pointerdown', handleUnlock, { passive: true })
    window.addEventListener('keydown', handleUnlock)
    return () => {
      window.removeEventListener('pointerdown', handleUnlock)
      window.removeEventListener('keydown', handleUnlock)
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    const next = toggleMuted()
    setMuted(next)
    if (!next) playSfx('click')
  }, [])

  const handleBuyCoffee = () => {
    setSave(buyCoffee())
  }

  const handleUseCoffee = (newHp) => {
    setSave((prev) => {
      if (prev.coffees <= 0) return prev
      return writeSave({
        coffees: prev.coffees - 1,
        playerHp: newHp,
      })
    })
  }

  const openMenu = () => {
    if (screen !== 'menu' && screen !== 'intro') {
      persist({
        inProgress: true,
        screen,
        bossId,
        battle: screen === 'battle' ? battleSnap : null,
      })
    }
    setScreen('menu')
  }

  const startBattle = (id, { snapshot = null, hp = save.playerHp } = {}) => {
    setBossId(id)
    setBattleSnap(snapshot)
    setFightKey((key) => key + 1)
    persist({ inProgress: true, screen: 'battle', bossId: id, battle: snapshot, playerHp: hp })
    setScreen('battle')
  }

  const goMap = () => {
    setBattleSnap(null)
    persist({ inProgress: true, screen: 'map', battle: null, bossId })
    setScreen('map')
  }

  const goEnding = () => {
    persist({ inProgress: true, screen: 'ending', battle: null, bossId })
    setScreen('ending')
  }

  const onBattleProgress = useCallback((snapshot, playerHp) => {
    setBattleSnap(snapshot)
    setSave(writeSave({
      inProgress: true,
      screen: 'battle',
      bossId,
      battle: snapshot,
      playerHp,
    }))
  }, [bossId])

  const winBattle = () => {
    const next = saveDefeated(bossId, {
      inProgress: true,
      screen: 'clue',
      bossId,
      battle: null,
      playerHp: battleSnap?.playerHp ?? save.playerHp,
      rewardCoins: boss?.rewardCoins ?? 30,
    })
    setSave(next)
    setBattleSnap(null)
    setScreen('clue')
  }

  const newGame = () => {
    setSave(resetSave())
    setBossId(null)
    setBattleSnap(null)
    setIntroKey((key) => key + 1)
    setScreen('intro')
  }

  const resume = () => {
    const session = loadSave()
    setBossId(session.bossId)
    setBattleSnap(session.battle)
    setSave(session)
    setFightKey((key) => key + 1)
    setScreen(session.screen)
  }

  const continueFromLast = () => {
    setBattleSnap(null)
    persist({ inProgress: true, screen: 'map', battle: null })
    setScreen('map')
  }

  const hudProps = {
    muted,
    onToggleMute: handleToggleMute,
    coins: save.coins,
    coffees: save.coffees,
  }

  switch (screen) {
    case 'menu':
      return (
        <Menu
          save={save}
          onResume={resume}
          onNewGame={newGame}
          onContinue={continueFromLast}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )
    case 'intro':
      return (
        <Intro
          key={introKey}
          onStart={() => {
            persist({
              inProgress: true,
              screen: 'map',
              playerHp: PLAYER_MAX_HP,
              coins: 0,
              coffees: 0,
              defeatedBossIds: [],
              battle: null,
              bossId: null,
            })
            setScreen('map')
          }}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )
    case 'battle':
      return (
        <Battle
          key={`${bossId}-${fightKey}`}
          boss={boss}
          snapshot={battleSnap}
          playerHp={save.playerHp}
          onUseCoffee={handleUseCoffee}
          onWin={winBattle}
          onLose={() => {
            persist({ inProgress: true, screen: 'defeat', battle: battleSnap, playerHp: 0 })
            setScreen('defeat')
          }}
          onMenu={openMenu}
          onProgress={onBattleProgress}
          {...hudProps}
        />
      )
    case 'clue':
      return (
        <Clue
          boss={boss}
          nextBoss={nextBoss}
          playerHp={save.playerHp}
          onBuyCoffee={handleBuyCoffee}
          onUseCoffee={handleUseCoffee}
          onNext={() => (nextBoss ? startBattle(nextBoss.id) : goEnding())}
          onMap={goMap}
          onMenu={openMenu}
          {...hudProps}
        />
      )
    case 'ending':
      return <Ending won onMap={goMap} onMenu={openMenu} {...hudProps} />
    case 'defeat':
      return (
        <Ending
          boss={boss}
          onRetry={() => startBattle(bossId, { hp: PLAYER_MAX_HP })}
          onMap={goMap}
          onMenu={openMenu}
          {...hudProps}
        />
      )
    default:
      return (
        <FloorMap
          defeatedBossIds={save.defeatedBossIds}
          playerHp={save.playerHp}
          onBuyCoffee={handleBuyCoffee}
          onUseCoffee={handleUseCoffee}
          onSelectBoss={(id) => startBattle(id)}
          onMenu={openMenu}
          {...hudProps}
        />
      )
  }
}

export default App
