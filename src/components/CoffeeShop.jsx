import { useState } from 'react'
import { PLAYER_MAX_HP } from '../engine/battle'
import { COFFEE_COST, COFFEE_HEAL, loadSave, writeSave } from '../engine/save'
import {
  SHOP_CATALOG,
  calculatePlayerStats,
  equipAccessory,
  equipSkin,
  evaluateAchievements,
  loadProgression,
  purchaseShopItem,
} from '../engine/progression'
import { playSfx } from '../engine/sound'
import {
  NpcByteSprite,
  PixelCoinIcon,
  PixelItemSprite,
  PixelMedalSprite,
  PixelStatIcon,
} from './PixelIcons'
import ItemCard from './ItemCard'
import TrophyRoom from './TrophyRoom'
import PlayerSprite from './PlayerSprite'

const VENDOR_QUOTES = {
  default: '«¿Qué necesitas mejorar hoy?»',
  consumables: '«¿Qué necesitas mejorar hoy? Un sorbo de código limpio y compilás sin errores.»',
  upgrades: '«Hardware de grado militar para resistir los ataques del servidor central.»',
  skins: '«Si vas a depurar producción a las 3 AM, hacelo con estilo cyberpunk.»',
  accessories: '«Módulos holográficos y hojas de plasma para destacar en la terminal.»',
  achievements: '«Tus hazañas quedan registradas en la Sala de Trofeos de TechCorp.»',
}

const TABS = [
  { id: 'consumables', label: 'Consumibles', iconType: 'coffee' },
  { id: 'upgrades', label: 'Mejoras', iconType: 'def' },
  { id: 'skins', label: 'Skins', iconType: 'atk' },
  { id: 'accessories', label: 'Accesorios', iconType: 'hp' },
  { id: 'achievements', label: 'Logros', iconType: 'medal' },
]

const CATEGORY_LABELS = {
  consumables: 'Consumible',
  upgrades: 'Mejora Permanente',
  skins: 'Skin de Personaje',
  accessories: 'Accesorio Cyber',
}

function normalizeTabId(tabId) {
  if (tabId === 'cosmetics') return 'skins'
  if (TABS.some((t) => t.id === tabId)) return tabId
  return 'consumables'
}

function getDefaultItemForTab(tabId) {
  const category = tabId === 'achievements' ? 'consumables' : tabId
  return SHOP_CATALOG.find((item) => item.category === category) || SHOP_CATALOG[0]
}

function getUpgradeComparisonRows(item, stats) {
  if (!item || item.category !== 'upgrades' || !item.statBonus) return []
  const rows = []
  if (item.statBonus.maxHp > 0) {
    const current = stats.final.maxHp
    const delta = item.statBonus.maxHp
    rows.push({
      key: 'maxHp',
      label: 'Vida Máx actual',
      current,
      next: current + delta,
      delta,
      text: `Vida Máx actual: ${current} → Después de mejora: ${current + delta} (+${delta})`,
    })
  }
  if (item.statBonus.attack > 0) {
    const current = stats.final.attack
    const delta = item.statBonus.attack
    rows.push({
      key: 'attack',
      label: 'Ataque actual',
      current,
      next: current + delta,
      delta,
      text: `Ataque actual: ${current} → Después de mejora: ${current + delta} (+${delta})`,
    })
  }
  if (item.statBonus.defense > 0) {
    const current = stats.final.defense
    const delta = item.statBonus.defense
    rows.push({
      key: 'defense',
      label: 'Defensa actual',
      current,
      next: current + delta,
      delta,
      text: `Defensa actual: ${current} → Después de mejora: ${current + delta} (+${delta})`,
    })
  }
  if (item.statBonus.coffeeBonus > 0) {
    const current = stats.final.coffeeHeal
    const delta = item.statBonus.coffeeBonus
    rows.push({
      key: 'coffeeHeal',
      label: 'Curación Café actual',
      current,
      next: current + delta,
      delta,
      text: `Curación Café actual: ${current} → Después de mejora: ${current + delta} (+${delta})`,
    })
  }
  return rows
}

function CoffeeShop({
  playerHp = PLAYER_MAX_HP,
  coins = 0,
  coffees = 0,
  defeatedBossIds,
  onBuyCoffee,
  onUseCoffee,
  onProgressionChange,
  initialTab = 'consumables',
}) {
  const startTab = normalizeTabId(initialTab)
  const [progression, setProgression] = useState(() => {
    const initialProg = loadProgression()
    const currentSave = loadSave()
    const mergedDefeated = Array.isArray(defeatedBossIds)
      ? defeatedBossIds
      : currentSave.defeatedBossIds || []
    const syncedSave = {
      ...currentSave,
      defeatedBossIds: mergedDefeated,
      coins: Math.max(currentSave.coins || 0, coins || 0),
    }
    return evaluateAchievements(syncedSave, initialProg).progression
  })
  const [activeTab, setActiveTab] = useState(startTab)
  const [selectedItemId, setSelectedItemId] = useState(() => getDefaultItemForTab(startTab)?.id)
  const [purchasingId, setPurchasingId] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [achievementToast, setAchievementToast] = useState(null)
  const [vendorMood, setVendorMood] = useState('idle')
  const [vendorQuote, setVendorQuote] = useState(VENDOR_QUOTES.default)

  const propSnapshotKey = `${coins}:${coffees}:${playerHp}`
  const [localOverride, setLocalOverride] = useState(null)

  const stats = calculatePlayerStats(progression)
  const activeWallet =
    localOverride && localOverride.key === propSnapshotKey
      ? localOverride
      : { coins, coffees, playerHp }
  const effectiveCoins = activeWallet.coins
  const effectiveCoffees = activeWallet.coffees
  const effectiveHp = Math.min(stats.final.maxHp, activeWallet.playerHp)

  const canBuy = effectiveCoins >= COFFEE_COST && !purchasingId
  const canDrink = effectiveCoffees > 0 && effectiveHp < stats.final.maxHp

  const savedDefeated = Array.isArray(defeatedBossIds)
    ? defeatedBossIds
    : loadSave().defeatedBossIds || []
  const defeatedCount = savedDefeated.length
  const collectibleCount =
    progression.ownedUpgrades.length +
    Math.max(0, progression.unlockedSkins.length - 1) +
    progression.unlockedAccessories.length

  const getItemState = (item) => {
    if (!item) return 'available'
    if (item.category === 'upgrades') {
      if (progression.ownedUpgrades.includes(item.id)) return 'purchased'
    } else if (item.category === 'skins') {
      if (progression.equippedSkin === item.skinId) return 'equipped'
      if (progression.unlockedSkins.includes(item.skinId)) return 'purchased'
    } else if (item.category === 'accessories') {
      if (progression.equippedAccessory === item.accessoryId) return 'equipped'
      if (progression.unlockedAccessories.includes(item.accessoryId)) return 'purchased'
    }
    if (effectiveCoins < item.price) return 'insufficient'
    return 'available'
  }

  const catalogItems =
    activeTab === 'achievements'
      ? []
      : SHOP_CATALOG.filter((item) => item.category === activeTab)

  const selectedItem =
    catalogItems.find((item) => item.id === selectedItemId) ||
    catalogItems[0] ||
    SHOP_CATALOG.find((item) => item.id === selectedItemId) ||
    SHOP_CATALOG[0]

  const handleSelectItem = (item) => {
    setSelectedItemId(item.id)
    setVendorMood('idle')
    setVendorQuote(`«${item.name}: ${item.description}»`)
  }

  const handleTabChange = (tabId) => {
    const resolved = normalizeTabId(tabId)
    playSfx('click')
    setActiveTab(resolved)
    setFeedback(null)
    setVendorMood('idle')
    if (resolved === 'achievements') {
      const currentSave = loadSave()
      const syncedSave = {
        ...currentSave,
        defeatedBossIds: savedDefeated,
        coins: Math.max(currentSave.coins || 0, effectiveCoins || 0),
      }
      const evalResult = evaluateAchievements(syncedSave, progression)
      if (evalResult.newlyUnlocked.length > 0) {
        setProgression(evalResult.progression)
        setAchievementToast(evalResult.newlyUnlocked[0])
        onProgressionChange?.({
          ok: true,
          save: evalResult.save,
          progression: evalResult.progression,
          newlyUnlockedAchievements: evalResult.newlyUnlocked,
        })
      }
    }
    const defaultItem = getDefaultItemForTab(resolved)
    if (defaultItem && resolved !== 'achievements') {
      setSelectedItemId(defaultItem.id)
    }
    setVendorQuote(VENDOR_QUOTES[resolved] || VENDOR_QUOTES.default)
  }

  const triggerPurchase = (item, { viaQuickCoffee = false } = {}) => {
    if (purchasingId) return

    const currentProg = loadProgression()
    if (!item.repeatable) {
      const alreadyOwned =
        (item.category === 'upgrades' && currentProg.ownedUpgrades.includes(item.id)) ||
        (item.category === 'skins' && currentProg.unlockedSkins.includes(item.skinId)) ||
        (item.category === 'accessories' &&
          currentProg.unlockedAccessories.includes(item.accessoryId))

      if (alreadyOwned) {
        playSfx('wrong')
        setVendorMood('error')
        setFeedback({
          type: 'error',
          message: `Ya adquiriste «${item.name}». No se permiten compras duplicadas.`,
        })
        setVendorQuote('«Ese módulo ya está instalado en tu sistema, debugger.»')
        return
      }
    }

    if (effectiveCoins < item.price) {
      playSfx('wrong')
      setVendorMood('error')
      setFeedback({
        type: 'error',
        message: `Monedas insuficientes para «${item.name}» (necesitás ${item.price}, tenés ${effectiveCoins}).`,
      })
      setVendorQuote('«Saldo insuficiente. Derrotá más bugs en los pisos para ganar monedas.»')
      return
    }

    setPurchasingId(item.id)
    try {
      const beforeCoins = effectiveCoins
      const beforeCoffees = effectiveCoffees
      const beforeHp = effectiveHp

      writeSave({
        coins: beforeCoins,
        coffees: beforeCoffees,
        playerHp: beforeHp,
      })

      const result = purchaseShopItem(item.id)
      if (!result.ok) {
        playSfx('wrong')
        setVendorMood('error')
        setFeedback({
          type: 'error',
          message:
            result.reason === 'already_owned'
              ? `Ya poseés «${item.name}».`
              : `No pudimos procesar la compra de «${item.name}».`,
        })
        return
      }

      if ((viaQuickCoffee || item.id === 'coffee-pack') && typeof onBuyCoffee === 'function') {
        const achBonus = result.save.coins - (beforeCoins - COFFEE_COST)
        writeSave({
          coins: beforeCoins + Math.max(0, achBonus),
          coffees: beforeCoffees,
          playerHp: beforeHp,
        })
        onBuyCoffee()
        const afterCallback = loadSave()
        if (afterCallback.coffees === beforeCoffees) {
          writeSave({
            coins: result.save.coins,
            coffees: result.save.coffees,
            playerHp: result.save.playerHp,
          })
        }
      } else if (item.instantHeal && typeof onUseCoffee === 'function') {
        // Sincroniza curación inmediata si el contenedor maneja HP por props
      }

      setLocalOverride({
        key: propSnapshotKey,
        coins: result.save.coins,
        coffees: result.save.coffees,
        playerHp: result.save.playerHp,
      })
      setProgression(result.progression)
      setVendorMood('happy')

      const sfxName = item.category === 'consumables' ? 'heal' : 'win'
      playSfx(sfxName)

      setFeedback({
        type: 'success',
        message: `¡Compra realizada! Adquiriste «${item.name}» (${item.effectLabel}).`,
      })
      setVendorQuote(`«¡Excelente elección! ${item.name} listo para el próximo combate.»`)

      if (result.newlyUnlockedAchievements?.length > 0) {
        setAchievementToast(result.newlyUnlockedAchievements[0])
      }

      onProgressionChange?.(result)
    } finally {
      setPurchasingId(null)
    }
  }

  const handleQuickBuyCoffee = () => {
    const coffeeItem = SHOP_CATALOG.find((entry) => entry.id === 'coffee-pack')
    if (coffeeItem) {
      triggerPurchase(coffeeItem, { viaQuickCoffee: true })
    }
  }

  const handleDrinkCoffee = () => {
    if (!canDrink) return
    playSfx('heal')
    const nextHp = Math.min(stats.final.maxHp, effectiveHp + stats.final.coffeeHeal)
    setLocalOverride({
      key: propSnapshotKey,
      coins: effectiveCoins,
      coffees: Math.max(0, effectiveCoffees - 1),
      playerHp: nextHp,
    })
    setVendorMood('happy')
    setFeedback({
      type: 'success',
      message: `Tomaste un Café TechCorp (+${stats.final.coffeeHeal} HP).`,
    })
    setVendorQuote('«¡Cafeína en vena! Tu barra de salud vuelve a brillar.»')
    onUseCoffee?.(Math.min(PLAYER_MAX_HP, effectiveHp + stats.final.coffeeHeal))
  }

  const handleEquipSkin = (skinId, name) => {
    playSfx('click')
    const updated = equipSkin(skinId)
    setProgression(updated)
    setVendorMood('happy')
    setFeedback({
      type: 'success',
      message: `Skin equipada: «${name}».`,
    })
    setVendorQuote(`«El look ${name} te sienta de maravilla.»`)
    onProgressionChange?.({
      ok: true,
      save: loadSave(),
      progression: updated,
      newlyUnlockedAchievements: [],
    })
  }

  const handleToggleAccessory = (accessoryId, name) => {
    playSfx('click')
    const nextId = progression.equippedAccessory === accessoryId ? null : accessoryId
    const updated = equipAccessory(nextId)
    setProgression(updated)
    setVendorMood('happy')
    setFeedback({
      type: 'success',
      message: nextId ? `Accesorio equipado: «${name}».` : `Accesorio desequipado: «${name}».`,
    })
    setVendorQuote(
      nextId
        ? `«Módulo ${name} sincronizado en tu traje.»`
        : `«Desconectaste ${name} de tu equipamiento.»`,
    )
    onProgressionChange?.({
      ok: true,
      save: loadSave(),
      progression: updated,
      newlyUnlockedAchievements: [],
    })
  }

  const getItemActionConfig = (item) => {
    if (!item) return { label: 'Comprar', disabled: true, onAction: () => {} }
    const state = getItemState(item)
    const isBusy = purchasingId === item.id

    if (item.category === 'consumables') {
      return {
        label: isBusy ? 'Procesando...' : 'Comprar',
        disabled: Boolean(purchasingId),
        onAction: () =>
          item.id === 'coffee-pack' ? handleQuickBuyCoffee() : triggerPurchase(item),
      }
    }

    if (item.category === 'upgrades') {
      const owned = state === 'purchased'
      return {
        label: owned ? 'Mejora Instalada' : isBusy ? 'Instalando...' : 'Instalar Mejora',
        disabled: owned || Boolean(purchasingId),
        onAction: () => triggerPurchase(item),
      }
    }

    if (item.category === 'skins') {
      const unlocked = state === 'purchased' || state === 'equipped'
      const equipped = state === 'equipped'
      if (unlocked) {
        return {
          label: equipped ? 'Skin Equipada' : 'Equipar Skin',
          disabled: equipped,
          onAction: () => handleEquipSkin(item.skinId, item.name),
        }
      }
      return {
        label: isBusy ? 'Desbloqueando...' : 'Comprar',
        disabled: Boolean(purchasingId),
        onAction: () => triggerPurchase(item),
      }
    }

    if (item.category === 'accessories') {
      const unlocked = state === 'purchased' || state === 'equipped'
      const equipped = state === 'equipped'
      if (unlocked) {
        return {
          label: equipped ? 'Desequipar Accesorio' : 'Equipar Accesorio',
          disabled: false,
          onAction: () => handleToggleAccessory(item.accessoryId, item.name),
        }
      }
      return {
        label: isBusy ? 'Desbloqueando...' : 'Comprar',
        disabled: Boolean(purchasingId),
        onAction: () => triggerPurchase(item),
      }
    }

    return { label: 'Comprar', disabled: false, onAction: () => triggerPurchase(item) }
  }

  // Cálculo de vista previa en vivo para la Zona 3 (JUGADOR)
  const isPreviewingSkin =
    activeTab !== 'achievements' &&
    selectedItem?.category === 'skins' &&
    selectedItem.skinId !== progression.equippedSkin
  const isPreviewingAccessory =
    activeTab !== 'achievements' &&
    selectedItem?.category === 'accessories' &&
    selectedItem.accessoryId !== progression.equippedAccessory

  const previewSkin = isPreviewingSkin ? selectedItem.skinId : progression.equippedSkin
  const previewAccessory = isPreviewingAccessory
    ? selectedItem.accessoryId
    : progression.equippedAccessory
  const isCosmeticPreview = isPreviewingSkin || isPreviewingAccessory

  // Cálculo de delta de mejora no comprada seleccionada en el catálogo
  const isUnownedUpgradeSelected =
    activeTab !== 'achievements' &&
    selectedItem?.category === 'upgrades' &&
    !progression.ownedUpgrades.includes(selectedItem.id)

  const pendingBonus = isUnownedUpgradeSelected
    ? {
        maxHp: selectedItem.statBonus?.maxHp || 0,
        attack: selectedItem.statBonus?.attack || 0,
        defense: selectedItem.statBonus?.defense || 0,
        coffeeHeal: selectedItem.statBonus?.coffeeBonus || 0,
      }
    : { maxHp: 0, attack: 0, defense: 0, coffeeHeal: 0 }

  const upgradeComparisonRows = getUpgradeComparisonRows(selectedItem, stats)
  const selectedAction = getItemActionConfig(selectedItem)
  const selectedState = getItemState(selectedItem)

  const equippedSkinItem =
    SHOP_CATALOG.find(
      (entry) => entry.category === 'skins' && entry.skinId === progression.equippedSkin,
    ) || SHOP_CATALOG.find((entry) => entry.id === 'skin-default')

  const hpPercent = Math.max(
    0,
    Math.min(100, Math.round((effectiveHp / Math.max(1, stats.final.maxHp)) * 100)),
  )

  return (
    <section className="coffee-shop cyber-shop rpg-store-shell" aria-label="Máquina de café">
      {/* 1. BARRA SUPERIOR (store-topbar) */}
      <header className="store-topbar shop-header-stage">
        <div className="store-topbar-left">
          <strong className="store-main-title shop-title">TECHCORP · TIENDA</strong>
          <p className="store-subtitle muted">
            Terminal de suministros, mejoras de hardware y personalización
            <span className="sr-only">
              {' '}
              · Tu vida: {effectiveHp}/{stats.final.maxHp} HP · Monedas: {effectiveCoins} · Cafés:{' '}
              {effectiveCoffees}
            </span>
          </p>
        </div>

        <div className="store-topbar-right shop-wallet-hud">
          <span className="store-currency-pill shop-badge shop-badge-coins" title="Monedas disponibles">
            <PixelCoinIcon size={18} />
            <strong>{effectiveCoins}</strong>
          </span>
          <span className="store-currency-pill shop-badge shop-badge-coffees" title="Cafés en inventario">
            <PixelStatIcon type="coffee" size={16} />
            <strong>{effectiveCoffees}</strong>
          </span>
        </div>
      </header>

      {/* Notificación de Logro Desbloqueado */}
      {achievementToast && (
        <div className="achievement-toast" role="status" aria-live="polite">
          <div className="achievement-toast-content">
            <PixelMedalSprite unlocked category={achievementToast.category} size={28} />
            <div>
              <strong>¡Logro Desbloqueado: {achievementToast.name}!</strong>
              <p className="muted">
                {achievementToast.description} (+{achievementToast.rewardCoins} monedas)
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary achievement-toast-close"
            onClick={() => setAchievementToast(null)}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Feedback de compra / equipamiento */}
      {feedback && (
        <div
          className={`shop-feedback ${
            feedback.type === 'error' ? 'shop-feedback-error' : 'shop-feedback-success'
          }`}
          role="alert"
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. DISTRIBUCIÓN EN 3 ZONAS (.rpg-store-layout) */}
      <div className="rpg-store-layout">
        {/* ZONA IZQUIERDA — VENDEDOR (.store-zone-vendor) */}
        <aside className="store-zone store-zone-vendor" aria-label="Zona del Vendedor">
          <div className="store-zone-header">
            <h3 className="store-zone-title">VENDEDOR</h3>
          </div>

          <div className="vendor-stage-box npc-vendor-sprite">
            <NpcByteSprite mood={vendorMood} />
          </div>

          <div className="vendor-dialogue-card npc-vendor-card">
            <div className="vendor-dialogue-head">
              <strong className="npc-vendor-name">Byte</strong>
              <span className="vendor-role-tag">Mercader Cyber-Barista</span>
            </div>
            <p className="npc-vendor-dialogue">{vendorQuote}</p>
          </div>

          <div className="vendor-quick-belt actions shop-quick-actions">
            <span className="vendor-belt-label">Cinturón Rápido</span>
            <button
              className="btn btn-coffee"
              type="button"
              disabled={!canBuy}
              onClick={handleQuickBuyCoffee}
            >
              <PixelStatIcon type="coffee" size={14} /> Comprar Café (+{COFFEE_HEAL} HP) ·{' '}
              {COFFEE_COST} <PixelCoinIcon size={14} />
            </button>
            {effectiveCoffees > 0 && (
              <button
                className="btn"
                type="button"
                disabled={!canDrink}
                onClick={handleDrinkCoffee}
              >
                <PixelStatIcon type="hp" size={14} /> Tomar Café ahora (+{stats.final.coffeeHeal}{' '}
                HP)
              </button>
            )}
          </div>
        </aside>

        {/* ZONA CENTRAL — CATÁLOGO (.store-zone-catalog) */}
        <div className="store-zone store-zone-catalog" aria-label="Zona de Catálogo">
          <div className="store-zone-header store-catalog-header">
            <h3 className="store-zone-title">CATÁLOGO</h3>
            <div className="shop-tabs" role="tablist" aria-label="Categorías de la tienda">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`btn shop-tab-btn ${isActive ? 'shop-tab-active active' : 'btn-secondary'}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.iconType === 'medal' ? (
                      <PixelMedalSprite unlocked size={16} />
                    ) : (
                      <PixelStatIcon type={tab.iconType} size={14} />
                    )}
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {activeTab !== 'achievements' ? (
            <div className="store-catalog-body" role="tabpanel">
              <div className="store-catalog-grid shop-grid">
                {catalogItems.map((item) => {
                  const itemState = getItemState(item)
                  const actionCfg = getItemActionConfig(item)
                  const qty = item.id === 'coffee-pack' ? effectiveCoffees : undefined
                  return (
                    <ItemCard
                      key={item.id}
                      item={item}
                      state={itemState}
                      selected={selectedItem?.id === item.id}
                      quantity={qty}
                      onSelect={handleSelectItem}
                      onAction={() => actionCfg.onAction()}
                      actionLabel={actionCfg.label}
                      actionDisabled={actionCfg.disabled}
                    />
                  )
                })}
              </div>

              {/* Panel Inspector de Detalle (.item-inspector-panel) */}
              {selectedItem && (
                <div className="item-inspector-panel" aria-label="Detalle del producto seleccionado">
                  <div className="inspector-main-row">
                    <div className="inspector-sprite-col">
                      {selectedItem.category === 'skins' ? (
                        <div className="item-card-skin-preview">
                          <PlayerSprite skin={selectedItem.skinId || 'default'} fx="idle" />
                        </div>
                      ) : (
                        <PixelItemSprite
                          itemId={selectedItem.id}
                          category={selectedItem.category}
                          size={48}
                        />
                      )}
                    </div>

                    <div className="inspector-info-col">
                      <div className="inspector-title-line">
                        <h4 className="inspector-item-name">{selectedItem.name}</h4>
                        <span className="inspector-category-tag">
                          {CATEGORY_LABELS[selectedItem.category] || selectedItem.category}
                        </span>
                      </div>
                      <p className="inspector-description muted">{selectedItem.description}</p>

                      {/* Comparativa antes y después obligatoria para Mejoras */}
                      {selectedItem.category === 'upgrades' && upgradeComparisonRows.length > 0 && (
                        <div className="inspector-stat-comparison">
                          {upgradeComparisonRows.map((row) => (
                            <p key={row.key} className="comparison-line">
                              <strong>{row.text}</strong>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="inspector-action-col">
                      <div className="inspector-price-box">
                        {selectedState === 'equipped' ? (
                          <span className="inspector-status-owned">EQUIPADO</span>
                        ) : selectedState === 'purchased' ? (
                          <span className="inspector-status-owned">ADQUIRIDO</span>
                        ) : (
                          <span className="inspector-price-value">
                            <PixelCoinIcon size={16} />
                            <strong>{selectedItem.price}</strong>
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn inspector-action-btn"
                        disabled={selectedAction.disabled}
                        onClick={() => selectedAction.onAction()}
                      >
                        {selectedAction.label}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="store-catalog-body" role="tabpanel">
              <TrophyRoom
                unlockedIds={progression.unlockedAchievements}
                defeatedBossIds={savedDefeated}
                defeatedCount={defeatedCount}
                purchaseCount={progression.purchaseCount}
                collectibleCount={collectibleCount}
                coins={effectiveCoins}
              />
            </div>
          )}
        </div>

        {/* ZONA DERECHA — JUGADOR (.store-zone-player) */}
        <aside className="store-zone store-zone-player" aria-label="Zona del Jugador">
          <div className="store-zone-header">
            <h3 className="store-zone-title">JUGADOR</h3>
          </div>

          <div className="player-preview-stage">
            <PlayerSprite skin={previewSkin} accessory={previewAccessory} fx="idle" />
          </div>
          {isCosmeticPreview && selectedItem && (
            <span className="cosmetic-preview-badge">
              VISTA PREVIA: {selectedItem.name}
            </span>
          )}

          {/* Barra visual de salud */}
          <div className="player-store-hp-box">
            <div className="player-store-hp-head">
              <span className="hp-label">
                <PixelStatIcon type="hp" size={14} /> HP {effectiveHp}/{stats.final.maxHp}
              </span>
              {pendingBonus.maxHp > 0 && (
                <span className="stat-delta-preview">+{pendingBonus.maxHp} HP</span>
              )}
            </div>
            <div className="player-store-hp-track" aria-hidden="true">
              <div className="player-store-hp-fill" style={{ width: `${hpPercent}%` }} />
            </div>
          </div>

          {/* Tabla de estadísticas reales (sin texto repetido) */}
          <div className="player-store-stats-table" aria-label="Estadísticas del jugador">
            <div className="store-stat-row">
              <span className="store-stat-name">
                <PixelStatIcon type="atk" size={14} /> Ataque
              </span>
              <strong className="store-stat-val">
                ATQ {stats.final.attack}
                {pendingBonus.attack > 0 && (
                  <span className="stat-delta-preview"> +{pendingBonus.attack}</span>
                )}
              </strong>
            </div>

            <div className="store-stat-row">
              <span className="store-stat-name">
                <PixelStatIcon type="def" size={14} /> Defensa
              </span>
              <strong className="store-stat-val">
                DEF {stats.final.defense}
                {pendingBonus.defense > 0 && (
                  <span className="stat-delta-preview"> +{pendingBonus.defense}</span>
                )}
              </strong>
            </div>

            <div className="store-stat-row">
              <span className="store-stat-name">
                <PixelStatIcon type="coffee" size={14} /> Curación
              </span>
              <strong className="store-stat-val">
                CAFÉ +{stats.final.coffeeHeal} HP
                {pendingBonus.coffeeHeal > 0 && (
                  <span className="stat-delta-preview"> +{pendingBonus.coffeeHeal}</span>
                )}
              </strong>
            </div>
          </div>

          {/* Resumen compacto de mejoras activas y skin equipada */}
          <div className="player-store-summary">
            <div className="summary-line">
              <span className="muted">Mejoras activas:</span>
              <strong>{progression.ownedUpgrades.length}</strong>
            </div>
            <div className="summary-line">
              <span className="muted">Skin equipada:</span>
              <strong>{equippedSkinItem?.name || progression.equippedSkin}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default CoffeeShop
