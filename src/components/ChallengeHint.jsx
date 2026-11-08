import { useState } from 'react'
import { playSfx } from '../engine/sound'

function ChallengeHint({ hint }) {
  const [open, setOpen] = useState(false)

  if (!hint) return null

  const toggle = () => {
    playSfx('click')
    setOpen((prev) => !prev)
  }

  return (
    <div className="challenge-hint-container">
      <button
        type="button"
        className="btn btn-secondary hint-toggle-btn"
        onClick={toggle}
        aria-expanded={open}
      >
        💡 {open ? 'Ocultar pista' : 'Ver pista'}
      </button>
      {open && (
        <div className="hint-content" role="region" aria-live="polite">
          <p className="hint-text">
            <strong>Pista:</strong> {hint}
          </p>
        </div>
      )}
    </div>
  )
}

export default ChallengeHint
