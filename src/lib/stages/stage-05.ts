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
    ['purple', 'pink',   'amber',  'amber',  'blue',   'blue',   'red',    'green' ],
    ['purple', 'pink',   'amber',  'blue',   'blue',   'blue',   'red',    'green' ],
    ['purple', 'pink',   'amber',  'blue',   'teal',   'teal',   'red',    'green' ],
    ['purple', 'pink',   'pink',   'blue',   'teal',   'teal',   'teal',   'green' ],
    ['purple', 'pink',   'pink',   'orange', 'orange', 'teal',   'teal',   'green' ],
    ['purple', 'orange', 'orange', 'orange', 'orange', 'teal',   'teal',   'green' ],
    ['purple', 'pink',   'orange', 'orange', 'orange', 'orange', 'teal',   'green' ],
    ['purple', 'pink',   'pink',   'pink',   'pink',   'orange', 'teal',   'green' ],
  ],
}
