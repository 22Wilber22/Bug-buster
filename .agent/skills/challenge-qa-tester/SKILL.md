---
name: challenge-qa-tester
description: >-
  Revisa, audita y prueba los desafíos educativos y su validación en Bug Buster:
  El Piso Vacío. Usa esta skill cuando el usuario pida verificar preguntas en
  src/data/bosses.js, auditar src/engine/challengeValidator.js, detectar ejercicios
  ambiguos o añadir pruebas unitarias con Vitest para desafíos.
---

# Challenge QA Tester (`challenge-qa-tester`)

Audita la calidad técnica y pedagógica de los desafíos de programación y garantiza mediante pruebas automatizadas que el validador acepte todas las respuestas correctas y rechace las incorrectas.

## Instrucciones Operativas

1. **Auditar el banco de desafíos y el validador:**
   - Revisa `src/data/bosses.js` y `src/engine/challengeValidator.js`.
   - Comprueba que cada desafío tenga `id` único, `type` válido y los campos obligatorios de su esquema.
2. **Detectar ejercicios ambiguos o frágiles:**
   - En `multiple` y `predict-output` con opciones: verifica que `correctIndex` esté dentro del rango `0..options.length - 1` y que no haya dos opciones equivalentes.
   - En `complete-code`: verifica que cada marcador `{{id}}` en `template` corresponda a una entrada en `blanks` con `expected` no vacío.
   - En `fix-bug`: verifica que `target` exista literalmente dentro de `initialCode` y que `acceptedSolutions` contenga la corrección exacta.
   - En `order-code`: verifica que `correctOrder` sea una permutación exacta de los IDs de `lines` y que no haya líneas idénticas intercambiables que invaliden el orden.
   - En `write-code`: verifica que `acceptedSolutions` y `acceptedPatterns` cubran variantes legítimas (espaciado opcional, comillas simples/dobles, `;` opcional) sin aceptar código inválido.
3. **Verificar la normalización segura:**
   - Asegúrate de que `src/engine/challengeValidator.js` no aplique normalizaciones agresivas que alteren la semántica del lenguaje (ej. nunca fusionar palabras clave con identificadores como `consta=1`, ni ignorar mayúsculas/minúsculas en identificadores de JS/React como `useState`).
4. **Crear o ampliar pruebas con Vitest:**
   - Añade casos de prueba en `src/engine/challengeValidator.test.js` o `src/engine/battle.test.js` probando tanto respuestas válidas (incluyendo variantes de formato) como respuestas incorrectas, vacías o incompletas.

## Límites y Restricciones

- **Prohibido usar `eval` o `new Function`:** Toda validación debe ser declarativa y determinista.
- **No alterar mecánicas de combate:** No modifiques daño, vida, rachas ni temporizadores durante una auditoría de QA.
- **No instalar paquetes adicionales.**

## Criterios de Validación

Ejecuta obligatoriamente los tres comandos del proyecto y confirma cero fallos:
1. `npm test` — Todas las suites de Vitest deben aprobar.
2. `npm run lint` — `oxlint` debe reportar `0 warnings and 0 errors`.
3. `npm run build` — `vite build` debe compilar sin errores.
