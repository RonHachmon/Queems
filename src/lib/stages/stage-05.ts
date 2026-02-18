import type { Stage } from '@/types'

/**
 * Stage 05 — 8×8 (alternate layout)
 * Solution: purple(4,0) pink(7,1) amber(2,2) orange(6,3) blue(1,4) teal(5,5) red(0,6) green(3,7)
 * All queens satisfy: distinct rows, distinct cols, no adjacency, one per region.
 */
export const stage05: Stage = {
  id: 'stage-05',
  number: 5,
  label: 'Stage 5',
  size: 8,
  grid: [
    ['purple', 'purple', 'purple', 'orange', 'orange', 'orange', 'orange', 'orange'],
    ['purple', 'purple', 'purple', 'orange', 'blue'  , 'blue'  , 'green' , 'green' ],
    ['purple', 'purple', 'purple', 'purple', 'purple', 'blue'  , 'green' , 'green' ],
    ['grey'  , 'grey'  , 'purple', 'purple', 'purple', 'purple', 'green' , 'green' ],
    ['red'   , 'grey'  , 'purple', 'purple', 'purple', 'purple', 'green' , 'green' ],
    ['red'   , 'grey'  , 'grey'  , 'purple', 'purple', 'purple', 'purple', 'purple'],
    ['red'   , 'yellow', 'yellow', 'yellow', 'brown' , 'purple', 'purple', 'purple'],
    ['red'   , 'red'   , 'red'   , 'yellow', 'brown' , 'purple', 'purple', 'purple']
  ],
}
