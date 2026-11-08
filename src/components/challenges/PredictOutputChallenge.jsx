import { useState } from 'react'
import { playSfx } from '../../engine/sound'

function PredictOutputChallenge({ question, onAnswer }) {
  const [text, setText] = useState('')

  // Opción A: opciones predefinidas (correctIndex)
  if (question.options && question.correctIndex !== undefined) {
    return (
      <div className="options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className="btn option"
            type="button"
            onMouseEnter={() => playSfx('click')}
            onClick={() => onAnswer(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  // Opción B: texto libre (acceptedSolutions / correctAnswer)
  const canSubmit = text.trim().length > 0
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    playSfx('click')
    onAnswer(text.trim())
  }

  return (
    <form className="challenge-form" onSubmit={handleSubmit}>
      {question.code && (
        <div className="code-preview-box">
          <p className="code-preview-title">Código a analizar:</p>
          <pre className="code-block"><code>{question.code}</code></pre>
        </div>
      )}
      <div className="blank-input-group">
        <label htmlFor="predict-input" className="blank-label">
          ¿Qué valor/texto se obtiene?
        </label>
        <input
          id="predict-input"
          type="text"
          className="code-input"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder="Escribe el resultado..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="challenge-actions">
        <button type="submit" className="btn challenge-submit-btn" disabled={!canSubmit}>
          Predecir resultado ▶
        </button>
      </div>
    </form>
  )
}

export default PredictOutputChallenge
