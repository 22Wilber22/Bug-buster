import { useCallback, useEffect, useRef, useState } from 'react'
import GameHud from '../components/GameHud'
import { playSfx, setSceneAudio } from '../engine/sound'

// Eager glob instead of a direct import so the build still works when intro.mp4 is missing.
const videos = import.meta.glob('../assets/intro.mp4', { eager: true, query: '?url', import: 'default' })
const introVideo = Object.values(videos)[0]

function Cinematic({ onDone, muted, onToggleMute }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Try playing with current mute preference; if the browser blocks unmuted autoplay, retry muted.
    video.play().catch(() => {
      video.muted = true
      video.play().catch(onDone)
    })
  }, [onDone])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = Boolean(muted)
    }
  }, [muted])

  return (
    <div className="cinematic">
      <video
        ref={videoRef}
        className="cinematic-video"
        src={introVideo}
        autoPlay
        muted={Boolean(muted)}
        playsInline
        onEnded={onDone}
        onError={onDone}
      />
      <div className="cinematic-controls">
        <button
          className="btn skip-btn"
          type="button"
          onClick={onToggleMute}
          aria-pressed={Boolean(muted)}
        >
          {muted ? '🔇 Sonido: OFF' : '🔊 Sonido: ON'}
        </button>
        <button className="btn skip-btn" type="button" onClick={onDone}>Saltar</button>
      </div>
    </div>
  )
}

function Intro({ onStart, muted, onToggleMute }) {
  const [showCinematic, setShowCinematic] = useState(Boolean(introVideo))
  const hideCinematic = useCallback(() => setShowCinematic(false), [])

  useEffect(() => {
    setSceneAudio(showCinematic ? 'intro-video' : 'intro')
  }, [showCinematic])

  if (showCinematic) {
    return <Cinematic onDone={hideCinematic} muted={muted} onToggleMute={onToggleMute} />
  }

  return (
    <main className="screen intro">
      <div className="intro-fallback" />
      <div className="intro-hud">
        <GameHud muted={muted} onToggleMute={onToggleMute} />
      </div>
      <div className="intro-content">
        <h1 className="title">Bug Buster</h1>
        <p className="menu-subtitle">El Piso Vacío</p>
        <p>
          Es tu primer día en TechCorp. El edificio está vacío, el último dev desapareció
          y los bugs... hablan.
        </p>
        <button
          className="btn"
          onClick={() => {
            playSfx('click')
            onStart()
          }}
        >
          Comenzar
        </button>
      </div>
    </main>
  )
}

export default Intro
