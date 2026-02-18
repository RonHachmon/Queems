import type { Stage } from '@/types'

/**
 * Stage 04 — 8×8
 * Solution: red(0,3) blue(1,5) amber(2,7) green(3,1) purple(4,6) teal(5,0) orange(6,2) pink(7,4)
 * All queens satisfy: distinct rows, distinct cols, no adjacency, one per region.
 */
export const stage04: Stage = {
  id: 'stage-04',
  number: 4,
  label: 'Stage 4',
  size: 9,
  grid: [
    ['purple', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'],
    ['pink'  , 'pink'  , 'purple', 'pink'  , 'pink'  , 'brown' , 'yellow', 'yellow', 'yellow'],
    ['pink'  , 'pink'  , 'pink'  , 'pink'  , 'pink'  , 'brown' , 'yellow', 'yellow', 'yellow'],
    ['grey'  , 'pink'  , 'pink'  , 'pink'  , 'brown' , 'brown' , 'yellow', 'yellow', 'yellow'],
    ['grey'  , 'grey'  , 'pink'  , 'grey'  , 'brown' , 'yellow', 'yellow', 'yellow', 'yellow'],
    ['blue'  , 'grey'  , 'grey'  , 'grey'  , 'red'   , 'red'   , 'yellow', 'red'   , 'red'   ],
    ['blue'  , 'blue'  , 'blue'  , 'grey'  , 'red'   , 'red'   , 'red'   , 'red'   , 'red'   ],
    ['green' , 'blue'  , 'blue'  , 'grey'  , 'grey'  , 'red'   , 'red'   , 'red'   , 'orange'],
    ['green' , 'green' , 'blue'  , 'blue'  , 'grey'  , 'grey'  , 'red'   , 'orange', 'orange']
  ],
}
