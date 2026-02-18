import type { Stage } from '@/types'
import { stage01 } from './stage-01'
import { stage02 } from './stage-02'
import { stage03 } from './stage-03'
import { stage04 } from './stage-04'
import { stage05 } from './stage-05'
import { stage06 } from './stage-06'

export const STAGES: Record<string, Stage> = {
  'stage-01': stage01,
  'stage-02': stage02,
  'stage-03': stage03,
  'stage-04': stage04,
  'stage-05': stage05,
  'stage-06': stage06,
}

export const STAGE_IDS: string[] = [
  'stage-01',
  'stage-02',
  'stage-03',
  'stage-04',
  'stage-05',
  'stage-06',
]
