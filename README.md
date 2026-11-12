# Bug Buster: El Piso Vacío (Pixel Art RPG & Cyberpunk Arcade Edition)

🎮 **Demo en vivo:** [https://bugsbusters.netlify.app/](https://bugsbusters.netlify.app/)

---

## 1. Descripción General y Lore (Historia)

**Bug Buster: El Piso Vacío** es un **RPG educativo de combate por turnos y exploración lateral 2D** con dirección artística **Pixel Art RPG + Cyberpunk Arcade**.

### Lore / Narrativa ("El Piso Vacío de TechCorp")
Encarnas a un desarrollador novato en su primer día en **TechCorp**. Al cruzar las puertas del edificio corporativo, descubres que las oficinas están desiertas, las terminales parpadean en la oscuridad y el último programador senior (**Alex "Root" Vance**) desapareció sin dejar rastro tras desplegar un misterioso commit a medianoche.

Pronto descubres la verdad a través de los registros y pistas que sueltan los jefes: un experimento de automatización corrompió la arquitectura del edificio, haciendo que los **bugs de programación cobraran vida propia** y tomaran el control de los **4 pisos de la Torre TechCorp**:
1. **Piso 1 — HTML: El Piso Vacío** (Estructura semántica y DOM roto).
2. **Piso 2 — CSS: El Reino Desordenado** (Cascada, especificidad, Flexbox/Grid y Media Queries fuera de control).
3. **Piso 3 — JavaScript: El Bucle Infinito** (Tipos indefinidos, ciclos sin condición de salida y promesas asíncronas colgadas).
4. **Piso 4 — React: La Última Renderización** (JSX roto, Hooks malditos y un bucle de re-renderizado infinito en la cima de la torre).

Acompañado por **Byte**, el droide mercader que regenta la tienda tecnológica de la torre, deberás explorar cada piso, resolver desafíos reales de código para depurar a los **12 jefes**, mejorar tu equipamiento y descubrir qué sucedió realmente con el último desarrollador.

---

## 2. Stack Tecnológico y Arquitectura

### Tecnologías Utilizadas
- **Core Frontend:** React `19.2.4` (Hooks, estado funcional desacoplado, componentes modulares).
- **Bundler & Dev Server:** Vite `8.0.0` (HMR ultrarrápido, empaquetado optimizado).
- **Estilos y Sistema de Diseño:** CSS3 nativo con Design Tokens (`:root`), CSS Grid/Flexbox responsivo, animaciones `@keyframes` aceleradas por GPU y **Sprites Pixel Art en SVG/CSS nativo** (`shapeRendering="crispEdges"`). Cero dependencias pesadas de UI externas para mantener un bundle mínimo.
- **Audio Procedural:** **Web Audio API** nativa (`src/engine/sound.js`) con síntesis chiptune/retro en tiempo real (sin necesidad de archivos `.mp3` externos para efectos ni música ambiental).
- **Testing & Calidad:** **Vitest `4.1.4`** (9 suites, **141 pruebas unitarias y de integración**) + **Oxlint** (linter estático de alta velocidad con 0 errores y 0 advertencias).
- **Persistencia:** `localStorage` con versionado, migración segura y sincronización entre partida (`bug-buster-save`) y progresión RPG extendida (`bug-buster-progression`).

### Arquitectura en Capas (Separación de Responsabilidades)
```text
src/
├── data/
│   ├── floors.js                 # Configuración de los 4 pisos (HTML, CSS, JS, React) y sus bossIds
│   └── bosses.js                 # Los 12 jefes, lore, pistas, diálogos y 131 desafíos educativos (7 tipos)
├── engine/
│   ├── battle.js                 # Motor puro e inmutable de combate por turnos (PRNG con semilla mulberry32)
│   ├── challengeValidator.js     # Validador de los 7 tipos de desafíos (normalización AST/texto, alternativas)
│   ├── enemyPatterns.js          # IA de jefes: intenciones telegrafiadas, fases de furia (Enrage) y patrones
│   ├── progression.js            # Economía RPG: mejoras permanentes, skins, accesorios, inventario y logros
│   ├── exploration.js            # Motor de exploración lateral 2D (movimiento, colisiones, patrullas, nodos)
│   ├── transitionMachine.js      # Máquina de estados finitos para transiciones de victoria y portales [ > ]
│   ├── save.js                   # Persistencia principal y retrocompatibilidad de partidas guardadas
│   └── sound.js                  # Sintetizador Web Audio API (música ambiental por pantalla + SFX de combate/tienda)
├── components/
│   ├── CoffeeShop.jsx            # Tienda RPG en 3 Zonas (Vendedor Byte | Catálogo + Inspector | Jugador en vivo)
│   ├── ItemCard.jsx              # Tarjeta reutilizable de ítems con 7 estados visuales e insignias de rareza
│   ├── TrophyRoom.jsx            # Sala de trofeos con medallas pixel art, barra de progreso y filtros
│   ├── PixelIcons.jsx            # Sprites SVG Pixel Art nativos (Byte NPC, ítems, skins, medallas, iconos de stats)
│   ├── BattleHeader.jsx          # HUD superior de combate
│   ├── BattleStatus.jsx          # Banner dinámico de fase de turno + diálogo del jefe + telegraphed intent
│   ├── BattleArena.jsx           # Escenario cyberpunk con plataformas neón, partículas y envoltorios de sprites
│   ├── CharacterSprite.jsx       # Contenedor de animación por estado (idle, attack, hurt, shield, victory, defeat)
│   ├── PlayerSprite.jsx          # Sprite del protagonista con soporte en tiempo real para Skins y Accesorios
│   ├── BossSprite.jsx            # Sprites de los 12 jefes (híbrido PNG pixel art + CSS procedural fallback)
│   ├── HealthBar.jsx             # Barras de vida segmentadas con trail de daño animado
│   ├── SpecialAttackMeter.jsx    # Medidor de carga del ataque especial (0/3 a 3/3)
│   ├── BattleActions.jsx         # Botonera táctica RPG (Comentar, Debug, Ataque Especial, Tomar Café)
│   ├── CombatEffects.jsx         # Números de daño flotantes, impactos críticos y partículas
│   └── challenges/               # 7 componentes interactivos para cada modalidad de desafío educativo
└── screens/
    ├── Menu.jsx                  # Menú principal con Reanudar, Continuar, Nueva Partida y Sala de Trofeos
    ├── Intro.jsx                 # Cinemática de introducción (video + narrativa terminal + botón Saltar)
    ├── FloorMap.jsx              # Mapa de progresión por nodos conectados + Circuito de los 4 pisos
    ├── Exploration.jsx           # Escenario jugable de desplazamiento lateral 2D con encuentros y secretos
    ├── Battle.jsx                # Orquestador del combate por turnos y caminatas de victoria hacia el portal [ > ]
    ├── Clue.jsx                  # Pantalla de pista desbloqueada + acceso a la Tienda de Byte entre combates
    └── Ending.jsx                # Pantalla de victoria final o derrota con estadísticas de la partida
```

---

## 3. Los 4 Pisos y los 12 Jefes (Progresión y Balance)

El desbloqueo es secuencial: **HTML → CSS → JavaScript → React**. Al derrotar a los 3 jefes de un piso se desbloquea el siguiente, permitiendo regresar a pisos anteriores en cualquier momento sin perder el progreso.

### Piso 1 — HTML: El Piso Vacío (Color: `#00ff9c` · Verde Terminal)
| Orden | ID | Nombre del Jefe | HP | Ataque | Daño Base | Recompensa | Temática Educativa |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| 1 | `tag-fantasma` | **El Tag Fantasma** | `40 HP` | *Etiqueta huérfana* | `10` (`20` crít.) | `+30 🪙` | Etiquetas básicas, apertura/cierre y estructura DOM inicial. |
| 2 | `etiqueta-roja` | **La Etiqueta Roja** | `80 HP` | *Enlace a ninguna parte* | `12` (`24` crít.) | `+50 🪙` | Atributos (`href`, `src`, `alt`), enlaces, imágenes y formularios. |
| 3 | `html-corrupto` | **El `<html>` Corrupto** | `130 HP` | *Pantalla azul* | `15` (`30` crít.) | `+80 🪙` | HTML5 semántico, accesibilidad (`aria-*`), tablas y metadatos `<head>`. |

### Piso 2 — CSS: El Reino Desordenado (Color: `#38bdf8` · Cian Neón)
| Orden | ID | Nombre del Jefe | HP | Ataque | Daño Base | Recompensa | Temática Educativa |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| 4 | `selector-oscuro` | **El Selector Oscuro** | `60 HP` | *Cascada rota* | `11` (`22` crít.) | `+45 🪙` | Selectores, clases, IDs, pseudoclases y especificidad CSS. |
| 5 | `flexbox-caotico` | **Flexbox Caótico** | `100 HP` | *Desbordamiento lateral* | `13` (`26` crít.) | `+65 🪙` | Box Model, `display: flex`, `justify-content`, `align-items` y CSS Grid. |
| 6 | `rey-responsive` | **El Rey del Responsive** | `140 HP` | *Viewport colapsado* | `15` (`30` crít.) | `+95 🪙` | `@media` queries, unidades relativas (`rem`, `vw`, `%`) y diseño adaptable. |

### Piso 3 — JavaScript: El Bucle Infinito (Color: `#facc15` · Amarillo Ámbar)
| Orden | ID | Nombre del Jefe | HP | Ataque | Daño Base | Recompensa | Temática Educativa |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| 7 | `undefined` | **Undefined** | `80 HP` | *ReferenceError letal* | `12` (`24` crít.) | `+60 🪙` | Variables (`let`, `const`), tipos de datos, coerción y operadores (`===`). |
| 8 | `bucle-eterno` | **El Bucle Eterno** | `120 HP` | *Stack Overflow* | `14` (`28` crít.) | `+85 🪙` | Condicionales, funciones, closures, métodos de arrays (`map`, `filter`) y ciclos. |
| 9 | `senor-async` | **El Señor Async** | `150 HP` | *Promesa rechazada* | `16` (`32` crít.) | `+110 🪙` | Event Loop, `Promise`, `fetch`, `async/await` y manejo de errores (`try/catch`). |

### Piso 4 — React: La Última Renderización (Color: `#c084fc` · Púrpura Reactivo)
| Orden | ID | Nombre del Jefe | HP | Ataque | Daño Base | Recompensa | Temática Educativa |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: | :--- |
| 10 | `componente-roto` | **El Componente Roto** | `90 HP` | * Árbol JSX huérfano* | `13` (`26` crít.) | `+75 🪙` | Sintaxis JSX, componentes funcionales, `props`, fragmentos y listas con `key`. |
| 11 | `hook-maldito` | **El Hook Maldito** | `130 HP` | *Efecto secundario fugado* | `15` (`30` crít.) | `+100 🪙` | `useState`, `useEffect`, limpieza de efectos y reglas de los Hooks. |
| 12 | `render-infinito` | **El Render Infinito** | `170 HP` | *Maximum update depth* | `17` (`34` crít.) | `+150 🪙` | Inmutabilidad de estado, arrays de dependencias, `useMemo`/`useCallback` y flujo de datos. |

---

## 4. Estrategia Educativa: Los 7 Tipos de Desafíos (131 Ejercicios)

En lugar de limitarse a un quiz tradicional, el motor [`challengeValidator.js`](src/engine/challengeValidator.js) valida **7 formatos interactivos** distribuidos en los 12 jefes (mínimo 8–12 desafíos únicos por jefe, **131 en total**):

1. `multiple-choice`: Selección múltiple táctica con retroalimentación conceptual.
2. `true-false`: Evaluación rápida de afirmaciones técnicas sobre el lenguaje del piso.
3. `fill-blank`: Completar fragmentos de código en espacios clave (con soporte para múltiples respuestas válidas y normalización de comillas/espacios).
4. `code-fix`: Encontrar y corregir la línea defectuosa dentro de un bloque de código con un bug real.
5. `order-blocks`: Ordenar líneas o etiquetas desordenadas para construir una estructura o algoritmo válido.
6. `match-pairs`: Emparejar conceptos, selectores, métodos o hooks con su comportamiento exacto.
7. `free-code`: Escribir una instrucción o expresión de código libre validada mediante reglas flexibles y soluciones alternativas aceptadas.

Cada desafío incluye **ID único**, **pista pedagógica** (disponible si el jugador decide inspeccionar) y **explicación detallada** tras responder.

---

## 5. Estrategia de Gameplay, Economía y Sistemas RPG

### A. Combate por Turnos con Intenciones Telegrafiadas
- **Acciones del Jugador:**
  - **💬 Comentar (`<!-- -->`):** Activa un escudo que absorbe el 100 % del próximo golpe del jefe (hasta `2` usos base por combate, ampliable en la tienda).
  - **🐛 Debug (Ataque Normal):** Lanza un desafío educativo. Si aciertas, infliges `10 HP` base (+ bonos de ataque de tus mejoras). Si fallas, infliges `0 HP` y el jefe ejecuta un contraataque crítico (`x2` o según su patrón telegrafiado). Incluye botón `✕` (`Esc`) para cancelar y repensar la estrategia antes de responder.
  - **⚡ Ataque Especial (Refactor · Daño x2):** Se carga cada `3` turnos jugados (`3/3`, o `2/2` con la mejora de sobrecarga) e inflige el doble de daño (`20 HP` base + bonos).
  - **☕ Tomar Café:** Consume una taza de café del inventario para restaurar `+35 HP` al instante.
- **IA y Patrones del Jefe (`enemyPatterns.js`):**
  - Los jefes anuncian su próxima intención antes de que el jugador elija acción (*Ataque Estándar*, *Ataque Cargado 1.5x*, *Drenaje de Datos* o *Preparación Defensiva*).
  - Al bajar del **40 % de HP**, el jefe entra en **Fase de Furia (Enrage)** con aura visual intensa y mayor agresividad, incentivando guardar escudos o cafés para el tramo final.

### B. Tienda RPG en 3 Zonas (`TECHCORP · TIENDA` en `CoffeeShop.jsx`)
Diseñada como una interfaz de videojuego indie dividida en 3 paneles:
1. **Zona Izquierda (`VENDEDOR`):** Escenario con **Byte** (NPC robot pixel art animado en estado `idle`), burbuja de diálogo reactiva que comenta sobre cada ítem y accesos rápidos de curación.
2. **Zona Central (`CATÁLOGO` + Inspector):**
   - Cuadrícula de componentes [`ItemCard`](src/components/ItemCard.jsx) con **7 estados visuales claros** (`available`, `selected`, `insufficient`, `purchased`, `equipped`, `sold_out`, `locked`) e insignias de rareza (`COMÚN`, `RARO`, `ÉPICO`, `LEGENDARIO`).
   - **Inspector Inferior:** Muestra la descripción completa en tipografía de alta legibilidad y una **comparativa Antes → Después** para las mejoras permanentes (`HP MÁX: 100 → 120`, `ATQ: 10 → 13`, `DEF: 0 → 3`).
   - **4 Categorías:**
     - *Consumibles:* Espresso TechCorp (`+35 HP`), Cold Brew Doble (`+70 HP`), Parche de Emergencia (`+100 % HP`).
     - *Mejoras Permanentes:* Memoria Expandida (`+20 HP Máx`), Compilador Turbo (`+3 ATQ`), Firewall de Silicio (`+1 Escudo por combate`), Batería de Sobrecarga (reduce carga especial en `-1` turno).
     - *Skins y Accesorios:* Skins para el protagonista (*Neón Cian*, *Hacker Matrix*, *Samurái Cyber*, *Arquitecto Dorado*) y accesorios (*Visor Holo-Debug*, *Capa Cortafuegos*, *Halo Binario*, *Dron Centinela*).
     - *Sala de Trofeos (`TrophyRoom.jsx`):* 8 logros desbloqueables con medallas pixel art, barra de progreso global y filtros.
3. **Zona Derecha (`JUGADOR`):**
   - **Previsualización en Vivo:** El [`PlayerSprite`](src/components/PlayerSprite.jsx) renderiza en tiempo real la skin o accesorio seleccionado en el catálogo antes de comprarlo (con insignia `VISTA PREVIA`).
   - Muestra barra de HP actual y tabla de estadísticas con deltas proyectados en verde (`+20`, `+3`).

### C. Mapa de Progresión por Nodos y Exploración Lateral 2D
- **Circuito Superior de la Torre (`FloorMap.jsx`):** Conecta visualmente los 4 pisos (`PISO 1 · HTML` ──► `PISO 2 · CSS` ──► `PISO 3 · JS` ──► `PISO 4 · REACT`) con marcador `"📍 POSICIÓN ACTUAL"`.
- **Ruta de Nodos del Piso:** Muestra el camino conectado `[Tienda Byte] ──► [Jefe 1] ──► [Jefe 2] ──► [Jefe 3] ──► [Portal >]`.
- **Modo Exploración Lateral 2D (`Exploration.jsx`):** Permite caminar por el pasillo cyberpunk del piso (`A/D` o `←/→`), interactuar con terminales de monedas ocultas, visitar el puesto de Byte, encontrarse con los jefes en el mundo y cruzar el portal luminoso `[ > ]` al completar el piso.

---

## 6. Cómo Ejecutar y Verificar el Proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (http://localhost:5173)
npm run dev

# 3. Ejecutar las 9 suites de pruebas (141 tests con Vitest)
npm test

# 4. Ejecutar linter estático (Oxlint)
npm run lint

# 5. Compilar para producción
npm run build
```
