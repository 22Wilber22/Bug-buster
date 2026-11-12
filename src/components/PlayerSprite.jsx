import { useState } from 'react'
import { loadProgression } from '../engine/progression'

const PLAYER_SPRITE_SRC = '/assets/characters/debugger.png'

function PlayerFallback() {
  return (
    <>
      <div className="px-backpack" />
      <div className="px-head">
        <div className="px-brow px-brow-l" />
        <div className="px-brow px-brow-r" />
        <div className="px-eye px-eye-l"><i /></div>
        <div className="px-eye px-eye-r"><i /></div>
        <div className="px-mouth" />
      </div>
      <div className="px-body">
        <span className="px-logo">{'</>'}</span>
      </div>
      <div className="px-arm px-arm-l" />
      <div className="px-arm px-arm-r" />
      <div className="px-legs">
        <div className="px-leg" />
        <div className="px-leg" />
      </div>
    </>
  )
}

function PlayerSprite({
  fx = 'idle',
  src = PLAYER_SPRITE_SRC,
  facing = 'right',
  skin,
  accessory,
}) {
  const [imgError, setImgError] = useState(false)
  const animState = fx || 'idle'
  const facingDir = facing === 'left' ? 'left' : 'right'
  const prog = !skin || accessory === undefined ? loadProgression() : null
  const activeSkin = skin || prog?.equippedSkin || 'default'
  const activeAccessory =
    accessory !== undefined ? accessory : (prog?.equippedAccessory ?? null)

  const classes = [
    'sprite',
    'player-sprite',
    `fx-${animState}`,
    `facing-${facingDir}`,
    `skin-${activeSkin}`,
    activeAccessory ? `acc-${activeAccessory}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      data-state={animState}
      data-facing={facingDir}
      data-skin={activeSkin}
      aria-hidden="true"
    >
      {activeAccessory && (
        <span
          className={`player-accessory-badge acc-layer-${activeAccessory}`}
          aria-hidden="true"
        />
      )}

      {!imgError && src ? (
        <img
          className="pixel-sprite-img player-sprite-img"
          src={src}
          alt=""
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : (
        <PlayerFallback />
      )}

      {animState === 'walk' && (
        <div className="walk-dust-steps" aria-hidden="true">
          <span className="dust-step s1" />
          <span className="dust-step s2" />
        </div>
      )}
    </div>
  )
}

export default PlayerSprite
