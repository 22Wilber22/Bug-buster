# Bug Buster: El Piso Vacío

**Bug Buster: El Piso Vacío** es un RPG educativo por turnos con estética retro-terminal donde encarnas a un desarrollador novato en su primer día en *TechCorp*. El edificio está vacío, el último programador desapareció y los bugs de HTML cobraron vida.

---

## Cómo ejecutar el proyecto

### 1. Requisitos previos
- **Node.js** (v18 o superior recomendado)
- **npm**

### 2. Instalación
Clona el repositorio e instala las dependencias desde la raíz del proyecto:

```bash
npm install
```

### 3. Iniciar en modo desarrollo
Para levantar el servidor local de Vite:

```bash
npm run dev
```

Luego abre en tu navegador la dirección que indique la terminal (por defecto `http://localhost:5173`).

### 4. Otros comandos útiles

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con recarga en caliente (HMR). |
| `npm test` | Ejecuta las pruebas unitarias y de balance con **Vitest**. |
| `npm run build` | Genera la versión optimizada para producción en la carpeta `dist/`. |
| `npm run preview` | Sirve localmente el build de producción para verificarlo. |
| `npm run lint` | Analiza el código con **Oxlint**. |

---

## Mecánicas principales

- **Depurar (Ataque básico):** Responde una pregunta de HTML (opción múltiple o verdadero/falso). Si aciertas, haces `10` de daño; si fallas, no haces daño y el jefe responde con un golpe crítico (`x2`).
- **Comentar (Defensa):** Hasta 2 usos por combate. Coloca un comentario en el código que bloquea por completo el próximo ataque del jefe.
- **Refactorizar (Habilidad especial):** Se habilita al acumular una racha de `3` respuestas correctas seguidas. Si aciertas la pregunta, infliges el doble de daño (`20`).
- **Guardado automático (`localStorage`):** Guarda jefes derrotados, vida actual del jugador y el estado exacto de la partida en curso para poder pausar y reanudar en cualquier momento.

---

## Prompts utilizados para el desarrollo

A continuación se documentan los **3 prompts principales** empleados durante la creación iterativa del juego:

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

---

### Prompt 2 — Mapa de pisos, jefes del piso HTML, pistas, intro cinemática y tests

> Agrega el flujo completo de pantallas del juego (**Intro**, **Mapa de pisos**, **Batalla**, **Pista encontrada** y **Final de victoria/derrota**) junto con los datos de los jefes y pruebas automatizadas:
>
> 1. **Mapa de pisos:**
>    - **Piso HTML** (jugable) con 3 jefes que se desbloquean en orden a medida que vences al anterior.
>    - **Piso CSS** y **Piso JS** visibles en el mapa pero marcados como *"Próximamente"*.
> 2. **Los 3 jefes del Piso HTML:**
>    - **El Tag Fantasma** (`40 HP`, ataque *"Etiqueta huérfana"*): preguntas sobre cierre de etiquetas y estructura básica (`<div>`, `<body>`).
>    - **La Etiqueta Roja** (`80 HP`, ataque *"Enlace a ninguna parte"*): preguntas sobre enlaces `<a>`, `href` y `target="_blank"`.
>    - **El html Corrupto** (`130 HP`, ataque *"Pantalla azul"*): jefe final del piso con preguntas sobre `<!DOCTYPE html>`, `<title>` y accesibilidad (`alt` en `<img>`).
> 3. **Narrativa y cinemática:**
>    - Al derrotar a cada jefe, muestra una pantalla con la **pista** que deja atrás sobre la desaparición del último desarrollador.
>    - Incluye soporte en la pantalla de Intro para reproducir el video `src/assets/intro.mp4` a pantalla completa con botón **Saltar** (y fallback si el navegador bloquea el autoplay o no está el video).
> 4. **Tests:** Agrega tests unitarios con Vitest para la lógica pura del motor de batalla y el balance de vida/daño de los jefes.

---

### Prompt 3 — Diseño de personajes (sprites pixelados en CSS), enemigos y menú principal con guardado

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
> - En el menú principal deben aparecer:
>   - **Reanudar** (solo si hay una partida en progreso guardada; si no, oculto o deshabilitado).
>   - **Nueva partida**.
>   - **Continuar desde el último jefe vencido** (si existe progreso).
> - Al pulsar **Nueva partida**, debe reproducirse de nuevo el video/intro del juego desde el principio (y reiniciar el progreso).
> - El progreso se guarda en `localStorage` (jefes vencidos, vida, partida en curso).
> - Mantén el estilo retro-terminal: fondo oscuro (`#0a0e14`), verde (`#00ff9c`), cian (`#00d4ff`), tipografía monoespaciada.
