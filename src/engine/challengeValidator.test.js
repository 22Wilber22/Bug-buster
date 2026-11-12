import { describe, it, expect } from 'vitest'
import { validateChallenge } from './challengeValidator'
import { bosses } from '../data/bosses'
import { floors, isFloorUnlocked, isBossUnlocked } from '../data/floors'

describe('validateChallenge - multiple and truefalse', () => {
  const multipleQ = {
    id: 'm1',
    type: 'multiple',
    text: '¿Cuál es la etiqueta correcta?',
    options: ['<div>', '<span>', '<p>'],
    correctIndex: 1,
  }

  it('1. valida respuestas correctas e incorrectas de selección múltiple', () => {
    expect(validateChallenge(multipleQ, 1)).toBe(true)
    expect(validateChallenge(multipleQ, 0)).toBe(false)
    expect(validateChallenge(multipleQ, 2)).toBe(false)
    expect(validateChallenge(multipleQ, '1')).toBe(false)
    expect(validateChallenge(multipleQ, 99)).toBe(false)
  })

  const tfQ = {
    id: 'tf1',
    type: 'truefalse',
    text: 'HTML es un lenguaje de marcado.',
    answer: true,
  }

  it('2. valida respuestas booleanas de verdadero/falso estrictamente', () => {
    expect(validateChallenge(tfQ, true)).toBe(true)
    expect(validateChallenge(tfQ, false)).toBe(false)
    expect(validateChallenge(tfQ, 'true')).toBe(false)
    expect(validateChallenge(tfQ, 1)).toBe(false)
    expect(validateChallenge({ ...tfQ, answer: false }, false)).toBe(true)
  })
})

describe('validateChallenge - complete-code', () => {
  const singleBlank = {
    id: 'cc1',
    type: 'complete-code',
    text: 'Completa la propiedad display:',
    template: 'display: {{blank1}};',
    blanks: [
      { id: 'blank1', expected: ['flex', 'inline-flex'] },
    ],
  }

  const multiBlank = {
    id: 'cc2',
    type: 'complete-code',
    text: 'Centra un elemento en ambos ejes:',
    template: 'justify-content: {{b1}}; align-items: {{b2}};',
    blanks: [
      { id: 'b1', expected: ['center'] },
      { id: 'b2', expected: ['center'] },
    ],
  }

  it('3. valida completar uno o varios espacios de código', () => {
    // Espacio único
    expect(validateChallenge(singleBlank, { blank1: 'flex' })).toBe(true)
    expect(validateChallenge(singleBlank, { blank1: 'inline-flex' })).toBe(true)
    expect(validateChallenge(singleBlank, { blank1: 'block' })).toBe(false)
    // Permite pasar directamente el string si hay un solo blanco
    expect(validateChallenge(singleBlank, 'flex')).toBe(true)

    // Múltiples espacios
    expect(validateChallenge(multiBlank, { b1: 'center', b2: 'center' })).toBe(true)
    expect(validateChallenge(multiBlank, { b1: 'center', b2: 'flex-start' })).toBe(false)
    expect(validateChallenge(multiBlank, { b1: 'center' })).toBe(false)
  })
})

describe('validateChallenge - fix-bug', () => {
  const fixBug = {
    id: 'fb1',
    type: 'fix-bug',
    text: 'Corrige la URL externa:',
    initialCode: '<a href="google.com">Google</a>',
    acceptedSolutions: ['https://google.com', 'http://google.com', 'https://www.google.com'],
  }

  it('4. valida corregir un fragmento específico de código', () => {
    expect(validateChallenge(fixBug, 'https://google.com')).toBe(true)
    expect(validateChallenge(fixBug, 'https://www.google.com')).toBe(true)
    expect(validateChallenge(fixBug, '  http://google.com  ')).toBe(true)
    expect(validateChallenge(fixBug, 'google.com')).toBe(false)
    expect(validateChallenge(fixBug, 'ftp://google.com')).toBe(false)
  })
})

describe('validateChallenge - order-code', () => {
  const orderQ = {
    id: 'oc1',
    type: 'order-code',
    text: 'Ordena la petición fetch:',
    lines: [
      { id: 'l1', content: 'const res = await fetch("/api");' },
      { id: 'l2', content: 'const data = await res.json();' },
      { id: 'l3', content: 'console.log(data);' },
    ],
    correctOrder: ['l1', 'l2', 'l3'],
  }

  it('5. valida ordenar líneas mediante identificadores', () => {
    expect(validateChallenge(orderQ, ['l1', 'l2', 'l3'])).toBe(true)
    expect(validateChallenge(orderQ, ['l2', 'l1', 'l3'])).toBe(false)
    expect(validateChallenge(orderQ, ['l1', 'l2'])).toBe(false)
    expect(validateChallenge(orderQ, ['l1', 'l2', 'l3', 'l4'])).toBe(false)
    expect(validateChallenge(orderQ, 'l1,l2,l3')).toBe(false)
  })
})

describe('validateChallenge - predict-output', () => {
  const predictQ = {
    id: 'po1',
    type: 'predict-output',
    text: '¿Qué retorna typeof NaN?',
    code: 'typeof NaN',
    acceptedSolutions: ['number', '"number"'],
  }

  const predictWithOptions = {
    id: 'po2',
    type: 'predict-output',
    text: '¿Qué imprime console.log(1 + "2")?',
    options: ['"12"', '3', 'NaN'],
    correctIndex: 0,
  }

  it('6. valida predecir resultados mediante respuestas predefinidas u opciones', () => {
    expect(validateChallenge(predictQ, 'number')).toBe(true)
    expect(validateChallenge(predictQ, '"number"')).toBe(true)
    expect(validateChallenge(predictQ, 'nan')).toBe(false)

    expect(validateChallenge(predictWithOptions, 0)).toBe(true)
    expect(validateChallenge(predictWithOptions, 1)).toBe(false)
  })
})

describe('validateChallenge - write-code', () => {
  const writeHook = {
    id: 'wc1',
    type: 'write-code',
    text: 'Declara el estado count:',
    acceptedSolutions: [
      'const [count, setCount] = useState(0);',
      'const [count, setCount] = useState(0)',
    ],
    acceptedPatterns: [
      /^const\s*\[\s*count\s*,\s*setCount\s*\]\s*=\s*useState\s*\(\s*0\s*\);?$/,
    ],
  }

  it('7. valida escribir una solución corta mediante respuestas aceptadas o patrones', () => {
    expect(validateChallenge(writeHook, 'const [count, setCount] = useState(0);')).toBe(true)
    expect(validateChallenge(writeHook, 'const [count, setCount] = useState(0)')).toBe(true)
    // Variación con espaciado moderado aceptada por el regex
    expect(validateChallenge(writeHook, 'const [ count, setCount ] = useState(0);')).toBe(true)
    expect(validateChallenge(writeHook, 'let count = 0;')).toBe(false)
  })
})

describe('validateChallenge - robustness, edge cases & safety', () => {
  it('8. rechaza respuestas vacías o incompletas', () => {
    const q = { id: 'x', type: 'write-code', acceptedSolutions: ['return true;'] }
    expect(validateChallenge(q, null)).toBe(false)
    expect(validateChallenge(q, undefined)).toBe(false)
    expect(validateChallenge(q, '')).toBe(false)
    expect(validateChallenge(q, '   ')).toBe(false)

    const multi = {
      id: 'm',
      type: 'complete-code',
      blanks: [{ id: 'a', expected: ['1'] }, { id: 'b', expected: ['2'] }],
    }
    expect(validateChallenge(multi, { a: '1' })).toBe(false)
    expect(validateChallenge(multi, { a: '1', b: '' })).toBe(false)
    expect(validateChallenge(multi, {})).toBe(false)
  })

  it('9. rechaza tipos de desafíos desconocidos o inválidos', () => {
    expect(validateChallenge(null, 'test')).toBe(false)
    expect(validateChallenge(undefined, 'test')).toBe(false)
    expect(validateChallenge({}, 'test')).toBe(false)
    expect(validateChallenge({ type: 'unknown-format' }, 'test')).toBe(false)
  })

  it('10. evita que una normalización excesiva convierta código incorrecto en correcto', () => {
    const strictCode = {
      id: 'sc1',
      type: 'write-code',
      acceptedSolutions: ['const a = 1;'],
      acceptedPatterns: [/^const\s+a\s*=\s*1;?$/],
    }

    // Identificador pegado a la palabra clave (consta = 1) no debe ser válido
    expect(validateChallenge(strictCode, 'consta = 1;')).toBe(false)
    expect(validateChallenge(strictCode, 'consta=1;')).toBe(false)

    // Mayúsculas en identificadores / palabras clave de JS no deben alterarse indiscriminadamente
    const casingChallenge = {
      id: 'case1',
      type: 'write-code',
      acceptedSolutions: ['useRef(null)'],
    }
    expect(validateChallenge(casingChallenge, 'USEREF(NULL)')).toBe(false)
    expect(validateChallenge(casingChallenge, 'useref(null)')).toBe(false)
    expect(validateChallenge(casingChallenge, 'useRef(null)')).toBe(true)
  })
})

function canonicalAnswerFor(question) {
  switch (question.type) {
    case 'multiple':
      return question.correctIndex
    case 'truefalse':
      return question.answer
    case 'complete-code': {
      const obj = {}
      question.blanks.forEach((b) => {
        obj[b.id] = Array.isArray(b.expected) ? b.expected[0] : b.expected
      })
      return obj
    }
    case 'fix-bug':
      return question.acceptedSolutions?.[0] ?? question.expectedSolution
    case 'order-code':
      return [...question.correctOrder]
    case 'predict-output':
      return Number.isInteger(question.correctIndex)
        ? question.correctIndex
        : (question.acceptedSolutions?.[0] ?? question.correctAnswer)
    case 'write-code':
      return question.acceptedSolutions?.[0]
    default:
      return null
  }
}

describe('full game data QA: 4 floors, 12 bosses and all challenges', () => {
  const ALL_TYPES = [
    'multiple',
    'truefalse',
    'complete-code',
    'fix-bug',
    'order-code',
    'predict-output',
    'write-code',
  ]

  it('defines 4 playable floors and 12 bosses in sequential order', () => {
    expect(floors).toHaveLength(4)
    expect(floors.map((f) => f.id)).toEqual(['html', 'css', 'js', 'react'])
    floors.forEach((floor) => {
      expect(floor.comingSoon).toBeUndefined()
      expect(floor.bossIds).toHaveLength(3)
    })
    const expectedBossIds = [
      'tag-fantasma', 'etiqueta-roja', 'html-corrupto',
      'selector-oscuro', 'flexbox-caotico', 'rey-responsive',
      'undefined', 'bucle-eterno', 'senor-async',
      'componente-roto', 'hook-maldito', 'render-infinito',
    ]
    expect(bosses.map((b) => b.id)).toEqual(expectedBossIds)
  })

  it('preserves all 44 original HTML questions intact', () => {
    const allIds = new Set(bosses.flatMap((b) => b.questions.map((q) => q.id)))
    for (let i = 1; i <= 12; i++) expect(allIds.has(`tf-${i}`)).toBe(true)
    for (let i = 1; i <= 14; i++) expect(allIds.has(`er-${i}`)).toBe(true)
    for (let i = 1; i <= 18; i++) expect(allIds.has(`hc-${i}`)).toBe(true)
  })

  it('every boss has at least 8 challenges and covers all 7 challenge types', () => {
    for (const boss of bosses) {
      expect(boss.questions.length).toBeGreaterThanOrEqual(8)
      const typesUsed = new Set(boss.questions.map((q) => q.type))
      for (const type of ALL_TYPES) {
        expect(typesUsed.has(type)).toBe(true)
      }
    }
  })

  it('every challenge has unique id, hint, explanation, and validates its canonical answer', () => {
    const seenIds = new Set()
    for (const boss of bosses) {
      for (const q of boss.questions) {
        expect(typeof q.id).toBe('string')
        expect(q.id.length).toBeGreaterThan(0)
        expect(seenIds.has(q.id)).toBe(false)
        seenIds.add(q.id)

        expect(typeof q.text).toBe('string')
        expect(q.text.length).toBeGreaterThan(0)
        expect(typeof q.hint).toBe('string')
        expect(q.hint.length).toBeGreaterThan(0)
        expect(typeof q.explanation).toBe('string')
        expect(q.explanation.length).toBeGreaterThan(0)

        const validAnswer = canonicalAnswerFor(q)
        expect(validateChallenge(q, validAnswer)).toBe(true)
        expect(validateChallenge(q, null)).toBe(false)
        expect(validateChallenge(q, '')).toBe(false)
      }
    }
  })

  it('unlocks floors and bosses sequentially (HTML -> CSS -> JS -> React) and allows revisiting previous floors', () => {
    const defeated = []

    // Start: only Floor 0 (HTML) and its first boss are unlocked
    expect(isFloorUnlocked(0, defeated)).toBe(true)
    expect(isFloorUnlocked(1, defeated)).toBe(false)
    expect(isFloorUnlocked(2, defeated)).toBe(false)
    expect(isFloorUnlocked(3, defeated)).toBe(false)
    expect(isBossUnlocked(0, 0, defeated)).toBe(true)
    expect(isBossUnlocked(0, 1, defeated)).toBe(false)
    expect(isBossUnlocked(1, 0, defeated)).toBe(false)

    // Defeat HTML bosses one by one
    defeated.push('tag-fantasma')
    expect(isBossUnlocked(0, 1, defeated)).toBe(true)
    expect(isFloorUnlocked(1, defeated)).toBe(false)

    defeated.push('etiqueta-roja')
    expect(isBossUnlocked(0, 2, defeated)).toBe(true)
    expect(isFloorUnlocked(1, defeated)).toBe(false)

    defeated.push('html-corrupto')
    // Floor 1 (CSS) is now unlocked, along with its first boss
    expect(isFloorUnlocked(1, defeated)).toBe(true)
    expect(isBossUnlocked(1, 0, defeated)).toBe(true)
    expect(isBossUnlocked(1, 1, defeated)).toBe(false)
    expect(isFloorUnlocked(2, defeated)).toBe(false)

    // Defeat CSS bosses -> unlocks JS
    defeated.push('selector-oscuro', 'flexbox-caotico', 'rey-responsive')
    expect(isFloorUnlocked(2, defeated)).toBe(true)
    expect(isBossUnlocked(2, 0, defeated)).toBe(true)
    expect(isFloorUnlocked(3, defeated)).toBe(false)

    // Defeat JS bosses -> unlocks React
    defeated.push('undefined', 'bucle-eterno', 'senor-async')
    expect(isFloorUnlocked(3, defeated)).toBe(true)
    expect(isBossUnlocked(3, 0, defeated)).toBe(true)

    // Defeat React bosses -> all bosses and previous floors remain unlocked for replay
    defeated.push('componente-roto', 'hook-maldito', 'render-infinito')
    for (let f = 0; f < 4; f++) {
      expect(isFloorUnlocked(f, defeated)).toBe(true)
      for (let b = 0; b < 3; b++) {
        expect(isBossUnlocked(f, b, defeated)).toBe(true)
      }
    }
  })
})
