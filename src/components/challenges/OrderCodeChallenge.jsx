import { useState } from 'react'
import { playSfx } from '../../engine/sound'

function OrderCodeChallenge({ question, onAnswer }) {
  const [items, setItems] = useState(() => [...(question.lines || [])])

  const move = (index, dir) => {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setItems(next)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    playSfx('click')
    onAnswer(items.map((l) => l.id))
  }

  return (
    <form className="challenge-form" onSubmit={handleSubmit}>
      <div className="order-list">
        {items.map((line, i) => (
          <div key={line.id} className="order-item">
            <div className="order-controls">
              <button
                type="button"
                className="btn btn-secondary order-btn"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label="Subir línea"
              >▲</button>
              <button
                type="button"
                className="btn btn-secondary order-btn"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Bajar línea"
              >▼</button>
            </div>
            <code className="order-code-line">{line.content}</code>
          </div>
        ))}
      </div>
      <div className="challenge-actions">
        <button type="submit" className="btn challenge-submit-btn">
          Ordenar código ▶
        </button>
      </div>
    </form>
  )
}

export default OrderCodeChallenge
