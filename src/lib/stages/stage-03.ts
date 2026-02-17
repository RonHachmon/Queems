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
  size: 7,
  grid: [
    ['green',  'red',    'red',    'blue',   'blue',   'amber',  'purple'],
    ['green',  'red',    'red',    'blue',   'blue',   'amber',  'purple'],
    ['green',  'teal',   'teal',   'blue',   'teal',   'amber',  'purple'],
    ['green',  'teal',   'teal',   'teal',   'orange', 'amber',  'purple'],
    ['green',  'teal',   'teal',   'orange', 'orange', 'orange', 'purple'],
    ['green',  'green',  'teal',   'orange', 'orange', 'orange', 'purple'],
    ['green',  'green',  'green',  'orange', 'orange', 'orange', 'purple'],
  ],
}
