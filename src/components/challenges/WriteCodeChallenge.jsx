import { useState } from 'react'
import { playSfx } from '../../engine/sound'

function WriteCodeChallenge({ question, onAnswer }) {
  const [code, setCode] = useState('')
  const canSubmit = code.trim().length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    playSfx('click')
    onAnswer(code.trim())
  }

  return (
    <form className="challenge-form" onSubmit={handleSubmit}>
      {question.codeContext && (
        <div className="code-preview-box">
          <p className="code-preview-title">Contexto:</p>
          <pre className="code-block"><code>{question.codeContext}</code></pre>
        </div>
      )}
      <div className="blank-input-group">
        <label htmlFor="write-code-input" className="blank-label">
          {question.placeholder || 'Escribe tu solución:'}
        </label>
        <input
          id="write-code-input"
          type="text"
          className="code-input"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={question.inputPlaceholder || 'Escribe tu código aquí...'}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="challenge-actions">
        <button type="submit" className="btn challenge-submit-btn" disabled={!canSubmit}>
          Ejecutar código ▶
        </button>
      </div>
    </form>
  )
}

export default WriteCodeChallenge
