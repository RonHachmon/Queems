import type { Stage } from '@/types'

/**
 * Stage 03 — 7×7
 * Solution: red(0,1) blue(1,3) amber(2,5) green(3,0) purple(4,6) teal(5,2) orange(6,4)
 * All queens satisfy: distinct rows, distinct cols, no adjacency, one per region.
 */
export const stage03: Stage = {
  id: 'stage-03',
  number: 3,
  label: 'Stage 3',
  size: 9,
  grid: [
    ['red'   , 'red'   , 'red'   , 'orange', 'orange', 'orange', 'blue'  , 'blue'  , 'blue'  ],
    ['red'   , 'red'   , 'orange', 'orange', 'green' , 'orange', 'orange', 'blue'  , 'blue'  ],
    ['red'   , 'orange', 'orange', 'green' , 'green' , 'green' , 'orange', 'orange', 'blue'  ],
    ['orange', 'orange', 'grey'  , 'grey'  , 'grey'  , 'green' , 'purple', 'orange', 'orange'],
    ['orange', 'grey'  , 'grey'  , 'grey'  , 'green' , 'green' , 'purple', 'purple', 'orange'],
    ['orange', 'orange', 'grey'  , 'grey'  , 'grey'  , 'grey'  , 'purple', 'orange', 'orange'],
    ['yellow', 'orange', 'orange', 'grey'  , 'grey'  , 'grey'  , 'orange', 'orange', 'brown' ],
    ['yellow', 'yellow', 'orange', 'orange', 'grey'  , 'orange', 'orange', 'brown' , 'brown' ],
    ['pink'  , 'pink'  , 'pink'  , 'orange', 'orange', 'orange', 'brown' , 'brown' , 'brown' ]
  ],
}
