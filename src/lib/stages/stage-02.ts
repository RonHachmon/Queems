import type { Stage } from '@/types'

/**
 * Stage 02 — 6×6
 * Solution: red(0,2) blue(1,4) amber(2,0) green(3,5) purple(4,1) teal(5,3)
 * All queens satisfy: distinct rows, distinct cols, no adjacency, one per region.
 */
export const stage02: Stage = {
  id: 'stage-02',
  number: 2,
  label: 'Stage 2',
  size: 7,
  grid: [
    ['purple', 'purple', 'purple', 'purple', 'purple', 'purple', 'purple'],
    ['orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
    ['orange', 'blue'  , 'orange', 'orange', 'red'   , 'red'   , 'red'   ],
    ['blue'  , 'blue'  , 'orange', 'orange', 'red'   , 'grey'  , 'grey'  ],
    ['green' , 'blue'  , 'orange', 'orange', 'red'   , 'red'   , 'red'   ],
    ['green' , 'blue'  , 'orange', 'orange', 'red'   , 'yellow', 'red'   ],
    ['blue'  , 'blue'  , 'blue'  , 'orange', 'red'   , 'red'   , 'red'   ]
  ],
}
