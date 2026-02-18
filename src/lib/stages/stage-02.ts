import type { Stage } from '@/types'


export const stage02: Stage = {
  id: 'stage-02',
  number: 2,
  label: '16/02',
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
