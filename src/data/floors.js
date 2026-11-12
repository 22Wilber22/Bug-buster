export const floors = [
  {
    id: 'html',
    name: 'HTML',
    subtitle: 'El Piso Vacío',
    bossIds: ['tag-fantasma', 'etiqueta-roja', 'html-corrupto'],
  },
  {
    id: 'css',
    name: 'CSS',
    subtitle: 'El Reino Desordenado',
    bossIds: ['selector-oscuro', 'flexbox-caotico', 'rey-responsive'],
  },
  {
    id: 'js',
    name: 'JavaScript',
    subtitle: 'El Bucle Infinito',
    bossIds: ['undefined', 'bucle-eterno', 'senor-async'],
  },
  {
    id: 'react',
    name: 'React',
    subtitle: 'La Última Renderización',
    bossIds: ['componente-roto', 'hook-maldito', 'render-infinito'],
  },
]

export function isFloorUnlocked(floorIndex, defeatedBossIds = [], floorList = floors) {
  if (floorIndex <= 0) return true
  const prevFloor = floorList[floorIndex - 1]
  if (!prevFloor) return false
  return (
    isFloorUnlocked(floorIndex - 1, defeatedBossIds, floorList) &&
    prevFloor.bossIds.every((id) => defeatedBossIds.includes(id))
  )
}

export function isBossUnlocked(floorIndex, bossIndex, defeatedBossIds = [], floorList = floors) {
  if (!isFloorUnlocked(floorIndex, defeatedBossIds, floorList)) return false
  if (bossIndex <= 0) return true
  const floor = floorList[floorIndex]
  if (!floor) return false
  return defeatedBossIds.includes(floor.bossIds[bossIndex - 1])
}
