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
  size: 6,
  grid: [
    ['amber',  'amber',  'red',    'red',    'blue',   'blue'  ],
    ['amber',  'purple', 'red',    'red',    'blue',   'green' ],
    ['amber',  'purple', 'purple', 'teal',   'blue',   'green' ],
    ['amber',  'purple', 'teal',   'teal',   'teal',   'green' ],
    ['amber',  'purple', 'teal',   'teal',   'green',  'green' ],
    ['amber',  'amber',  'amber',  'teal',   'green',  'green' ],
  ],
}
