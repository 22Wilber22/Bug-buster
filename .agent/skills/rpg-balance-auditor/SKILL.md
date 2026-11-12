---
name: rpg-balance-auditor
description: >-
  Audita y equilibra las estadísticas RPG (HP, daño, recompensas, café y curva de
  dificultad) de Bug Buster: El Piso Vacío. Usa esta skill cuando el usuario pida
  revisar o ajustar el balance de jefes, simular combates, calibrar nuevos pisos o
  verificar src/engine/battle.js y src/engine/balance.test.js.
---

# RPG Balance Auditor (`rpg-balance-auditor`)

Analiza matemáticamente la curva de dificultad, economía de monedas/café y supervivencia del jugador a lo largo de los pisos de *Bug Buster: El Piso Vacío*.

## Instrucciones Operativas

1. **Inspeccionar los parámetros actuales del motor y jefes:**
   - Revisa las constantes en `src/engine/battle.js`:
     - `PLAYER_MAX_HP` (100), `PLAYER_DAMAGE` (10), `MAX_STREAK` (3), `REFACTOR_MULTIPLIER` (2 → 20 HP), `CRIT_MULTIPLIER` (2), `COMMENT_USES` (2).
   - Revisa la economía en `src/engine/save.js`:
     - `COFFEE_COST` (25 monedas), `COFFEE_HEAL` (+35 HP).
   - Revisa las estadísticas de cada jefe en `src/data/bosses.js` (`hp`, `damage`, `rewardCoins`) y las simulaciones en `src/engine/balance.test.js` (y `src/engine/balance.js` si existe).
2. **Evaluar métricas de equilibrio por jefe:**
   - **Turnos para ganar (sin fallos):** `ceil(boss.hp / PLAYER_DAMAGE)` en modo normal, o menor usando `refactor` (20 HP cada 4.º turno tras 3 respuestas resueltas).
   - **Daño recibido en victoria perfecta (sin escudos):** `(turnos - 1) * boss.damage` (el jefe no contraataca en el golpe que lo derrota).
   - **Margen de errores (`missesToLose`):** Número de respuestas fallidas (recibiendo daño crítico `boss.damage * 2`) que el jugador puede soportar antes de caer a `0 HP`.
   - **Detección de anomalías:**
     - *Jefe imposible:* `hpLeft <= 0` en partida sin fallos o `missesToLose < 2`.
     - *Jefe trivial:* `hpLeft > 90` sin usar escudos o `missesToLose > 10`.
3. **Verificar el ataque especial Refactor:**
   - Comprueba que `state.streak` incremente en cada respuesta normal resuelta (acierto o fallo) hasta `MAX_STREAK = 3`, habilite `canRefactor(state)` en fase `'choose'`, inflija `20 HP` al acertar y se reinicie a `0` al resolverse.
4. **Proponer antes de modificar:**
   - Presenta una tabla comparativa con los valores actuales vs. propuestos (`hp`, `damage`, `rewardCoins`, `hpLeft`, `missesToLose`, `missesToLoseRefactor`) y espera confirmación del usuario antes de editar `src/data/bosses.js` o `src/engine/balance.test.js`.

## Límites y Restricciones

- **Respetar las reglas de combate vigentes:** No cambies la fórmula de daño crítico, el límite de escudos (`COMMENT_USES`) ni la regla de carga de `streak` salvo petición explícita del usuario.
- **No ajustar tests solo para que pasen:** Si `src/engine/balance.test.js` falla tras un cambio, explica primero la causa matemática.

## Criterios de Validación

1. Ejecuta `npm test` para verificar que `src/engine/balance.test.js` y `src/engine/battle.test.js` pasen al 100%.
2. Ejecuta `npm run lint` y `npm run build`.
