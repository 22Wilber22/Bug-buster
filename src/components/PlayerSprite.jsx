function PlayerSprite({ fx }) {
  return (
    <div className={`sprite player-sprite ${fx ? `fx-${fx}` : ''}`} aria-hidden="true">
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
    </div>
  )
}

export default PlayerSprite
