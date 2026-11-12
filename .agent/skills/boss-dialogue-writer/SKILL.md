---
name: boss-dialogue-writer
description: >-
  Crea y edita diálogos narrativos y educativos (taunts, attackQuotes y clues)
  con estilo retro-terminal para los jefes de Bug Buster: El Piso Vacío. Usa esta
  skill cuando el usuario pida escribir burlas, frases de ataque, pistas narrativas
  o definir la personalidad de enemigos en src/data/bosses.js.
---

# Boss Dialogue Writer (`boss-dialogue-writer`)

Diseña la voz narrativa, las burlas (`taunts`), los gritos de contraataque (`attackQuotes`) y las pistas (`clue`) de los jefes en `src/data/bosses.js`, manteniendo la atmósfera *tech-noir / retro-terminal* de TechCorp.

## Instrucciones Operativas

1. **Analizar el catálogo actual:**
   - Lee `src/data/bosses.js`, `src/data/floors.js` y `src/screens/Ending.jsx` para conservar el hilo conductor de la desaparición del último desarrollador de TechCorp y evitar frases repetidas.
2. **Diferenciar la personalidad de cada jefe según su bug técnico:**
   - Cada enemigo habla en primera persona encarnando el error de código que representa:
     - **Piso HTML:** *El Tag Fantasma* (`<div>` sin cerrar, espectral y envolvente), *La Etiqueta Roja* (`<a>` sin `href`, desorientada entre rutas 404), *El `<html>` Corrupto* (imponente, estructural y apocalíptico).
     - **Piso CSS:** Bugs de apilamiento (`z-index`), desbordamiento (`overflow` / Flexbox) y especificidad tiránica (`!important`).
     - **Piso JavaScript:** Errores de referencia/`undefined`, promesas colgadas y bucles infinitos.
     - **Piso React:** Estados desincronizados, *prop drilling* y re-renders infinitos.
3. **Redactar los 3 tipos de textos requeridos en `src/data/bosses.js`:**
   - `taunts` (arreglo de 4+ frases): Burlas breves (1 oración) que aparecen bajo el nombre del jefe durante el combate, con humor de programación sobre la mala práctica que encarna.
   - `attackQuotes` (arreglo de 3+ frases): Frases de acción directa cuando el jefe ejecuta su turno de contraataque (`attackName`), haciendo referencia al impacto en el código o layout del jugador.
   - `clue` (string): Objeto o nota encontrada en la oficina tras derrotar al jefe que aporta una pista sobre qué ocurrió con el desarrollador desaparecido y conecta con el siguiente jefe o piso.

## Límites y Restricciones

- **Brevedad y claridad:** Cada `taunt` o `attackQuote` debe tener idealmente entre 40 y 110 caracteres para no desbordar el panel de batalla.
- **No modificar lógica ni estadísticas:** No alteres `id`, `hp`, `damage`, `rewardCoins`, `questions` ni archivos de `src/engine/` o `src/components/`.
- **Cero repetición:** Verifica que ninguna frase nueva duplique las ya existentes en `src/data/bosses.js`.

## Criterios de Validación

1. Comprueba que cada jefe intervenido tenga `attackName` (string), `taunts` (arreglo no vacío de strings), `attackQuotes` (arreglo no vacío de strings) y `clue` (string no vacío).
2. Ejecuta `npm test` y `npm run lint` para asegurar que la sintaxis de `src/data/bosses.js` permanece impecable.
