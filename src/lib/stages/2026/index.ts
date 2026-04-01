import type { Stage } from '@/types'
import { feb2026 } from './feb'
import { mar2026 } from './mar'  
import { apr2026 } from './apr'  
//import { may2026 } from './may'  

export const stages2026: Stage[] = [ ...apr2026, ...mar2026, ...feb2026]
