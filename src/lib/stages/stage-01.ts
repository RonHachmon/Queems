import type { Stage } from '@/types'


export const stage01: Stage = {
  id: 'stage-01',
  number: 1,
  label: '17/02',
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
