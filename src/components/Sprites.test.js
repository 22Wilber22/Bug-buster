import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import PlayerSprite from './PlayerSprite'
import BossSprite from './BossSprite'
import { BOSS_SPRITES } from '../data/bosses'

const ALL_BOSS_IDS = [
  'tag-fantasma',
  'etiqueta-roja',
  'html-corrupto',
  'selector-oscuro',
  'flexbox-caotico',
  'rey-responsive',
  'undefined',
  'bucle-eterno',
  'senor-async',
  'componente-roto',
  'hook-maldito',
  'render-infinito',
]

describe('Pixel Art Sprites (PlayerSprite & BossSprite)', () => {
  it('registra los 12 jefes en BOSS_SPRITES con rutas PNG en /assets/bosses/', () => {
    expect(Object.keys(BOSS_SPRITES)).toEqual(ALL_BOSS_IDS)
    for (const id of ALL_BOSS_IDS) {
      expect(BOSS_SPRITES[id]).toBe(`/assets/bosses/${id}.png`)
    }
  })

  it('PlayerSprite renderiza la imagen Pixel Art del Debugger y soporta los estados de combate', () => {
    for (const state of ['idle', 'attack', 'hurt', 'victory', 'defeat']) {
      const html = renderToStaticMarkup(createElement(PlayerSprite, { fx: state }))
      expect(html).toContain(`fx-${state}`)
      expect(html).toContain('/assets/characters/debugger.png')
    }
  })

  it('PlayerSprite muestra el respaldo CSS si no se provee imagen', () => {
    const html = renderToStaticMarkup(createElement(PlayerSprite, { src: '' }))
    expect(html).toContain('px-head')
    expect(html).toContain('&lt;/&gt;')
  })

  it('BossSprite selecciona el sprite correcto por ID para los 12 jefes y aplica animaciones', () => {
    for (const id of ALL_BOSS_IDS) {
      for (const state of ['idle', 'attack', 'hurt', 'victory', 'defeat']) {
        const html = renderToStaticMarkup(createElement(BossSprite, { bossId: id, fx: state }))
        expect(html).toContain(`/assets/bosses/${id}.png`)
        expect(html).toContain(`boss-fx-${state}`)
        expect(html).toContain(`boss-id-${id}`)
      }
    }
  })

  it('BossSprite retorna null si no recibe bossId', () => {
    const html = renderToStaticMarkup(createElement(BossSprite, { bossId: null }))
    expect(html).toBe('')
  })
})
