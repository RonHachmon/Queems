import type { Stage } from '@/types'


export const stage03: Stage = {
  id: 'stage-03',
  number: 3,
  label: '15/02',
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
