import { useState } from 'react'
import { playSfx } from '../../engine/sound'

function CompleteCodeChallenge({ question, onAnswer }) {
  const blanks = question.blanks || []
  const [values, setValues] = useState(() => {
    const init = {}
    blanks.forEach((b) => {
      init[b.id] = ''
    })
    return init
  })

  const handleChange = (id, val) => {
    setValues((prev) => ({ ...prev, [id]: val }))
  }

  const canSubmit = blanks.length > 0 && blanks.every((b) => (values[b.id] || '').trim().length > 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    playSfx('click')
    onAnswer(values)
  }

  let previewCode = question.template || ''
  blanks.forEach((b) => {
    const filled = (values[b.id] || '').trim() ? values[b.id] : `[ ${b.placeholder || b.id} ]`
    previewCode = previewCode.replace(new RegExp(`{{${b.id}}}`, 'g'), filled)
  })

  return (
    <form className="challenge-form" onSubmit={handleSubmit}>
      {question.template && (
        <div className="code-preview-box">
          <p className="code-preview-title">Vista previa del código:</p>
          <pre className="code-block"><code>{previewCode}</code></pre>
        </div>
      )}
      <div className="blanks-list">
        {blanks.map((b, index) => (
          <div className="blank-input-group" key={b.id}>
            <label htmlFor={`blank-${b.id}`} className="blank-label">
              {b.label || (blanks.length > 1 ? `Espacio #${index + 1}` : 'Tu código')}:
            </label>
            <input
              id={`blank-${b.id}`}
              type="text"
              className="code-input"
              autoFocus={index === 0}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              placeholder={b.placeholder || 'Escribe aquí...'}
              value={values[b.id] || ''}
              onChange={(e) => handleChange(b.id, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="challenge-actions">
        <button
          type="submit"
          className="btn challenge-submit-btn"
          disabled={!canSubmit}
        >
          Depurar código ▶
        </button>
      </div>
    </form>
  )
}

export default CompleteCodeChallenge
