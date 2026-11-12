import { playSfx } from '../engine/sound'

function ActionIcon({ variant }) {
  switch (variant) {
    case 'comment':
      return (
        <svg viewBox="0 0 24 24" className="action-svg-icon" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 4h16v12H9l-5 4V4zm3 5v2h2V9H7zm4 0v2h2V9h-2zm4 0v2h2V9h-2z"
          />
        </svg>
      )
    case 'debug':
      return (
        <svg viewBox="0 0 24 24" className="action-svg-icon" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 3h8v2h2v3h3v2h-3v2h3v2h-3v3h-2v2H8v-2H6v-3H3v-2h3v-2H3V8h3V5h2V3zm2 4v2h4V7h-4zm0 4v4h4v-4h-4z"
          />
        </svg>
      )
    case 'special':
      return (
        <svg viewBox="0 0 24 24" className="action-svg-icon" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13 2L5 14h6l-2 8 10-12h-6l2-8z"
          />
        </svg>
      )
    case 'coffee':
      return (
        <svg viewBox="0 0 24 24" className="action-svg-icon" aria-hidden="true">
          <path
            fill="currentColor"
            d="M7 2h2v3H7V2zm4 0h2v3h-2V2zm4 0h2v3h-2V2zM4 7h13v3h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2v2H4V7zm13 5v3h2v-3h-2zM3 20h15v2H3v-2z"
          />
        </svg>
      )
    default:
      return null
  }
}

function ActionButton({
  variant = 'debug',
  title,
  subtitle,
  disabled = false,
  ready = false,
  onClick,
  ariaLabel,
  titleAttr,
}) {
  const handleClick = () => {
    if (disabled) return
    onClick?.()
  }

  return (
    <button
      type="button"
      className={`btn rpg-action-btn action-${variant} ${ready ? 'action-ready' : ''} ${disabled ? 'action-locked' : ''}`.trim()}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => {
        if (!disabled) playSfx('click')
      }}
      aria-label={ariaLabel || title}
      title={titleAttr || subtitle}
    >
      <span className="action-icon-wrap">
        <ActionIcon variant={variant} />
      </span>
      <span className="action-text-wrap">
        <span className="action-title">{title}</span>
        {subtitle && <span className="action-subtitle">{subtitle}</span>}
      </span>
    </button>
  )
}

export default ActionButton
