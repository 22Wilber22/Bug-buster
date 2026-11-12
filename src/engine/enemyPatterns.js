/**
 * Sistema configurable de patrones de comportamiento de enemigos y señales de anticipación (telegraphing).
 * Mantiene intactas las fórmulas de daño de src/engine/battle.js para preservar el balance.
 */

export const ENEMY_ARCHETYPES = {
  agresivo: {
    id: 'agresivo',
    label: 'Agresivo',
    badge: '🔥 Agresivo',
    description: 'Prioriza ataques directos constantes contra tu estructura.',
  },
  defensivo: {
    id: 'defensivo',
    label: 'Defensivo',
    badge: '🛡 Defensivo',
    description: 'Alterna ofensivas con bloqueos de reglas y alta resistencia.',
  },
  estrategico: {
    id: 'estrategico',
    label: 'Estratégico',
    badge: '🧠 Estratégico',
    description: 'Analiza tus acciones y prepara ataques de precisión.',
  },
  impredecible: {
    id: 'impredecible',
    label: 'Impredecible',
    badge: '🎲 Impredecible',
    description: 'Cambia de táctica de forma errática en cada turno.',
  },
  jefe: {
    id: 'jefe',
    label: 'Jefe de Piso',
    badge: '👑 Jefe de Mundo',
    description: 'Guardián final del piso con fases de sobrecarga del sistema.',
  },
}

export const BOSS_PATTERN_PROFILES = {
  'tag-fantasma': {
    pattern: 'agresivo',
    specialMove: 'Desborde de <div> abierto',
    weakness: 'Cierre estricto de etiquetas HTML',
  },
  'etiqueta-roja': {
    pattern: 'impredecible',
    specialMove: 'Redirección 404 Fantasma',
    weakness: 'Rutas y atributos href válidos',
  },
  'html-corrupto': {
    pattern: 'jefe',
    specialMove: 'Colapso Total del DOM (Modo Quirks)',
    weakness: 'Semántica HTML5 y DOCTYPE',
  },
  'selector-oscuro': {
    pattern: 'defensivo',
    specialMove: 'Muro de !important',
    weakness: 'Jerarquía de especificidad CSS',
  },
  'flexbox-caotico': {
    pattern: 'impredecible',
    specialMove: 'Inversión de Ejes Cruzados',
    weakness: 'Alineación Flexbox y CSS Grid',
  },
  'rey-responsive': {
    pattern: 'jefe',
    specialMove: 'Viewport Fijo de 1920px',
    weakness: 'Media queries y unidades relativas',
  },
  undefined: {
    pattern: 'impredecible',
    specialMove: 'Inyección de NaN y TypeError',
    weakness: 'Igualdad estricta === y optional chaining',
  },
  'bucle-eterno': {
    pattern: 'agresivo',
    specialMove: 'Ciclo Infinito bloqueante',
    weakness: 'Condiciones de corte y métodos inmutables',
  },
  'senor-async': {
    pattern: 'jefe',
    specialMove: 'Tormenta de Promesas Rechazadas',
    weakness: 'Bloques async/await con try/catch',
  },
  'componente-roto': {
    pattern: 'defensivo',
    specialMove: 'Árbol JSX Fragmentado',
    weakness: 'Props inmutables y keys únicas',
  },
  'hook-maldito': {
    pattern: 'estrategico',
    specialMove: 'Corrupción de Cola de Hooks',
    weakness: 'Reglas de Hooks en el nivel superior',
  },
  'render-infinito': {
    pattern: 'jefe',
    specialMove: 'Maximum Update Depth Apocalypse',
    weakness: 'Dependencias limpias en useEffect y estado inmutable',
  },
}

export function getEnemyProfile(bossId) {
  const custom = BOSS_PATTERN_PROFILES[bossId] || {
    pattern: 'agresivo',
    specialMove: 'Ataque de Sintaxis',
    weakness: 'Depuración limpia',
  }
  const archetype = ENEMY_ARCHETYPES[custom.pattern] || ENEMY_ARCHETYPES.agresivo
  return {
    ...custom,
    archetype,
  }
}

/**
 * Calcula la intención/señal visual del enemigo para el turno actual de forma determinista.
 */
export function getEnemyTelegraph(boss, turnCount = 0, bossHp = boss?.hp) {
  if (!boss) return null
  const profile = getEnemyProfile(boss.id)
  const hpRatio = boss.hp > 0 ? bossHp / boss.hp : 1
  const enraged = hpRatio <= 0.4

  if (profile.pattern === 'jefe' && enraged) {
    return {
      pattern: profile.pattern,
      badge: profile.archetype.badge,
      urgent: true,
      message: `⚠ ¡FASE CRÍTICA! ${boss.name} está preparando «${profile.specialMove}» (fallar duplicará el daño a ${boss.damage * 2} HP).`,
    }
  }

  if (turnCount % 2 === 1) {
    return {
      pattern: profile.pattern,
      badge: profile.archetype.badge,
      urgent: true,
      message: `⚡ ${boss.name} está cargando «${profile.specialMove}». ¡Acierta o usa Comentar para protegerte!`,
    }
  }

  return {
    pattern: profile.pattern,
    badge: profile.archetype.badge,
    urgent: false,
    message: `🔍 Patrón ${profile.archetype.label}: vigila «${boss.attackName}» (${boss.damage} HP base / ${boss.damage * 2} HP crítico).`,
  }
}
