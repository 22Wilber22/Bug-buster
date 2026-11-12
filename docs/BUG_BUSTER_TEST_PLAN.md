# Plan de Pruebas — Bug Buster 2.0

## 1. Casos de Prueba Automatizados (Vitest)

1. **Combate y Balance (`battle.test.js`, `balance.test.js`):**
   - Daño base (10 HP), Ataque Especial (20 HP con `streak = 3`), escudo (`Comentar`) y curación con café (+35 HP).
   - Los 12 jefes son derrotables matemáticamente.
2. **Desafíos Educativos (`challengeValidator.test.js`):**
   - Validación sin `eval()` de las 131 preguntas en los 4 pisos (`HTML`, `CSS`, `JavaScript`, `React`).
3. **Máquina de Transiciones y Caminata (`transitionMachine.test.js`):**
   - Secuencia ordenada `combat` → `enemy_defeated` → `victory` → `rewards` → `walking_right` → `exiting` → `loading_next_level` → `entering` → `ready`.
   - Prevención de doble carga del siguiente nivel y bloqueo de transición de victoria si el jugador pierde.
4. **Economía, Mejoras, Skins y Logros (`progression.test.js`):**
   - Compras en la tienda sin saldos negativos ni duplicados.
   - Separación de estadísticas base, bonificaciones permanentes y estadísticas finales sin doble aplicación al recargar.
   - Desbloqueo y equipamiento de skins/accesorios.
   - Desbloqueo único de logros por eventos reales.
5. **Patrones de Enemigos y Exploración Lateral (`explorationAndPatterns.test.js`):**
   - Determinismo con semilla en patrones de enemigos (`agresivo`, `defensivo`, `estrategico`, `impredecible`, `jefe`) y señales de anticipación.
   - Movimiento lateral dentro de los límites del escenario, seguimiento de cámara, detección de colisiones (tienda, enemigo, portal) e inicio único de encuentro.
6. **Interfaz y Sprites (`Sprites.test.js`, `BattleUI.test.js`):**
   - Renderizado de los 12 jefes y el protagonista en todos los estados (`idle`, `walk`, `attack`, `hurt`, `victory`, `defeat`, `enter`, `exit`).
