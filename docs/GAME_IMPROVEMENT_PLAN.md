# Plan de Mejora del Videojuego — Bug Buster: El Piso Vacío

## 1. Auditoría Inicial (Fase 0)

### 1.1 Stack Tecnológico Verificado
- **Framework UI:** React 19 (`react`, `react-dom`).
- **Empaquetador:** Vite 8.
- **Estilos:** CSS nativo en `src/index.css` con estética Pixel Art RPG + Cyberpunk Arcade.
- **Pruebas y Calidad:** Vitest 4 (`npm test` con 116 pruebas aprobadas) y Oxlint (`npm run lint` con 0 errores).
- **Audio:** Sintetizador Web Audio API puro en `src/engine/sound.js`.

### 1.2 Sistemas Existentes Localizados
- **Motor de combate (`src/engine/battle.js`):** Máquina pura por turnos (`choose`, `question`, `won`, `lost`) con acciones `comment` (escudo, 2 usos), `debug` (10 HP), `refactor` (20 HP al acumular `streak = 3`) y curación con café (+35 HP).
- **Validación educativa (`src/engine/challengeValidator.js`):** 7 tipos de desafíos (`multiple`, `truefalse`, `complete-code`, `fix-bug`, `order-code`, `predict-output`, `write-code`) y 131 preguntas distribuidas en 12 jefes y 4 pisos (`HTML`, `CSS`, `JavaScript`, `React`).
- **Persistencia (`src/engine/save.js`):** Guardado en `localStorage` (`bug-buster-save`, v2) con soporte de migración desde v1.
- **Sprites (`public/assets/`):** 12 sprites pixel art de jefes (`public/assets/bosses/*.png`) y 1 sprite principal del protagonista (`public/assets/characters/debugger.png`), con respaldos CSS pixel art.

### 1.3 Oportunidades Detectadas
1. **Animación de caminata y transición entre niveles:** Al vencer a un enemigo, falta la secuencia de celebración + caminata horizontal (`walk`) hacia un portal digital (`[ > ]`) antes de pasar a la tienda/pista o siguiente zona.
2. **Tienda RPG interactiva y progresión extendida:** `CoffeeShop.jsx` solo permite comprar/beber café básico; puede evolucionar a una tienda cyberpunk con NPC vendedor animado (`Byte`), pestañas de mejoras permanentes, skins/accesorios cosméticos y logros.
3. **Exploración lateral 2D:** Incorporar un escenario jugable de desplazamiento lateral con cámara suave, colisiones con el vendedor NPC, encuentro con el jefe del piso y portal de salida.
4. **Patrones de enemigos y anticipación (telegraphing):** Añadir perfiles de comportamiento (`agresivo`, `defensivo`, `estrategico`, `impredecible`, `jefe`) e indicadores visuales de intención de ataque sin romper las fórmulas auditadas en `balance.test.js`.
