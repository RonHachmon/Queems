import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BestTimesState } from '@/types'

export const useBestTimesStore = create<BestTimesState>()(
  persist(
    (set, get) => ({
      bestTimes: {},

      saveBestTime(stageId: string, seconds: number) {
        const existing = get().bestTimes[stageId]
        if (existing === undefined || seconds < existing) {
          set((state) => ({
            bestTimes: { ...state.bestTimes, [stageId]: seconds },
          }))
        }
      },

      getBestTime(stageId: string) {
        return get().bestTimes[stageId]
      },
    }),
    {
      name: 'queems-best-times',
    },
  ),
)
