function GhostTag() {
  return (
    <div className="sprite boss-sprite boss-ghost">
      <div className="px-sigil">{'<>'}</div>
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

function RedTag() {
  return (
    <div className="sprite boss-sprite boss-red">
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

function CorruptHtml() {
  return (
    <div className="sprite boss-sprite boss-html">
      <div className="px-crown">{'<>'}</div>
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

const SPRITES = {
  'tag-fantasma': GhostTag,
  'etiqueta-roja': RedTag,
  'html-corrupto': CorruptHtml,
}

function BossSprite({ bossId, fx }) {
  const Sprite = SPRITES[bossId]
  if (!Sprite) return null
  return (
    <div className={`boss-sprite-wrap ${fx ? `boss-fx-${fx}` : ''}`} aria-hidden="true">
      <Sprite />
    </div>
  )
}

export default BossSprite
