---
name: challenge-generator
description: >-
  Genera desafíos educativos de programación para los pisos HTML, CSS, JavaScript
  y React de Bug Buster: El Piso Vacío. Usa esta skill cuando el usuario pida crear,
  ampliar o redactar nuevas preguntas o ejercicios interactivos para los jefes en
  src/data/bosses.js.
---

# Challenge Generator (`challenge-generator`)

Genera desafíos educativos estructurados para los jefes de *Bug Buster: El Piso Vacío*, respetando el contrato de datos de `src/data/bosses.js` y el validador `src/engine/challengeValidator.js`.

## Instrucciones Operativas

1. **Inspeccionar el contexto:** Lee `src/data/bosses.js` y `src/data/floors.js` para verificar los IDs existentes y la temática del jefe objetivo antes de proponer nuevos desafíos.
2. **Seleccionar el tipo de desafío adecuado** entre los 7 admitidos:
   - `multiple`: `{ id, type: 'multiple', text, options: string[], correctIndex: number, hint, explanation }`
   - `truefalse`: `{ id, type: 'truefalse', text, answer: boolean, hint, explanation }`
   - `complete-code`: `{ id, type: 'complete-code', text, template, blanks: [{ id, placeholder, label?, expected: string[] }], hint, explanation }`
   - `fix-bug`: `{ id, type: 'fix-bug', text, initialCode, target, acceptedSolutions: string[], solutionPattern?: RegExp, hint, explanation }`
   - `order-code`: `{ id, type: 'order-code', text, lines: [{ id, content }], correctOrder: string[], hint, explanation }`
   - `predict-output`: `{ id, type: 'predict-output', text, code?, options?, correctIndex?, acceptedSolutions?: string[], correctAnswer?: string, hint, explanation }`
   - `write-code`: `{ id, type: 'write-code', text, codeContext?, placeholder?, inputPlaceholder?, acceptedSolutions: string[], acceptedPatterns?: RegExp[], hint, explanation }`
3. **Garantizar metadatos pedagógicos:**
   - Asigna un `id` único con prefijo del jefe o piso (ej. `tf-`, `er-`, `hc-`, `css-`, `js-`, `react-`).
   - Incluye siempre `hint` (pista breve que oriente sin regalar la respuesta) y `explanation` (explicación técnica clara de por qué la solución es correcta).
   - En desafíos abiertos (`complete-code`, `fix-bug`, `predict-output`, `write-code`), declara todas las variantes sintácticas válidas en `expected`, `acceptedSolutions` o `acceptedPatterns` (ej. comillas simples y dobles, con y sin punto y coma final).

## Límites y Restricciones

- **No modificar el motor de combate:** No edites `src/engine/battle.js`, `src/screens/Battle.jsx` ni los componentes de UI al generar contenido.
- **Cero ambigüedad:** No crees preguntas con múltiples interpretaciones válidas si solo una está declarada como correcta, ni uses `write-code` para bloques largos de múltiples líneas.
- **No eliminar preguntas existentes** salvo instrucción explícita del usuario.
- **Sin dependencias externas ni ejecución dinámica:** Nunca dependas de `eval` o `new Function`.

## Criterios de Validación

1. Verifica que ningún `id` esté duplicado dentro de `src/data/bosses.js`.
2. Comprueba que cada desafío nuevo pase `validateChallenge(challenge, respuestaValida) === true` y `validateChallenge(challenge, respuestaInvalida) === false`.
3. Ejecuta `npm test` y `npm run lint` para confirmar que el banco de datos sigue siendo válido.
