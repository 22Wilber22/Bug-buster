# Hoja de Ruta (Roadmap) — Bug Buster 2.0

## Fase 0: Auditoría y Documentación Técnica (Completada)
- Inspección completa de `src/engine/`, `src/components/`, `src/screens/` y `src/data/`.
- Verificación de las 116 pruebas unitarias existentes.

## Fase 1: Sistema de Animaciones (`walk`, `enter`, `exit`) y Transición de Victoria
- Ampliar `PlayerSprite.jsx` y `BossSprite.jsx` con soporte para estados `walk`, `enter`, `exit` y orientación horizontal (`facing="right" | "left"`).
- Implementar `src/engine/transitionMachine.js` con los estados `combat`, `enemy_defeated`, `victory`, `rewards`, `walking_right`, `exiting`, `loading_next_level`, `entering`, `ready`.
- Integrar la secuencia visual de victoria + caminata hacia el portal digital `[ > ]` al derrotar a un enemigo en `Battle.jsx`.

## Fase 2: Patrones de Enemigos y Señales Visuales
- Implementar `src/engine/enemyPatterns.js` con los arquetipos `agresivo`, `defensivo`, `estrategico`, `impredecible` y `jefe` para los 12 enemigos.
- Mostrar avisos tácticos de anticipación en la interfaz de combate.

## Fase 3: Rediseño de la Tienda Cyberpunk, Mejoras Permanentes, Skins y Logros
- Implementar `src/engine/progression.js` para gestionar mejoras permanentes, cosméticos (skins y accesorios) y logros sin alterar la estructura base de `bug-buster-save`.
- Rediseñar `src/components/CoffeeShop.jsx` con escenario de tienda tecnológica, NPC vendedor con animación `idle`, pestañas de catálogo, animaciones de compra segura y panel de logros.

## Fase 4: Exploración Lateral 2D e Integración Híbrida
- Implementar `src/engine/exploration.js` y `src/screens/Exploration.jsx` con movimiento lateral (`A`/`D` o flechas, `E` para interactuar), seguimiento suave de cámara, colisión con terminal de tienda, encuentro con el enemigo visible y portal de salida.
- Integrar el acceso a la exploración desde `FloorMap.jsx` y `App.jsx`.

## Fase 5: Pruebas de Regresión, Rendimiento y Auditoría Final
- Añadir pruebas automatizadas para transiciones, patrones de enemigos, tienda/economía, mejoras permanentes, skins, logros y exploración 2D.
- Verificar `npm test`, `npm run lint` y `npm run build`.
