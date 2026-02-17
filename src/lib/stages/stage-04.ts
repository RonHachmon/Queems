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
  size: 8,
  grid: [
    ['teal',   'green',  'green',  'red',    'red',    'blue',   'blue',   'amber' ],
    ['teal',   'green',  'green',  'red',    'red',    'blue',   'purple', 'amber' ],
    ['teal',   'green',  'red',    'red',    'orange', 'blue',   'purple', 'amber' ],
    ['teal',   'green',  'orange', 'orange', 'orange', 'blue',   'purple', 'amber' ],
    ['teal',   'orange', 'orange', 'orange', 'orange', 'pink',   'purple', 'amber' ],
    ['teal',   'orange', 'orange', 'pink',   'pink',   'pink',   'purple', 'amber' ],
    ['teal',   'orange', 'orange', 'pink',   'pink',   'pink',   'purple', 'amber' ],
    ['teal',   'teal',   'teal',   'teal',   'pink',   'pink',   'purple', 'amber' ],
  ],
}
