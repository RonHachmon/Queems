import type { Stage } from '@/types'

/**
 * Stage 01 — 7×7 (from 02-17.png)
 * 7 regions: blue, green, red, purple, yellow, orange, grey
 */
export const stage01: Stage = {
  id: 'stage-01',
  number: 1,
  label: 'Stage 1',
  size: 7,
  grid: [
    ['blue',   'blue',   'blue',   'blue',   'blue',   'red',    'red'  ],
    ['blue',   'green',  'blue',   'blue',   'red',   'red',    'grey'  ],
    ['blue',   'blue',   'blue',   'purple', 'red',    'yellow', 'grey'  ],
    ['purple', 'purple', 'purple', 'purple', 'yellow', 'yellow', 'grey'  ],
    ['purple', 'orange', 'purple', 'yellow', 'yellow', 'yellow', 'grey'  ],
    ['orange', 'orange', 'yellow', 'yellow', 'yellow', 'grey',   'grey'  ],
    ['orange', 'grey',   'grey',   'grey',   'grey',   'grey',   'grey'  ],
  ],
}
