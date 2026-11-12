import { useCallback, useEffect, useState } from 'react'
import { bosses } from './data/bosses'
import { PLAYER_MAX_HP } from './engine/battle'
import { buyCoffee, loadSave, resetSave, saveDefeated, writeSave } from './engine/save'
import {
  evaluateAchievements,
  loadProgression,
  resetProgression,
  saveProgression,
} from './engine/progression'
import { isMuted, playSfx, setSceneAudio, toggleMuted, unlockAudio } from './engine/sound'
import Intro from './screens/Intro'
import Menu from './screens/Menu'
import FloorMap from './screens/FloorMap'
import Exploration from './screens/Exploration'
import Battle from './screens/Battle'
import Clue from './screens/Clue'
import Ending from './screens/Ending'

function App() {
  const [save, setSave] = useState(() => {
    const initialSave = loadSave()
    return evaluateAchievements(initialSave, loadProgression()).save
  })
  const [screen, setScreen] = useState('menu')
  const [bossId, setBossId] = useState(null)
  const [exploreFloorId, setExploreFloorId] = useState('html')
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
      setSceneAudio(screen === 'explore' ? 'map' : screen)
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
    const nextSave = buyCoffee()
    const ach = evaluateAchievements(nextSave, loadProgression())
    setSave(ach.save)
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

  const handleProgressionChange = (updatedSave) => {
    if (updatedSave && typeof updatedSave === 'object' && 'coins' in updatedSave) {
      setSave(updatedSave)
    } else {
      setSave(loadSave())
    }
  }

  const openMenu = () => {
    if (screen !== 'menu' && screen !== 'intro') {
      persist({
        inProgress: true,
        screen: screen === 'explore' ? 'map' : screen,
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

  const startExploration = (floorId) => {
    setExploreFloorId(floorId || 'html')
    setScreen('explore')
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
    const finalHp = battleSnap?.playerHp ?? save.playerHp
    const next = saveDefeated(bossId, {
      inProgress: true,
      screen: 'clue',
      bossId,
      battle: null,
      playerHp: finalHp,
      rewardCoins: boss?.rewardCoins ?? 30,
    })

    let currentProg = loadProgression()
    if (finalHp >= PLAYER_MAX_HP) {
      currentProg = saveProgression({
        flawlessWins: (currentProg.flawlessWins || 0) + 1,
      })
    }
    const achResult = evaluateAchievements(next, currentProg)

    setSave(achResult.save)
    setBattleSnap(null)
    setScreen('clue')
  }

  const newGame = () => {
    resetProgression()
    setSave(resetSave())
    setBossId(null)
    setBattleSnap(null)
    setIntroKey((key) => key + 1)
    setScreen('intro')
  }

  const resume = () => {
    const session = loadSave()
    const validBoss = bosses.some((item) => item.id === session.bossId)
    const needsBoss = ['battle', 'clue', 'defeat'].includes(session.screen)
    const nextScreen = needsBoss && !validBoss ? 'map' : session.screen
    setBossId(validBoss ? session.bossId : null)
    setBattleSnap(validBoss ? session.battle : null)
    setSave(session)
    setFightKey((key) => key + 1)
    setScreen(nextScreen)
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
    case 'explore':
      return (
        <Exploration
          floorId={exploreFloorId}
          defeatedBossIds={save.defeatedBossIds}
          playerHp={save.playerHp}
          onBuyCoffee={handleBuyCoffee}
          onUseCoffee={handleUseCoffee}
          onProgressionChange={handleProgressionChange}
          onStartEncounter={(id) => startBattle(id)}
          onMap={goMap}
          onMenu={openMenu}
          {...hudProps}
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
          onProgressionChange={handleProgressionChange}
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
          onProgressionChange={handleProgressionChange}
          onSelectBoss={(id) => startBattle(id)}
          onExploreFloor={(floorId) => startExploration(floorId)}
          onMenu={openMenu}
          {...hudProps}
        />
      )
  }
}

export default App
