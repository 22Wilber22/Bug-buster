import { playSfx } from '../../engine/sound'

const TRUE_FALSE_OPTIONS = [
  { label: 'Verdadero', value: true },
  { label: 'Falso', value: false },
]

function answerOptions(question) {
  return question.type === 'truefalse'
    ? TRUE_FALSE_OPTIONS
    : question.options.map((label, index) => ({ label, value: index }))
}

function MultipleChoiceChallenge({ question, onAnswer }) {
  return (
    <div className="options">
      {answerOptions(question).map((option) => (
        <button
          key={String(option.label)}
          className="btn option"
          type="button"
          onMouseEnter={() => playSfx('click')}
          onClick={() => onAnswer(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default MultipleChoiceChallenge
