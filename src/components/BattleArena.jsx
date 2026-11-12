import CharacterSprite from './CharacterSprite'
import HealthBar from './HealthBar'
import CombatEffects from './CombatEffects'
import { PLAYER_MAX_HP } from '../engine/battle'

const BANNER_SYMBOL = {
  html: '</>',
  css: '{ }',
  js: 'JS',
  react: '⚛',
}

function BattleArena({
  boss,
  bossHp,
  playerHp,
  maxPlayerHp = PLAYER_MAX_HP,
  bossFx,
  playerFx,
  playerFacing = 'right',
  turnPhase,
  shielded,
  floorId = 'html',
  bossLevel = 5,
  playerLevel = 6,
  combatEffect = null,
  transitionState = null,
}) {
  const bannerText = BANNER_SYMBOL[floorId] || '</>'
  const screenShake =
    combatEffect?.kind === 'special-hit' ||
    (combatEffect?.kind === 'boss-hit' && combatEffect?.critical)
  const walkProgress = transitionState?.walkProgress || 0
  const portalOpen = Boolean(transitionState?.portalOpen)
  const portalAbsorbing =
    transitionState?.phase === 'exiting' ||
    transitionState?.phase === 'loading_next_level'

  return (
    <section
      className={`battle-stage ${screenShake ? 'stage-shake' : ''} ${portalOpen ? 'stage-portal-active' : ''}`.trim()}
      aria-label="Escenario de combate"
    >
      {/* Pixel Art Cyberpunk Dungeon Backdrop */}
      <div className="arena-backdrop" aria-hidden="true">
        <div className="arena-stars" />
        <div className="arena-moon" />
        <div className="arena-clouds" />
        <div className="arena-cityline" />

        {/* Left & Right Dungeon Pillars with Hanging Code Banners */}
        <div className="arena-pillar arena-pillar-left">
          <div className="arena-banner">
            <span>{bannerText}</span>
          </div>
        </div>
        <div className="arena-pillar arena-pillar-right">
          <div className="arena-banner">
            <span>{bannerText}</span>
          </div>
        </div>

        {/* Retro Terminal Desks */}
        <div className="arena-terminal arena-terminal-left">
          <div className="terminal-monitor">
            <span className="terminal-lines" />
          </div>
          <div className="terminal-desk" />
        </div>
        <div className="arena-terminal arena-terminal-right">
          <div className="terminal-monitor">
            <span className="terminal-lines" />
          </div>
          <div className="terminal-desk" />
        </div>

        {/* Ambient Cyber Flora & Floating Particles */}
        <div className="arena-flora arena-flora-left" />
        <div className="arena-flora arena-flora-right" />
        <div className="arena-particles">
          <span className="arena-particle p1" />
          <span className="arena-particle p2" />
          <span className="arena-particle p3" />
          <span className="arena-particle p4" />
        </div>

        {/* Perspective Grid Floor */}
        <div className="arena-floor-grid" />
      </div>

      {/* Interactive Combat Effects Overlay */}
      <CombatEffects effect={combatEffect} />

      {/* Level Completion Banner & Digital Exit Portal [ > ] */}
      {transitionState?.bannerText && (
        <div className="level-clear-overlay" role="status" aria-live="polite">
          <span className="level-clear-title">{transitionState.bannerText}</span>
          <span className="level-clear-sub">
            +{boss.rewardCoins ?? 30} 🪙 monedas · Portal digital [ &gt; ] activo
          </span>
        </div>
      )}

      {portalOpen && (
        <div
          className={`digital-exit-portal ${portalAbsorbing ? 'portal-absorbing' : 'portal-open'}`}
          aria-label="Portal digital de salida"
        >
          <span className="portal-brackets">[ &gt; ]</span>
          <span className="portal-caption">SALIDA</span>
        </div>
      )}

      {/* Fighters & Paired Health Cards */}
      <div className="battle-arena">
        <div
          className={`fighter-column fighter-column-enemy ${portalOpen ? 'enemy-vanished' : ''}`.trim()}
        >
          <CharacterSprite
            role="enemy"
            bossId={boss.id}
            fx={bossFx}
            active={turnPhase === 'boss-turn'}
            floorId={floorId}
          />
          <HealthBar
            label={boss.name}
            current={bossHp}
            max={boss.hp}
            tone="enemy"
            level={bossLevel}
          />
        </div>

        <div
          className={`fighter-column fighter-column-player ${walkProgress > 0 ? 'player-walking-right' : ''}`.trim()}
          style={
            walkProgress > 0
              ? { transform: `translateX(${Math.round(walkProgress * 1.6)}px)` }
              : undefined
          }
        >
          <CharacterSprite
            role="player"
            fx={playerFx}
            facing={playerFacing}
            walkProgress={walkProgress}
            active={turnPhase === 'player' || turnPhase === 'player-attack'}
            shielded={shielded}
            floorId={floorId}
          />
          <HealthBar
            label="Tú"
            current={playerHp}
            max={maxPlayerHp}
            tone="player"
            level={playerLevel}
          />
        </div>
      </div>
    </section>
  )
}

export default BattleArena
