import { useState } from 'react'
import { playSfx } from '../../engine/sound'

function FixBugChallenge({ question, onAnswer }) {
  const [correction, setCorrection] = useState('')

  const canSubmit = correction.trim().length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    playSfx('click')
    onAnswer(correction.trim())
  }

  let previewCode = question.initialCode || ''
  if (question.target) {
    const replacement = correction.trim() ? correction : `[ ${question.target} ]`
    previewCode = previewCode.replace(question.target, replacement)
  }

  return (
    <form className="challenge-form" onSubmit={handleSubmit}>
      {question.initialCode && (
        <div className="code-preview-box">
          <p className="code-preview-title">Código defectuoso:</p>
          <pre className="code-block code-buggy"><code>{previewCode}</code></pre>
        </div>
      )}
      {question.target && (
        <div className="bug-target-notice">
          <span>⚠ Fragmento a corregir: </span>
          <code className="target-snippet">{question.target}</code>
        </div>
      )}
      <div className="blank-input-group">
        <label htmlFor="bug-fix-input" className="blank-label">
          Corrección:
        </label>
        <input
          id="bug-fix-input"
          type="text"
          className="code-input"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder="Escribe el fragmento corregido..."
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
        />
      </div>
      <div className="challenge-actions">
        <button
          type="submit"
          className="btn challenge-submit-btn"
          disabled={!canSubmit}
        >
          Corregir bug ▶
        </button>
      </div>
    </form>
  )
}

export default FixBugChallenge
