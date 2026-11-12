import { useState } from 'react'
import { BOSS_SPRITES } from '../data/bosses'

function GhostTag({ sigil = '<>', floorClass = '' }) {
  return (
    <div className={`sprite boss-sprite boss-ghost ${floorClass}`.trim()}>
      <div className="px-sigil">{sigil}</div>
      <div className="px-ghost-body">
        <div className="px-arm-short px-arm-l" />
        <div className="px-arm-short px-arm-r" />
        <div className="px-eye px-eye-l" />
        <div className="px-eye px-eye-r" />
        <div className="px-mouth" />
      </div>
    </div>
  )
}

function RedTag({ floorClass = '' }) {
  return (
    <div className={`sprite boss-sprite boss-red ${floorClass}`.trim()}>
      <div className="px-red-head">
        <div className="px-brow px-brow-l" />
        <div className="px-brow px-brow-r" />
        <div className="px-eye px-eye-l" />
        <div className="px-eye px-eye-r" />
        <div className="px-mouth confused" />
      </div>
      <div className="px-red-body" />
      <div className="px-chain">
        <span />
        <span className="broken" />
      </div>
    </div>
  )
}

function CorruptHtml({ crown = '<>', floorClass = '' }) {
  return (
    <div className={`sprite boss-sprite boss-html ${floorClass}`.trim()}>
      <div className="px-crown">{crown}</div>
      <div className="px-html-body">
        <div className="px-crack px-crack-1" />
        <div className="px-crack px-crack-2" />
        <div className="px-eye red px-eye-l" />
        <div className="px-eye red px-eye-r" />
        <div className="px-mouth" />
      </div>
    </div>
  )
}

const FALLBACK_CONFIG = {
  'tag-fantasma': { Component: GhostTag, props: { sigil: '<>', floorClass: 'boss-floor-html' } },
  'etiqueta-roja': { Component: RedTag, props: { floorClass: 'boss-floor-html' } },
  'html-corrupto': { Component: CorruptHtml, props: { crown: '<>', floorClass: 'boss-floor-html' } },
  'selector-oscuro': { Component: GhostTag, props: { sigil: '{}', floorClass: 'boss-floor-css' } },
  'flexbox-caotico': { Component: RedTag, props: { floorClass: 'boss-floor-css' } },
  'rey-responsive': { Component: CorruptHtml, props: { crown: '@media', floorClass: 'boss-floor-css' } },
  undefined: { Component: GhostTag, props: { sigil: '??', floorClass: 'boss-floor-js' } },
  'bucle-eterno': { Component: RedTag, props: { floorClass: 'boss-floor-js' } },
  'senor-async': { Component: CorruptHtml, props: { crown: 'async', floorClass: 'boss-floor-js' } },
  'componente-roto': { Component: GhostTag, props: { sigil: '<JSX>', floorClass: 'boss-floor-react' } },
  'hook-maldito': { Component: RedTag, props: { floorClass: 'boss-floor-react' } },
  'render-infinito': { Component: CorruptHtml, props: { crown: '⚛', floorClass: 'boss-floor-react' } },
}

function BossSprite({ bossId, fx = 'idle', src }) {
  const [imgError, setImgError] = useState(false)
  if (!bossId) return null

  const spriteSrc = src !== undefined ? src : (BOSS_SPRITES[bossId] || `/assets/bosses/${bossId}.png`)
  const fallback = FALLBACK_CONFIG[bossId]
  if (!spriteSrc && !fallback) return null

  const animState = fx || 'idle'
  const FallbackComponent = fallback?.Component || GhostTag
  const fallbackProps = fallback?.props || {}

  return (
    <div
      className={`boss-sprite-wrap boss-id-${bossId} boss-fx-${animState}`}
      data-state={animState}
      aria-hidden="true"
    >
      {!imgError && spriteSrc ? (
        <img
          className="pixel-sprite-img boss-sprite-img"
          src={spriteSrc}
          alt=""
          draggable={false}
          onError={() => setImgError(true)}
        />
      ) : (
        <FallbackComponent {...fallbackProps} />
      )}
    </div>
  )
}

export default BossSprite
