# Bug Buster: El Piso Vacío

🎮 **Jugar en línea (Demo en vivo):** [https://bugsbusters.netlify.app/](https://bugsbusters.netlify.app/)

---

## 1. Aplicación o mini-juego funcional

**Bug Buster: El Piso Vacío** es un RPG educativo e interactivo por turnos con estética retro-terminal donde encarnas a un desarrollador novato en su primer día en *TechCorp*. El edificio está vacío, el último programador desapareció y los bugs del piso de HTML cobraron vida.

### Objetivo del juego
Avanzar por el **Piso HTML** derrotando en orden a tres jefes (**El Tag Fantasma**, **La Etiqueta Roja** y **El `<html>` Corrupto**) respondiendo preguntas reales de HTML5, administrando defensas, ataques especiales, monedas y cafés curativos, mientras recolectas pistas sobre qué ocurrió con el último desarrollador.

### Cómo ejecutar el proyecto
- **Opción 1 — En línea (sin instalar nada):** Abre directamente [https://bugsbusters.netlify.app/](https://bugsbusters.netlify.app/) en tu navegador.
- **Opción 2 — En local:**

1. **Requisitos previos:** Node.js (v18+) y npm.
2. **Instalación de dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar el juego en modo desarrollo:**
   ```bash
   npm run dev
   ```
   *(Abre en el navegador la URL mostrada en consola, por defecto `http://localhost:5173`).*

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor local de desarrollo con Vite (HMR). |
| `npm test` | Ejecuta las pruebas automatizadas con **Vitest** (`battle`, `balance`, `save`, `sound`). |
| `npm run build` | Genera la versión de producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza localmente el build de producción. |
| `npm run lint` | Verifica el código con **Oxlint**. |

### Mecánicas principales
- **Debug (Ataque básico):** Abre una pregunta de HTML (opción múltiple o verdadero/falso) con opción de cerrarla (`✕` / `Esc`) si decides cambiar de estrategia antes de responder. Si aciertas, haces `10` de daño; si fallas, no haces daño y el jefe contraataca con golpe crítico (`x2`).
- **Comentar (Defensa):** Hasta `2` usos por combate. Coloca un comentario `<!-- -->` que bloquea por completo el próximo ataque del jefe.
- **⚡ Ataque Especial (Refactor · Daño x2):** Se carga cada `3` turnos jugados (`3/3`) y permite lanzar un ataque que inflige el doble de daño (`20`).
- **🪙 Monedas y ☕ Máquina de Café TechCorp:** Al vencer a cada jefe ganas monedas (`+30`, `+50` y `+80 🪙`) con las que puedes comprar **Café (+35 HP por 25 🪙)** en el mapa o entre combates y tomarlo durante tu turno.
- **🔊 Audio retro y Mute:** Música ambiental sintetizada en tiempo real con **Web Audio API** (ambiente misterioso para el piso vacío y chiptune tenso para las batallas), efectos de sonido interactivos y botón global de **Mute** (`🔊 Sonido: ON` / `🔇 Mutear: OFF`) persistido en `localStorage`.

---

## 2. Evidencia de Vibecoding (Prompts utilizados)

A continuación se presentan los prompts principales utilizados durante el desarrollo y su análisis:

### Prompt 1 — Concepto base, narrativa y motor de combate por turnos

> Quiero crear un RPG educativo por turnos llamado **"Bug Buster: El Piso Vacío"** con estética retro-terminal (fondo `#0a0e14`, texto verde `#00ff9c`, acentos cian `#00d4ff`, peligro `#ff4d4d`, tipografía monoespaciada y efecto scanlines en CSS).
>
> **Historia:** Es tu primer día en TechCorp. El edificio está vacío, el último dev desapareció y los bugs hablan.
>
> **Sistema de combate por turnos:**
> - El jugador tiene `100 HP` y tres acciones en su turno:
>   1. **Depurar:** lanza una pregunta de HTML (opción múltiple o verdadero/falso). Si responde bien, hace `10` de daño al jefe y suma `+1` a su racha. Si falla, hace `0` de daño, pierde la racha y recibe daño crítico (`x2`) del jefe.
>   2. **Comentar:** actúa como escudo que bloquea el próximo ataque del jefe (máximo 2 usos por batalla).
>   3. **Refactorizar:** solo se activa al llegar a una racha de `3` aciertos seguidos; lanza una pregunta que, al acertar, hace el doble de daño (`20`) y consume la racha.
> - Las preguntas deben barajarse de forma aleatoria sin repetir la última pregunta al reiniciar el mazo entre rondas.

- **i. ¿Qué se pidió a la IA?**
  Se solicitó construir la base del juego: la paleta visual retro-terminal, la lógica pura del motor de combate por turnos (`src/engine/battle.js`), el sistema de preguntas aleatorias sin repeticiones consecutivas y las tres acciones tácticas iniciales (*Depurar*, *Comentar* y *Refactorizar*).
- **ii. ¿Por qué se ajustó o refinó el prompt?**
  En una idea inicial sin especificar valores numéricos ni reglas de barajado, el combate podía volverse desbalanceado o repetir la misma pregunta dos veces seguidas al terminar una ronda. Se refinó el prompt fijando valores exactos (`100 HP`, `10` de daño base, multiplicador `x2`, límite de `2` escudos) y pidiendo un generador aleatorio con semilla para poder probar la lógica con tests unitarios.

---

### Prompt 2 — Mapa de pisos, jefes del piso HTML, pistas narrativas, cinemática y tests

> Agrega el flujo completo de pantallas del juego (**Intro**, **Mapa de pisos**, **Batalla**, **Pista encontrada** y **Final de victoria/derrota**) junto con los datos de los jefes y pruebas automatizadas:
>
> 1. **Mapa de pisos:**
>    - **Piso HTML** (jugable) con 3 jefes que se desbloquean en orden a medida que vences al anterior.
>    - **Piso CSS** y **Piso JS** visibles en el mapa pero marcados como *"Próximamente"*.
> 2. **Los 3 jefes del Piso HTML:**
>    - **El Tag Fantasma** (`40 HP`, ataque *"Etiqueta huérfana"*).
>    - **La Etiqueta Roja** (`80 HP`, ataque *"Enlace a ninguna parte"*).
>    - **El html Corrupto** (`130 HP`, ataque *"Pantalla azul"*).
> 3. **Narrativa y cinemática:**
>    - Al derrotar a cada jefe, muestra una pantalla con la **pista** que deja atrás sobre la desaparición del último desarrollador.
>    - Incluye soporte en la pantalla de Intro para reproducir el video `src/assets/intro.mp4` a pantalla completa con botón **Saltar**.
> 4. **Tests:** Agrega tests unitarios con Vitest para la lógica pura del motor de batalla y el balance de vida/daño de los jefes.

- **i. ¿Qué se pidió a la IA?**
  Estructurar la progresión completa del jugador entre pantallas, definir la dificultad escalonada de los 3 jefes (`40`, `80` y `130 HP`), conectar las pistas narrativas tras cada victoria, integrar el video de introducción (`intro.mp4`) y validar matemáticamente el balance con pruebas automatizadas.
- **ii. ¿Por qué se ajustó o refinó el prompt?**
  Se refinó para asegurar que el juego no fallara si el navegador bloqueaba la reproducción automática del video de intro o si el archivo no estaba disponible, añadiendo un fallback automático y el botón **Saltar**.

---

### Prompt 3 — Diseño de personajes (sprites pixelados en CSS), enemigos y menú principal con persistencia

> Estoy haciendo un RPG educativo por turnos llamado "Bug Buster: El Piso Vacío" en HTML/CSS/JS puro (sin framework de estilos). Necesito que agregues lo siguiente al juego actual:
>
> **1. Diseño del personaje (el jugador):**
> - Sprite pixelado de un desarrollador novato: camiseta con logo `</>` en el pecho, mochila, ojos grandes y expresivos con cejas levantadas (cara de sorpresa/curiosidad).
> - Colores: cian (`#00d4ff`) sobre fondo oscuro, para que resalte contra el fondo negro.
> - Animación: pequeño `"bounce"` al recibir daño y un `"glow"` cian al acertar una respuesta.
>
> **2. Diseño de los enemigos (los jefes del piso HTML):**
> - **El Tag Fantasma (`<div>` que se cierra solo):** bajo, redondo, semi-transparente y flotando (efecto fantasma), con brazos cortos. Símbolo `< >` flotando sobre su cabeza.
> - **La Etiqueta Roja (`<a>` sin `href`):** alargado y delgado, cara confundida, con un eslabón roto colgando (el `href` que le falta).
> - **El `<html>` Corrupto (jefe final):** grande e imponente, con corona de `<>`, grietas de "código roto" en el cuerpo y ojos rojos.
> - Cada enemigo lleva su barra de vida en rojo (`#ff4d4d`).
>
> **3. Menú principal con opciones:**
> - Un botón **Volver al menú principal** visible durante el juego (no solo al terminar).
> - En el menú principal deben aparecer: **Reanudar** (solo si hay partida en curso), **Nueva partida** (reproduce de nuevo el video/intro y reinicia progreso) y **Continuar desde el último jefe vencido**.
> - El progreso se guarda en `localStorage` (jefes vencidos, vida, partida en curso).

- **i. ¿Qué se pidió a la IA?**
  Crear los sprites visuales del jugador y de los tres jefes utilizando únicamente CSS (`PlayerSprite.jsx`, `BossSprite.jsx`, `index.css`), agregar animaciones de feedback visual (`bounce` y `glow`) e implementar un menú principal completo con guardado de sesión en `localStorage` (`save.js`).
- **ii. ¿Por qué se ajustó o refinó el prompt?**
  Se detalló la apariencia exacta de cada jefe relacionada con su bug de HTML (fantasma flotante para `<div>`, eslabón roto para `<a>` sin `href`, grietas y corona `<>` para `<html>`) y se diferenciaron claramente las opciones **Reanudar** (vuelve al turno exacto de la pelea en curso) y **Continuar desde el último jefe vencido** (va al mapa conservando los jefes ya superados).

---

### Prompts adicionales de iteración (Sonido, turnos del jefe, economía de café y UX)

Durante las pruebas jugables se enviaron estos prompts adicionales para pulir la experiencia:

- **Prompt 4 (Banco de preguntas):** *"Agrega más preguntas, siento que varias se repiten"* → Se amplió de 9 a **44 preguntas** de HTML distribuidas por temática en los tres jefes.
- **Prompt 5 (Sonido ambiental y Mute):** *"Agrégale un sonido que tenga que ver con el escenario a toda la página y agrega la opción de mutear"* → Se creó `src/engine/sound.js` con Web Audio API y el botón global de **Mute** en `GameHud.jsx`.
- **Prompt 6 (Turno del jefe, Café curativo y controles):** *"Agrega algo para que el jefe ataque después de que yo ataque y diga un mensaje para saber que es su turno... que al vencer al jefe gane monedas y pueda comprar café curativo, cada 3 turnos un ataque especial, y agrega una X cuando uno elige un ataque por si quiero cambiar a defender"* → Se implementaron las fases visuales de turno, las frases y animación de ataque del jefe, las monedas + **Máquina de Café TechCorp (`+35 HP`)**, la carga del **Ataque Especial cada 3 turnos** y el botón **`✕`** en el modal de preguntas.

---

## 3. Iteración y mejora

A partir de las pruebas del prototipo inicial se solicitaron e implementaron las siguientes mejoras concretas:

1. **Separación visual del Turno del Jugador vs. Turno del Jefe (`Battle.jsx`, `BossSprite.jsx`, `index.css`):**
   - *Antes:* Al responder una pregunta, la vida del jefe y la del jugador bajaban en el mismo milisegundo, por lo que no se distinguía cuándo contraatacaba el jefe.
   - *Mejora:* Se dividió la resolución en fases con un banner dinámico (`▶ TU TURNO` en cian → `⚡ Ejecutando ataque...` → `⚠ TURNO DEL JEFE` en rojo pulsante), animación de embestida del jefe (`boss-fx-attack`) y un cuadro de diálogo donde el jefe grita su frase de ataque antes de descontar la vida del jugador.
2. **Sistema de Monedas (`🪙`) y Máquina de Café (`☕ +35 HP`) (`save.js`, `FloorMap.jsx`, `Clue.jsx`, `ActionBar.jsx`):**
   - *Mejora:* Vencer a cada jefe otorga monedas (`+30`, `+50`, `+80 🪙`) que permiten comprar cafés curativos (`25 🪙`) en el mapa o tras cada victoria, y beberlos durante el combate para recuperar `+35 HP`.
3. **Ataque Especial cada 3 turnos y botón `✕` para cancelar pregunta (`QuestionModal.jsx`, `battle.js`):**
   - *Mejora:* El ataque especial muestra su carga `(X/3)` en el botón y se recarga cada 3 turnos jugados (incluso si se falla una pregunta). Además, se añadió un botón **`✕`** (y soporte para la tecla `Esc`) en el modal de pregunta para poder cerrarlo sin perder el turno si el jugador prefiere activar primero **Comentar** (escudo) o **Tomar Café**.
4. **Sonido ambiental del escenario y efectos retro (`sound.js`, `GameHud.jsx`):**
   - *Mejora:* Se sintetizó audio procedural con Web Audio API acorde a la atmósfera misteriosa del edificio vacío y al ritmo de batalla, con sonidos al abrir preguntas, recorrer opciones, acertar, fallar, curarse y bloquear, más el botón **`🔊 Sonido: ON` / `🔇 Mutear: OFF`** en todas las pantallas.

---

## 4. Validación del resultado

### a. Cómo se probó el código
1. **Pruebas unitarias y de balance automatizadas (`npm test` con Vitest):**
   - [`src/engine/battle.test.js`](src/engine/battle.test.js): Verifica creación de batallas, resolución de turnos, golpes críticos, uso y expiración del escudo *Comentar*, racha y *Refactor*, cancelación de preguntas (`cancel`) sin perder la carta del mazo, inmutabilidad del estado y no repetición de preguntas.
   - [`src/engine/balance.test.js`](src/engine/balance.test.js): Simula combates completos contra los 3 jefes verificando cuántos errores puede cometer el jugador antes de perder y cuánta vida le queda al ganar.
   - [`src/engine/save.test.js`](src/engine/save.test.js): Prueba el guardado en `localStorage`, migración de versiones, recuperación ante JSON corrupto, compra de café (`buyCoffee`) y reinicio de partida.
   - [`src/engine/sound.test.js`](src/engine/sound.test.js): Valida el estado de silencio (`mute`), la asignación de música según la pantalla y la emisión/supresión de efectos de sonido.
2. **Pruebas manuales en el navegador (`npm run dev`):**
   - Se recorrió el flujo completo: *Menú Principal → Nueva Partida (video de intro + botón Saltar + Mute) → Mapa de pisos → Combate por turnos → Pista y Máquina de Café → Guardado y Reanudación a mitad de pelea*.

### b. Errores, limitaciones o ajustes identificados durante las pruebas
- **Ajuste 1 — Repetición frecuente de preguntas:** Con solo 3 preguntas iniciales por jefe, en combates contra *El html Corrupto* (`130 HP`) las preguntas se repetían más de 4 veces. Se solucionó ampliando el banco a **44 preguntas** únicas.
- **Ajuste 2 — Imposibilidad de salir del modal de pregunta:** Al hacer clic en *Debug*, el jugador quedaba atrapado en el modal sin poder volver atrás para usar *Comentar* o *Tomar Café*. Se agregó la acción `question:cancel` en `battle.js` (retrocediendo `questionPos` para no desperdiciar la pregunta) y el botón `✕` en `QuestionModal.jsx`.
- **Ajuste 3 — Bloqueo de `autoplay` con sonido en navegadores:** Los navegadores bloquean el audio hasta que existe interacción del usuario. Se añadió un listener global (`unlockAudio`) en el primer clic/tecla y un fallback en el `<video>` de intro para que nunca bloquee el inicio del juego.

---

## 5. Reflexión final

### a. ¿Qué aprendí usando IA para programar?
Aprendí que dividir un proyecto en **capas pequeñas y bien definidas** (datos en `src/data/`, lógica pura en `src/engine/` y componentes visuales en `src/components/` y `src/screens/`) hace que colaborar con la IA sea mucho más preciso. También aprendí la importancia de pedir **pruebas unitarias automatizadas** desde el principio: gracias a los tests en `battle.test.js` y `save.test.js`, pudimos agregar nuevas mecánicas (como las monedas, el café, el sonido y el botón de cancelar pregunta) sin romper las reglas originales del juego.

### b. ¿Qué ventajas y límites identifiqué del vibecoding?
- **Ventajas:**
  - **Velocidad de prototipado e iteración:** Permitió construir sprites complejos en CSS puro, un sintetizador de audio retro con Web Audio API (sin depender de archivos `.mp3` externos) y 44 preguntas educativas en una fracción del tiempo habitual.
  - **Refinamiento continuo sobre la marcha:** Fue muy natural probar el juego en el navegador, detectar detalles de experiencia de usuario (como sentir que faltaba feedback en el turno del jefe o un botón `✕` en las preguntas) y transformarlos inmediatamente en mejoras concretas.
- **Límites:**
  - **Necesidad de especificar bien el comportamiento esperado:** Si un prompt no aclara qué ocurre en los casos borde (por ejemplo, qué pasa si el jugador quiere cancelar una pregunta o si el turno del jefe ocurre al mismo tiempo que el del jugador), la IA toma el camino más directo, que no siempre es el más claro visualmente para el jugador.
  - **Sincronización con archivos abiertos en el editor:** Al editar archivos simultáneamente entre la IA y pestañas abiertas del IDE, es importante guardar o aceptar los cambios para no sobrescribir versiones previas.

### c. ¿Qué partes del código comprendo y cuáles necesito reforzar?
- **Partes que comprendo bien:**
  - La estructura de datos de los jefes, pistas y preguntas en [`src/data/bosses.js`](src/data/bosses.js) y [`src/data/floors.js`](src/data/floors.js).
  - El flujo de componentes y estados en React (`useState`, props y navegación entre pantallas en [`src/App.jsx`](src/App.jsx), [`Menu.jsx`](src/screens/Menu.jsx), [`FloorMap.jsx`](src/screens/FloorMap.jsx) y [`QuestionModal.jsx`](src/components/QuestionModal.jsx)).
  - El diseño visual retro-terminal y las animaciones con `@keyframes` en [`src/index.css`](src/index.css) y el guardado básico con `localStorage` en [`src/engine/save.js`](src/engine/save.js).
- **Partes que necesito reforzar:**
  - El funcionamiento interno de la **Web Audio API** en [`src/engine/sound.js`](src/engine/sound.js) (manejo de `AudioContext`, osciladores `OscillatorNode`, envolventes de ganancia con `exponentialRampToValueAtTime` y frecuencias en Hz).
  - El algoritmo generador de números pseudoaleatorios con semilla (**mulberry32** y operaciones bit a bit como `Math.imul` y `>>> 0`) utilizado en [`src/engine/battle.js`](src/engine/battle.js) para que el barajado de preguntas sea determinista en los tests.
  - El manejo de múltiples temporizadores asíncronos con `useRef` y `setTimeout` en [`src/screens/Battle.jsx`](src/screens/Battle.jsx) para coordinar las fases de animación entre el turno del jugador y el turno del jefe.

