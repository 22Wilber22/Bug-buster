import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MUTE_KEY,
  isMuted,
  setMuted,
  toggleMuted,
  sceneForScreen,
  setSceneAudio,
  playSfx,
  resetSoundEngine,
} from './sound'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

function fakeAudioContext() {
  const oscillators = []
  return {
    oscillators,
    Ctx: class {
      constructor() {
        this.currentTime = 0
        this.state = 'running'
        this.destination = {}
      }
      resume() {
        this.state = 'running'
        return Promise.resolve()
      }
      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          disconnect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        }
        oscillators.push(osc)
        return osc
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          disconnect: vi.fn(),
        }
      }
    },
  }
}

describe('sound engine', () => {
  let audio

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('localStorage', memoryStorage())
    audio = fakeAudioContext()
    vi.stubGlobal('AudioContext', audio.Ctx)
    resetSoundEngine()
  })

  afterEach(() => {
    resetSoundEngine()
    vi.useRealTimers()
  })

  it('defaults to unmuted and persists mute state in localStorage', () => {
    expect(isMuted()).toBe(false)
    expect(setMuted(true)).toBe(true)
    expect(isMuted()).toBe(true)
    expect(localStorage.getItem(MUTE_KEY)).toBe('true')
    expect(toggleMuted()).toBe(false)
    expect(isMuted()).toBe(false)
  })

  it('maps screens to ambient, battle or silent video scene', () => {
    expect(sceneForScreen('menu')).toBe('ambient')
    expect(sceneForScreen('map')).toBe('ambient')
    expect(sceneForScreen('battle')).toBe('battle')
    expect(sceneForScreen('intro-video')).toBeNull()
  })

  it('plays SFX when unmuted and suppresses them when muted', () => {
    expect(playSfx('hit')).toBe(true)
    expect(audio.oscillators.length).toBeGreaterThan(0)
    const countBefore = audio.oscillators.length
    setMuted(true)
    expect(playSfx('hit')).toBe(false)
    expect(audio.oscillators.length).toBe(countBefore)
  })

  it('starts and stops ambient loop when muting and unmuting', () => {
    setSceneAudio('map')
    expect(audio.oscillators.length).toBeGreaterThan(0)
    setMuted(true)
    const afterMute = audio.oscillators.length
    vi.advanceTimersByTime(1000)
    expect(audio.oscillators.length).toBe(afterMute)
    setMuted(false)
    expect(audio.oscillators.length).toBeGreaterThan(afterMute)
  })
})
