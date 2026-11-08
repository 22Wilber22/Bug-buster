/**
 * Motor de validación pura de desafíos educativos de programación.
 *
 * NOTA DE DISEÑO Y SEGURIDAD:
 * Para garantizar seguridad estricta y determinismo absoluto en el navegador,
 * este validador NUNCA utiliza `eval()` ni `new Function()`, ni ejecuta código
 * arbitrario ingresado por el jugador.
 *
 * Para los desafíos de escritura de código (`write-code`, `fix-bug`), se utiliza
 * coincidencia declarativa contra soluciones canónicas y patrones predefinidos (RegExp).
 * Es importante documentar que la coincidencia declarativa no equivale a comprobar la
 * corrección semántica de cualquier programa arbitrario en tiempo de ejecución, pero es la
 * estrategia estándar recomendada en motores pedagógicos para asegurar robustez, ausencia
 * de bucles infinitos y protección total contra inyecciones XSS.
 */

/**
 * Normaliza espacios redundantes sin alterar la separación de identificadores ni palabras clave.
 * Colapsa secuencias de espacios/tabs a un único espacio y elimina espacios en los extremos.
 * No altera mayúsculas/minúsculas ni puntuación sensible.
 */
function normalizeBasic(str) {
  if (typeof str !== 'string') return ''
  return str.trim().replace(/[ \t]+/g, ' ')
}

function validateMultiple(challenge, userAnswer) {
  if (!Number.isInteger(userAnswer)) return false
  return userAnswer === challenge.correctIndex
}

function validateTrueFalse(challenge, userAnswer) {
  if (typeof userAnswer !== 'boolean') return false
  return userAnswer === challenge.answer
}

function validateCompleteCode(challenge, userAnswer) {
  const blanks = challenge.blanks
  if (!Array.isArray(blanks) || blanks.length === 0) return false

  // Soporte ergonómico: si el desafío tiene un único blanco, se permite pasar el string directamente
  let userValues = userAnswer
  if (typeof userAnswer === 'string' && blanks.length === 1) {
    userValues = { [blanks[0].id]: userAnswer }
  }

  if (!userValues || typeof userValues !== 'object') return false

  return blanks.every((blank) => {
    const rawVal = userValues[blank.id]
    if (typeof rawVal !== 'string') return false
    const val = rawVal.trim()
    if (val === '') return false

    const expectedList = Array.isArray(blank.expected) ? blank.expected : [blank.expected]
    return expectedList.some((exp) => typeof exp === 'string' && exp.trim() === val)
  })
}

function validateFixBug(challenge, userAnswer) {
  if (typeof userAnswer !== 'string') return false
  const cleanAnswer = userAnswer.trim()
  if (cleanAnswer === '') return false

  if (Array.isArray(challenge.acceptedSolutions)) {
    if (challenge.acceptedSolutions.some((sol) => typeof sol === 'string' && sol.trim() === cleanAnswer)) {
      return true
    }
  }

  if (typeof challenge.expectedSolution === 'string' && challenge.expectedSolution.trim() === cleanAnswer) {
    return true
  }

  if (challenge.solutionPattern instanceof RegExp) {
    return challenge.solutionPattern.test(cleanAnswer)
  }

  return false
}

function validateOrderCode(challenge, userAnswer) {
  if (!Array.isArray(userAnswer) || !Array.isArray(challenge.correctOrder)) return false
  if (userAnswer.length !== challenge.correctOrder.length || userAnswer.length === 0) return false

  return userAnswer.every((id, index) => id === challenge.correctOrder[index])
}

function validatePredictOutput(challenge, userAnswer) {
  // Caso 1: predicción basada en opciones (índice)
  if (Number.isInteger(challenge.correctIndex)) {
    return Number.isInteger(userAnswer) && userAnswer === challenge.correctIndex
  }

  // Caso 2: predicción basada en texto
  if (typeof userAnswer !== 'string') return false
  const cleanAnswer = userAnswer.trim()
  if (cleanAnswer === '') return false

  if (Array.isArray(challenge.acceptedSolutions)) {
    return challenge.acceptedSolutions.some((sol) => typeof sol === 'string' && sol.trim() === cleanAnswer)
  }

  if (typeof challenge.correctAnswer === 'string') {
    return challenge.correctAnswer.trim() === cleanAnswer
  }

  return false
}

function validateWriteCode(challenge, userAnswer) {
  if (typeof userAnswer !== 'string') return false
  const cleanAnswer = userAnswer.trim()
  if (cleanAnswer === '') return false

  const normalizedUser = normalizeBasic(cleanAnswer)

  // 1. Coincidencia con soluciones aceptadas
  if (Array.isArray(challenge.acceptedSolutions)) {
    const match = challenge.acceptedSolutions.some((sol) => {
      if (typeof sol !== 'string') return false
      return sol.trim() === cleanAnswer || normalizeBasic(sol) === normalizedUser
    })
    if (match) return true
  }

  // 2. Coincidencia con patrones predefinidos (RegExp)
  if (Array.isArray(challenge.acceptedPatterns)) {
    const matchPattern = challenge.acceptedPatterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(cleanAnswer)
      }
      return false
    })
    if (matchPattern) return true
  }

  return false
}

/**
 * Validador universal de desafíos educativos.
 *
 * @param {object} challenge Objeto del desafío con campo `type`.
 * @param {any} userAnswer Respuesta enviada por el jugador.
 * @returns {boolean} `true` si la respuesta satisface el criterio del desafío, `false` en caso contrario.
 */
export function validateChallenge(challenge, userAnswer) {
  if (!challenge || typeof challenge !== 'object' || typeof challenge.type !== 'string') {
    return false
  }

  switch (challenge.type) {
    case 'multiple':
      return validateMultiple(challenge, userAnswer)
    case 'truefalse':
      return validateTrueFalse(challenge, userAnswer)
    case 'complete-code':
      return validateCompleteCode(challenge, userAnswer)
    case 'fix-bug':
      return validateFixBug(challenge, userAnswer)
    case 'order-code':
      return validateOrderCode(challenge, userAnswer)
    case 'predict-output':
      return validatePredictOutput(challenge, userAnswer)
    case 'write-code':
      return validateWriteCode(challenge, userAnswer)
    default:
      return false
  }
}
