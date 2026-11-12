# Arquitectura de Bug Buster 2.0

## 1. Separación Conceptual de Módulos

| Sistema Conceptual | Módulo Real en el Repositorio | Responsabilidad |
| --- | --- | --- |
| `CombatSystem` | `src/engine/battle.js` | Reglas puras de turnos, daño, racha (`streak`) y escudo (`comment`). |
| `ChallengeValidator` | `src/engine/challengeValidator.js` | Evaluación determinista sin `eval()` de los 7 tipos de desafíos. |
| `TransitionSystem` | `src/engine/transitionMachine.js` | Máquina de estados de fin de combate y caminata hacia el portal (`combat` → `enemy_defeated` → `victory` → `rewards` → `walking_right` → `exiting` → `loading_next_level` → `entering` → `ready`). |
| `EnemyPatternSystem` | `src/engine/enemyPatterns.js` | Patrones (`agresivo`, `defensivo`, `estrategico`, `impredecible`, `jefe`) y señales de anticipación (*telegraphing*). |
| `ExplorationSystem` | `src/engine/exploration.js` + `src/screens/Exploration.jsx` | Movimiento lateral 2D (`idle`, `walk`), cámara con límites, colisiones con NPC, enemigo y portal `[ > ]`. |
| `ProgressionSystem` | `src/engine/progression.js` | Tienda extendida, mejoras permanentes, skins/accesorios, logros y cálculo de estadísticas (`base` + `bonus`). |
| `SaveSystem` | `src/engine/save.js` | Persistencia principal compatible con v1/v2 (`bug-buster-save`) sincronizada con `progression.js` (`bug-buster-progression`). |

## 2. Máquina de Estados Global y de Nivel

### Flujo Global de Pantallas (`App.jsx`)
`MENU` → `INTRO` → `MAP` / `EXPLORING` → `BATTLE` (`COMBAT` → `VICTORY` → `WALKING_RIGHT` → `EXITING`) → `CLUE / SHOP` → `NEXT BOSS` / `ENDING`.

### Máquina de Transición de Fin de Nivel (`transitionMachine.js`)
```
combat
  └─(WIN_COMBAT)──► enemy_defeated
                      └─(ENEMY_FADED)──► victory
                                           └─(SHOW_REWARDS)──► rewards
                                                                 └─(START_WALK)──► walking_right
                                                                                     └─(REACH_PORTAL)──► exiting
                                                                                                           └─(LOAD_NEXT)──► loading_next_level
                                                                                                                              └─(ENTER_SCENE)──► entering
                                                                                                                                                   └─(SCENE_READY)──► ready
```
En caso de derrota (`LOSE_COMBAT`), el estado permanece fuera de la secuencia de victoria y redirige al flujo de derrota existente sin otorgar recompensas ni avanzar de nivel.
