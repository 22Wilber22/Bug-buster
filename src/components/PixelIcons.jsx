/**
 * Biblioteca de sprites e iconos Pixel Art en SVG puro (shapeRendering="crispEdges").
 * Reemplaza cualquier uso de emojis como recurso gráfico final en tienda, mejoras, skins,
 * trofeos y mapa de progresión. Licencia: creación original propia del proyecto Bug Buster.
 */

export function PixelCoinIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`px-svg-icon ${className}`.trim()}
      aria-hidden="true"
    >
      <rect x="5" y="1" width="6" height="1" fill="#FFF3B0" />
      <rect x="3" y="2" width="10" height="2" fill="#FFCC33" />
      <rect x="2" y="4" width="12" height="8" fill="#FFCC33" />
      <rect x="3" y="12" width="10" height="2" fill="#D99B00" />
      <rect x="5" y="14" width="6" height="1" fill="#996B00" />
      <rect x="6" y="4" width="2" height="8" fill="#FFF3B0" />
      <rect x="8" y="4" width="2" height="8" fill="#B37D00" />
    </svg>
  )
}

export function PixelStatIcon({ type = 'hp', size = 16 }) {
  if (type === 'atk') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="px-svg-icon" aria-hidden="true">
        <rect x="11" y="2" width="3" height="3" fill="#00D9FF" />
        <rect x="9" y="4" width="3" height="3" fill="#00D9FF" />
        <rect x="7" y="6" width="3" height="3" fill="#7CEBFF" />
        <rect x="5" y="8" width="3" height="3" fill="#00D9FF" />
        <rect x="3" y="10" width="3" height="2" fill="#FFCC33" />
        <rect x="2" y="12" width="2" height="2" fill="#996B00" />
      </svg>
    )
  }
  if (type === 'def') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="px-svg-icon" aria-hidden="true">
        <rect x="3" y="2" width="10" height="2" fill="#00D9FF" />
        <rect x="2" y="4" width="12" height="5" fill="#18688C" />
        <rect x="4" y="5" width="8" height="3" fill="#00FFB2" />
        <rect x="4" y="9" width="8" height="3" fill="#18688C" />
        <rect x="6" y="12" width="4" height="2" fill="#00D9FF" />
      </svg>
    )
  }
  if (type === 'coffee') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="px-svg-icon" aria-hidden="true">
        <rect x="5" y="1" width="1" height="2" fill="#00D9FF" />
        <rect x="8" y="1" width="1" height="2" fill="#00D9FF" />
        <rect x="3" y="4" width="8" height="8" fill="#B366FF" />
        <rect x="4" y="5" width="6" height="3" fill="#522680" />
        <rect x="11" y="5" width="2" height="4" fill="#B366FF" />
        <rect x="2" y="12" width="10" height="2" fill="#7A33CC" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" className="px-svg-icon" aria-hidden="true">
      <rect x="2" y="3" width="4" height="2" fill="#00FFB2" />
      <rect x="10" y="3" width="4" height="2" fill="#00FFB2" />
      <rect x="1" y="5" width="14" height="4" fill="#00FFB2" />
      <rect x="3" y="9" width="10" height="2" fill="#00CC8E" />
      <rect x="5" y="11" width="6" height="2" fill="#00996B" />
      <rect x="7" y="13" width="2" height="1" fill="#00996B" />
    </svg>
  )
}

/**
 * Sprite Pixel Art del NPC Vendedor "Byte" en su mostrador tecnológico.
 */
export function NpcByteSprite({ mood = 'idle' }) {
  const eyeColor = mood === 'happy' ? '#00FFB2' : mood === 'error' ? '#FF4D6D' : '#00D9FF'
  return (
    <div
      className={`npc-byte-stage npc-mood-${mood}`}
      role="img"
      aria-label="Byte, Vendedor Cyber-Barista"
    >
      <svg
        viewBox="0 0 64 64"
        shapeRendering="crispEdges"
        className="npc-byte-svg"
        aria-hidden="true"
      >
        {/* Fondo del puesto / estantería */}
        <rect x="4" y="6" width="56" height="46" fill="#0A1022" />
        <rect x="6" y="8" width="52" height="2" fill="#1E2D4A" />
        {/* Letrero neón superior */}
        <rect x="10" y="10" width="18" height="6" fill="#131F38" />
        <rect x="12" y="12" width="4" height="2" fill="#00D9FF" />
        <rect x="18" y="12" width="8" height="2" fill="#FF3CAC" />
        {/* Cafetera expreso industrial a la izquierda */}
        <rect x="8" y="26" width="10" height="16" fill="#233454" />
        <rect x="10" y="28" width="6" height="4" fill="#00FFB2" />
        <rect x="11" y="34" width="4" height="6" fill="#0D1526" />
        {/* Antena del robot Byte */}
        <rect x="31" y="10" width="2" height="4" fill="#64748B" />
        <rect x="30" y="8" width="4" height="2" fill={eyeColor} />
        {/* Cabeza pixel art de Byte */}
        <rect x="22" y="14" width="20" height="16" fill="#38BDF8" />
        <rect x="24" y="16" width="16" height="12" fill="#0F172A" />
        {/* Visor / Ojos LED */}
        <rect x="26" y="19" width="4" height="4" fill={eyeColor} />
        <rect x="34" y="19" width="4" height="4" fill={eyeColor} />
        {/* Boca / Ecualizador LED */}
        <rect x="27" y="25" width="10" height="2" fill="#00FFB2" />
        {/* Torso / Delantal de Barista-Armero */}
        <rect x="18" y="30" width="28" height="14" fill="#1E293B" />
        <rect x="22" y="31" width="20" height="13" fill="#0284C7" />
        <rect x="27" y="34" width="10" height="6" fill="#0F172A" />
        <rect x="29" y="36" width="6" height="2" fill="#FFCC33" />
        {/* Brazos mecánicos */}
        <rect x="14" y="32" width="4" height="10" fill="#475569" />
        <rect x="46" y="32" width="4" height="10" fill="#475569" />
        {/* Taza humeante sobre el mostrador */}
        <rect x="48" y="36" width="6" height="6" fill="#B366FF" />
        <rect x="50" y="32" width="2" height="3" fill="#00D9FF" />
        {/* Mostrador iluminado */}
        <rect x="2" y="44" width="60" height="4" fill="#00D9FF" />
        <rect x="2" y="48" width="60" height="12" fill="#111C33" />
        <rect x="8" y="51" width="48" height="2" fill="#1E3A5F" />
      </svg>
    </div>
  )
}

/**
 * Sprites Pixel Art de 28x28 para cada producto del catálogo.
 */
export function PixelItemSprite({ itemId, category, size = 40 }) {
  switch (itemId) {
    case 'coffee-pack':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="8" y="3" width="2" height="3" fill="#00D9FF" />
          <rect x="13" y="2" width="2" height="4" fill="#00D9FF" />
          <rect x="5" y="7" width="12" height="11" fill="#38BDF8" />
          <rect x="7" y="9" width="8" height="4" fill="#4A2511" />
          <rect x="17" y="9" width="3" height="6" fill="#38BDF8" />
          <rect x="4" y="18" width="14" height="2" fill="#0284C7" />
        </svg>
      )
    case 'espresso-shot':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="11" y="2" width="3" height="4" fill="#FFCC33" />
          <rect x="9" y="6" width="5" height="3" fill="#FFCC33" />
          <rect x="6" y="9" width="12" height="10" fill="#B366FF" />
          <rect x="8" y="11" width="8" height="5" fill="#00FFB2" />
          <rect x="5" y="19" width="14" height="2" fill="#7A33CC" />
        </svg>
      )
    case 'upg-vitality':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="5" y="3" width="14" height="3" fill="#00FFB2" />
          <rect x="4" y="6" width="16" height="9" fill="#0F766E" />
          <rect x="8" y="8" width="8" height="6" fill="#00FFB2" />
          <rect x="6" y="15" width="12" height="4" fill="#0F766E" />
          <rect x="9" y="19" width="6" height="2" fill="#00FFB2" />
        </svg>
      )
    case 'upg-compiler':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" fill="#1E293B" />
          <rect x="8" y="8" width="8" height="8" fill="#FFCC33" />
          <rect x="10" y="10" width="4" height="4" fill="#FF4D6D" />
          <rect x="9" y="3" width="2" height="3" fill="#00D9FF" />
          <rect x="13" y="3" width="2" height="3" fill="#00D9FF" />
          <rect x="9" y="18" width="2" height="3" fill="#00D9FF" />
          <rect x="13" y="18" width="2" height="3" fill="#00D9FF" />
          <rect x="3" y="9" width="3" height="2" fill="#00D9FF" />
          <rect x="18" y="9" width="3" height="2" fill="#00D9FF" />
        </svg>
      )
    case 'upg-firewall':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="4" y="4" width="16" height="4" fill="#00D9FF" />
          <rect x="4" y="9" width="7" height="4" fill="#0284C7" />
          <rect x="13" y="9" width="7" height="4" fill="#0284C7" />
          <rect x="4" y="14" width="16" height="4" fill="#00D9FF" />
          <rect x="9" y="7" width="6" height="8" fill="#FFCC33" />
        </svg>
      )
    case 'upg-thermos':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="9" y="2" width="6" height="3" fill="#94A3B8" />
          <rect x="7" y="5" width="10" height="15" fill="#00D9FF" />
          <rect x="9" y="8" width="6" height="8" fill="#00FFB2" />
          <rect x="7" y="20" width="10" height="2" fill="#0284C7" />
        </svg>
      )
    case 'skin-default':
    case 'skin-cyber-ninja':
    case 'skin-matrix':
    case 'skin-golden': {
      const coat =
        itemId === 'skin-cyber-ninja'
          ? '#FF3CAC'
          : itemId === 'skin-matrix'
            ? '#00FFB2'
            : itemId === 'skin-golden'
              ? '#FFCC33'
              : '#00D9FF'
      const trim =
        itemId === 'skin-cyber-ninja'
          ? '#00D9FF'
          : itemId === 'skin-matrix'
            ? '#059669'
            : itemId === 'skin-golden'
              ? '#FFF3B0'
              : '#0284C7'
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="8" y="3" width="8" height="3" fill="#1E293B" />
          <rect x="8" y="6" width="8" height="5" fill="#F3D7B5" />
          <rect x="9" y="7" width="6" height="2" fill={trim} />
          <rect x="5" y="11" width="14" height="10" fill={coat} />
          <rect x="9" y="13" width="6" height="6" fill="#0F172A" />
          <rect x="10" y="15" width="4" height="2" fill={trim} />
        </svg>
      )
    }
    case 'acc-visor':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          {/* Montura superior de titanio */}
          <rect x="2" y="7" width="20" height="2" fill="#94A3B8" />
          <rect x="1" y="9" width="2" height="5" fill="#475569" />
          <rect x="21" y="9" width="2" height="5" fill="#475569" />
          {/* Lente holográfico cian/esmeralda */}
          <rect x="3" y="9" width="18" height="6" fill="#00D9FF" />
          <rect x="4" y="10" width="7" height="4" fill="#00FFB2" />
          <rect x="13" y="10" width="7" height="4" fill="#0284C7" />
          {/* Reflejo HUD diagonal */}
          <rect x="5" y="10" width="2" height="2" fill="#FFFFFF" />
          <rect x="15" y="11" width="3" height="1" fill="#7CEBFF" />
          {/* Puente nasal */}
          <rect x="10" y="13" width="4" height="3" fill="#0F172A" />
          <rect x="4" y="15" width="6" height="1" fill="#1E293B" />
          <rect x="14" y="15" width="6" height="1" fill="#1E293B" />
        </svg>
      )
    case 'acc-blade-magenta':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          {/* Hoja de plasma magenta diagonal */}
          <rect x="17" y="2" width="4" height="4" fill="#FF3CAC" />
          <rect x="18" y="3" width="2" height="2" fill="#FFFFFF" />
          <rect x="14" y="5" width="4" height="4" fill="#FF3CAC" />
          <rect x="15" y="6" width="2" height="2" fill="#FFB3E6" />
          <rect x="11" y="8" width="4" height="4" fill="#FF3CAC" />
          <rect x="12" y="9" width="2" height="2" fill="#FFB3E6" />
          <rect x="8" y="11" width="4" height="4" fill="#D946EF" />
          {/* Guarda láser dorada/cian */}
          <rect x="5" y="13" width="6" height="2" fill="#00D9FF" />
          <rect x="7" y="12" width="2" height="6" fill="#FFCC33" />
          {/* Empuñadura */}
          <rect x="4" y="16" width="3" height="3" fill="#334155" />
          <rect x="2" y="18" width="3" height="3" fill="#FFCC33" />
        </svg>
      )
    case 'acc-aura-binary':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          {/* Halo binario superior */}
          <rect x="7" y="3" width="10" height="2" fill="#FFCC33" />
          <rect x="4" y="5" width="3" height="2" fill="#00FFB2" />
          <rect x="17" y="5" width="3" height="2" fill="#00FFB2" />
          <rect x="6" y="7" width="12" height="2" fill="#FFF3B0" />
          {/* Dígitos binarios 0 y 1 flotantes */}
          <rect x="5" y="11" width="3" height="5" fill="#00FFB2" />
          <rect x="6" y="12" width="1" height="3" fill="#0A1022" />
          <rect x="11" y="10" width="2" height="6" fill="#00D9FF" />
          <rect x="16" y="11" width="3" height="5" fill="#00FFB2" />
          <rect x="17" y="12" width="1" height="3" fill="#0A1022" />
          {/* Destellos inferiores */}
          <rect x="8" y="18" width="8" height="2" fill="#00D9FF" />
        </svg>
      )
    default: {
      const accent = category === 'accessories' ? '#FF3CAC' : '#00D9FF'
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-item-svg" aria-hidden="true">
          <rect x="4" y="8" width="16" height="8" fill="#1E293B" />
          <rect x="6" y="10" width="12" height="4" fill={accent} />
          <rect x="9" y="5" width="6" height="3" fill="#00D9FF" />
          <rect x="9" y="16" width="6" height="3" fill="#00D9FF" />
        </svg>
      )
    }
  }
}

/**
 * Medalla / Trofeo Pixel Art para la colección de logros.
 */
export function PixelMedalSprite({ unlocked = false, category = 'combate', size = 36 }) {
  if (!unlocked) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-medal-svg medal-locked" aria-hidden="true">
        <rect x="8" y="4" width="8" height="6" fill="#475569" />
        <rect x="10" y="6" width="4" height="4" fill="#0F172A" />
        <rect x="6" y="10" width="12" height="10" fill="#334155" />
        <rect x="11" y="13" width="2" height="4" fill="#94A3B8" />
      </svg>
    )
  }
  const ribbon =
    category === 'combate'
      ? '#FF4D6D'
      : category === 'economia'
        ? '#00FFB2'
        : category === 'coleccion'
          ? '#B366FF'
          : '#00D9FF'
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" shapeRendering="crispEdges" className="px-medal-svg medal-unlocked" aria-hidden="true">
      <rect x="7" y="2" width="4" height="6" fill={ribbon} />
      <rect x="13" y="2" width="4" height="6" fill={ribbon} />
      <rect x="6" y="8" width="12" height="12" fill="#FFCC33" />
      <rect x="8" y="10" width="8" height="8" fill="#FFF3B0" />
      <rect x="10" y="12" width="4" height="4" fill="#D99B00" />
    </svg>
  )
}
