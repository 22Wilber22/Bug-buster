import { useEffect } from 'react'
import { validateChallenge } from '../engine/challengeValidator'
import { playSfx } from '../engine/sound'
import ChallengeHint from './ChallengeHint'
import MultipleChoiceChallenge from './challenges/MultipleChoiceChallenge'
import CompleteCodeChallenge from './challenges/CompleteCodeChallenge'
import FixBugChallenge from './challenges/FixBugChallenge'
import OrderCodeChallenge from './challenges/OrderCodeChallenge'
import PredictOutputChallenge from './challenges/PredictOutputChallenge'
import WriteCodeChallenge from './challenges/WriteCodeChallenge'

function renderChallengeBody(question, handleAnswer) {
  switch (question.type) {
    case 'complete-code':
      return <CompleteCodeChallenge question={question} onAnswer={handleAnswer} />
    case 'fix-bug':
      return <FixBugChallenge question={question} onAnswer={handleAnswer} />
    case 'order-code':
      return <OrderCodeChallenge question={question} onAnswer={handleAnswer} />
    case 'predict-output':
      return <PredictOutputChallenge question={question} onAnswer={handleAnswer} />
    case 'write-code':
      return <WriteCodeChallenge question={question} onAnswer={handleAnswer} />
    case 'multiple':
    case 'truefalse':
    default:
      return <MultipleChoiceChallenge question={question} onAnswer={handleAnswer} />
  }
}

function QuestionModal({ question, refactoring, onAnswer, onCancel }) {
  const answer = (value) => onAnswer({
    type: 'answer',
    correct: validateChallenge(question, value),
    explanation: question.explanation,
  })

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

  const challengeBadge = refactoring
    ? '⚡ Ataque Especial (Refactor): daño doble si aciertas'
    : question.type === 'complete-code'
      ? '⌨ Completar código'
      : question.type === 'fix-bug'
        ? '🛠 Corregir bug'
        : question.type === 'order-code'
          ? '↕ Ordenar código'
          : question.type === 'predict-output'
            ? '🔍 Predecir resultado'
            : question.type === 'write-code'
              ? '✏ Escribir código'
              : 'Debug'

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <p className="muted modal-tag">{challengeBadge}</p>
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
        <ChallengeHint hint={question.hint} />
        {renderChallengeBody(question, answer)}
      </div>
    </div>
  )
}

export default QuestionModal
