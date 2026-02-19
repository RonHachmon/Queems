import type { Stage } from '@/types'
import { stages2026 } from './2026'
// import { stages2027 } from './2027'  ← append when year rolls over

export const ALL_STAGES: Stage[] = [...stages2026]
export const STAGES: Record<string, Stage> = Object.fromEntries(ALL_STAGES.map(s => [s.id, s]))
export const STAGE_IDS: string[] = ALL_STAGES.map(s => s.id)
