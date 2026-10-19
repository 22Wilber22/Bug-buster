export const MUTE_KEY = 'bug-buster-muted'

// Retro terminal scales (Hz): A minor for the empty office floor, E phrygian/minor for boss battles.
const SCENES = {
  ambient: {
    stepMs: 420,
    wave: 'triangle',
    gain: 0.045,
    droneHz: 55,
    notes: [220, 0, 261.63, 329.63, 0, 293.66, 261.63, 196, 220, 0, 329.63, 293.66, 246.94, 0, 196, 164.81],
  },
  battle: {
    stepMs: 210,
    wave: 'square',
    gain: 0.032,
    droneHz: 82.41,
    notes: [164.81, 164.81, 196, 220, 246.94, 261.63, 246.94, 196, 164.81, 146.83, 164.81, 196, 220, 196, 146.83, 123.47],
  },
}

const SFX_PATTERNS = {
  click: [{ hz: 760, ms: 35, wave: 'square', gain: 0.04 }],
  open: [
    { hz: 540, ms: 40, wave: 'square', gain: 0.045 },
    { hz: 720, ms: 55, wave: 'square', gain: 0.05 },
  ],
  wrong: [
    { hz: 280, ms: 85, wave: 'sawtooth', gain: 0.07 },
    { hz: 195, ms: 130, wave: 'sawtooth', gain: 0.075 },
  ],
  heal: [
    { hz: 392, ms: 70, wave: 'sine', gain: 0.08 },
    { hz: 523.25, ms: 70, wave: 'sine', gain: 0.08 },
    { hz: 659.25, ms: 130, wave: 'sine', gain: 0.09 },
  ],
  shield: [
    { hz: 440, ms: 70, wave: 'triangle', gain: 0.07 },
    { hz: 659.25, ms: 110, wave: 'triangle', gain: 0.07 },
  ],
  hit: [
    { hz: 523.25, ms: 65, wave: 'square', gain: 0.06 },
    { hz: 659.25, ms: 65, wave: 'square', gain: 0.06 },
    { hz: 783.99, ms: 110, wave: 'square', gain: 0.07 },
  ],
  refactor: [
    { hz: 523.25, ms: 60, wave: 'square', gain: 0.07 },
    { hz: 659.25, ms: 60, wave: 'square', gain: 0.07 },
    { hz: 783.99, ms: 60, wave: 'square', gain: 0.07 },
    { hz: 1046.5, ms: 150, wave: 'square', gain: 0.08 },
  ],
  hurt: [
    { hz: 190, ms: 90, wave: 'sawtooth', gain: 0.08 },
    { hz: 125, ms: 140, wave: 'sawtooth', gain: 0.08 },
  ],
  win: [
    { hz: 523.25, ms: 90, wave: 'triangle', gain: 0.08 },
    { hz: 659.25, ms: 90, wave: 'triangle', gain: 0.08 },
    { hz: 783.99, ms: 90, wave: 'triangle', gain: 0.08 },
    { hz: 1046.5, ms: 220, wave: 'triangle', gain: 0.09 },
  ],
  lose: [
    { hz: 329.63, ms: 120, wave: 'sawtooth', gain: 0.06 },
    { hz: 311.13, ms: 120, wave: 'sawtooth', gain: 0.06 },
    { hz: 293.66, ms: 120, wave: 'sawtooth', gain: 0.06 },
    { hz: 261.63, ms: 260, wave: 'sawtooth', gain: 0.07 },
  ],
}

let audioCtx = null
let loopTimer = null
let droneNodes = null
let activeScene = null
let stepIndex = 0

function getAudioContext() {
  if (audioCtx) return audioCtx
  const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext
  if (!Ctx) return null
  try {
    audioCtx = new Ctx()
    return audioCtx
  } catch {
    return null
  }
}

export function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true'
  } catch {
    return false
  }
}

export function setMuted(muted) {
  const next = Boolean(muted)
  try {
    localStorage.setItem(MUTE_KEY, String(next))
  } catch {
    // Ignore storage errors in private mode.
  }
  if (next) {
    stopLoop()
  } else if (activeScene) {
    startLoop(activeScene)
  }
  return next
}

export function toggleMuted() {
  return setMuted(!isMuted())
}

function playTone(ctx, { hz, ms, wave = 'square', gain = 0.05, delayMs = 0 }) {
  if (!ctx || !hz) return
  try {
    const startAt = ctx.currentTime + delayMs / 1000
    const duration = ms / 1000
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = wave
    osc.frequency.setValueAtTime(hz, startAt)
    amp.gain.setValueAtTime(0.0001, startAt)
    amp.gain.linearRampToValueAtTime(gain, startAt + 0.01)
    amp.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start(startAt)
    osc.stop(startAt + duration + 0.02)
  } catch {
    // Audio nodes can fail if context is closed.
  }
}

function startDrone(ctx, hz) {
  stopDrone()
  if (!ctx || !hz) return
  try {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(hz, ctx.currentTime)
    amp.gain.setValueAtTime(0.018, ctx.currentTime)
    osc.connect(amp)
    amp.connect(ctx.destination)
    osc.start()
    droneNodes = { osc, amp }
  } catch {
    droneNodes = null
  }
}

function stopDrone() {
  if (!droneNodes) return
  try {
    droneNodes.osc.stop()
    droneNodes.osc.disconnect()
    droneNodes.amp.disconnect()
  } catch {
    // Ignore already stopped oscillator.
  }
  droneNodes = null
}

function stopLoop() {
  if (loopTimer) {
    clearInterval(loopTimer)
    loopTimer = null
  }
  stopDrone()
}

function startLoop(sceneKey) {
  stopLoop()
  const config = SCENES[sceneKey]
  if (!config || isMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  startDrone(ctx, config.droneHz)
  const tick = () => {
    if (isMuted()) return
    const hz = config.notes[stepIndex % config.notes.length]
    stepIndex += 1
    if (hz > 0) {
      playTone(ctx, {
        hz,
        ms: config.stepMs * 0.85,
        wave: config.wave,
        gain: config.gain,
      })
    }
  }
  tick()
  loopTimer = setInterval(tick, config.stepMs)
}

export function sceneForScreen(screen) {
  if (screen === 'battle') return 'battle'
  if (screen === 'intro-video') return null
  return 'ambient'
}

export function setSceneAudio(screen) {
  const nextScene = sceneForScreen(screen)
  if (nextScene === activeScene && (loopTimer || !nextScene || isMuted())) {
    return activeScene
  }
  activeScene = nextScene
  stepIndex = 0
  if (!nextScene || isMuted()) {
    stopLoop()
  } else {
    startLoop(nextScene)
  }
  return activeScene
}

export function unlockAudio() {
  if (isMuted()) return
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  if (activeScene && !loopTimer) {
    startLoop(activeScene)
  }
}

export function playSfx(name) {
  if (isMuted()) return false
  const pattern = SFX_PATTERNS[name]
  if (!pattern) return false
  const ctx = getAudioContext()
  if (!ctx) return false
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  let offset = 0
  for (const step of pattern) {
    playTone(ctx, { ...step, delayMs: offset })
    offset += step.ms
  }
  return true
}

export function resetSoundEngine() {
  stopLoop()
  activeScene = null
  stepIndex = 0
  audioCtx = null
}
