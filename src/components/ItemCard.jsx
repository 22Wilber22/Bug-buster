import { playSfx } from '../engine/sound'
import { PixelCoinIcon, PixelItemSprite } from './PixelIcons'
import PlayerSprite from './PlayerSprite'

const RARITY_BY_ITEM = {
  'coffee-pack': { label: 'Común', tone: 'common' },
  'espresso-shot': { label: 'Raro', tone: 'rare' },
  'upg-vitality': { label: 'Épico', tone: 'epic' },
  'upg-compiler': { label: 'Épico', tone: 'epic' },
  'upg-firewall': { label: 'Raro', tone: 'rare' },
  'upg-thermos': { label: 'Raro', tone: 'rare' },
  'skin-default': { label: 'Base', tone: 'common' },
  'skin-cyber-ninja': { label: 'Raro', tone: 'rare' },
  'skin-matrix': { label: 'Épico', tone: 'epic' },
  'skin-golden': { label: 'Legendario', tone: 'legendary' },
  'acc-visor': { label: 'Raro', tone: 'rare' },
  'acc-blade-magenta': { label: 'Épico', tone: 'epic' },
  'acc-aura-binary': { label: 'Legendario', tone: 'legendary' },
}

const STATE_LABELS = {
  available: 'Disponible',
  selected: 'Seleccionado',
  locked: 'Bloqueado',
  insufficient: 'Sin fondos',
  purchased: 'Adquirido',
  equipped: 'Equipado',
  sold_out: 'Agotado',
}

/**
 * Tarjeta visual reutilizable para el catálogo de la tienda RPG (Fase 3).
 * Reconocible por etiqueta de estado, borde y microanimación sin depender solo del color.
 */
function ItemCard({
  item,
  state = 'available',
  selected = false,
  quantity,
  onSelect,
  onAction,
  actionLabel,
  actionDisabled = false,
}) {
  const rarity = RARITY_BY_ITEM[item.id] || { label: 'Estándar', tone: 'common' }
  const visualState = selected && state === 'available' ? 'selected' : state
  const stateBadgeText = STATE_LABELS[visualState] || STATE_LABELS.available

  const handleCardClick = () => {
    playSfx('click')
    onSelect?.(item)
  }

  return (
    <article
      className={`item-card item-state-${visualState} item-rarity-${rarity.tone} ${selected ? 'item-is-selected' : ''} ${state === 'insufficient' ? 'shop-item-unaffordable' : ''} ${state === 'purchased' || state === 'equipped' ? 'shop-item-owned' : ''} ${state === 'equipped' ? 'shop-item-equipped' : ''}`.trim()}
      data-state={visualState}
      onClick={handleCardClick}
    >
      <div className="item-card-top">
        <span className={`item-rarity-tag rarity-${rarity.tone}`}>{rarity.label}</span>
        <span className={`item-state-badge badge-${visualState}`}>{stateBadgeText}</span>
      </div>

      <div className={`item-card-sprite-box ${item.category === 'skins' ? 'item-card-sprite-skin' : ''}`.trim()}>
        {item.category === 'skins' ? (
          <div className="item-card-skin-preview">
            <PlayerSprite skin={item.skinId || 'default'} fx="idle" />
          </div>
        ) : (
          <PixelItemSprite itemId={item.id} category={item.category} size={44} />
        )}
        {typeof quantity === 'number' && (
          <span className="item-qty-pill" title="Cantidad en inventario">
            x{quantity}
          </span>
        )}
      </div>

      <div className="item-card-body">
        <h4 className="item-card-name">{item.name}</h4>
        <span className="item-card-effect">{item.effectLabel}</span>
      </div>

      <div className="item-card-footer">
        <span className="item-card-price">
          {state === 'equipped' ? (
            '★ ACTIVO'
          ) : state === 'purchased' ? (
            '✔ EN INVENTARIO'
          ) : (
            <>
              <PixelCoinIcon size={14} />
              <strong>{item.price}</strong>
            </>
          )}
        </span>

        {onAction && (
          <button
            type="button"
            className={`btn item-card-btn ${state === 'equipped' ? 'btn-secondary' : state === 'purchased' ? 'btn-special' : ''}`.trim()}
            disabled={actionDisabled}
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(item)
              onAction(item)
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  )
}

export default ItemCard
