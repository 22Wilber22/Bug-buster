import BossSprite from './BossSprite'
import PlayerSprite from './PlayerSprite'

const FLOOR_SIGILS = {
  html: '</>',
  css: '{ }',
  js: 'f(x)',
  react: '<⚛/>',
}

function CharacterSprite({
  role = 'player',
  bossId,
  fx = 'idle',
  active = false,
  shielded = false,
  floorId = 'html',
  facing = 'right',
  skin,
  accessory,
  walkProgress = 0,
  children,
}) {
  const isEnemy = role === 'enemy'
  const sigil = FLOOR_SIGILS[floorId] || '</>'
  const isWalking = !isEnemy && (fx === 'walk' || fx === 'exit' || walkProgress > 0)

  const fighterClasses = [
    'fighter',
    `fighter-${role}`,
    active ? `fighter-active-${role}` : '',
    shielded ? 'fighter-shielded' : '',
    isWalking ? 'player-walking-right' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={fighterClasses} data-walk-progress={!isEnemy ? walkProgress : undefined}>
      <div className="character-stage-slot">
        {isEnemy && (
          <div className="enemy-floating-sigil" aria-hidden="true">
            {sigil}
          </div>
        )}

        {shielded && !isEnemy && (
          <div className="player-shield-aura" aria-hidden="true">
            <span className="shield-code-tag">/* SHIELD */</span>
          </div>
        )}

        <div className="character-sprite-holder">
          {isEnemy ? (
            <BossSprite bossId={bossId} fx={fx} />
          ) : (
            <PlayerSprite
              fx={fx}
              facing={facing}
              skin={skin}
              accessory={accessory}
            />
          )}
        </div>

        <div
          className={`holo-pedestal ${isEnemy ? 'holo-pedestal-enemy' : 'holo-pedestal-player'}`}
          aria-hidden="true"
        >
          <div className="pedestal-shadow" />
          <div className="pedestal-ring pedestal-ring-outer" />
          <div className="pedestal-ring pedestal-ring-inner" />
        </div>

        {children}
      </div>
    </div>
  )
}

export default CharacterSprite
