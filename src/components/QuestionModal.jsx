import { useEffect } from 'react'
import { isAnswerCorrect } from '../engine/battle'
import { playSfx } from '../engine/sound'

const TRUE_FALSE_OPTIONS = [
  { label: 'Verdadero', value: true },
  { label: 'Falso', value: false },
]

function answerOptions(question) {
  return question.type === 'truefalse'
    ? TRUE_FALSE_OPTIONS
    : question.options.map((label, index) => ({ label, value: index }))
}

function QuestionModal({ question, refactoring, onAnswer, onCancel }) {
  const answer = (value) => onAnswer({ type: 'answer', correct: isAnswerCorrect(question, value) })

  const handleClose = () => {
    playSfx('click')
    if (onCancel) {
      onCancel()
    } else {
      onAnswer({ type: 'cancel' })
    }
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <p className="muted modal-tag">
            {refactoring ? '⚡ Ataque Especial (Refactor): daño doble si aciertas' : 'Debug'}
          </p>
          <button
            className="btn btn-secondary modal-close-btn"
            type="button"
            onClick={handleClose}
            aria-label="Cerrar pregunta"
            title="Volver para elegir otra acción (Esc)"
          >
            ✕
          </button>
        </div>
        <h3>{question.text}</h3>
        <div className="options">
          {answerOptions(question).map((option) => (
            <button
              key={option.label}
              className="btn option"
              type="button"
              onMouseEnter={() => playSfx('click')}
              onClick={() => answer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuestionModal
