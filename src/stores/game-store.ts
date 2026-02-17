import { create } from 'zustand'
import type { CellCoord, GameStoreState } from '@/types'
import { STAGES } from '@/lib/stages'
import { toggleQueen } from '@/lib/board-state'
import { isSolved } from '@/lib/board-state'

export const useGameStore = create<GameStoreState>((set, get) => ({
  stageId: '',
  queens: [],
  timerStartedAt: null,
  elapsedSeconds: 0,
  isSolved: false,
  isNewRecord: false,

  loadStage(stageId: string) {
    set({
      stageId,
      queens: [],
      timerStartedAt: null,
      elapsedSeconds: 0,
      isSolved: false,
      isNewRecord: false,
    })
  },

  placeOrRemoveQueen(coord: CellCoord) {
    const state = get()
    if (state.isSolved) return

    const newQueens = toggleQueen(state.queens, coord)

    // Start the timer on first queen placement
    const timerStartedAt =
      newQueens.length > 0 && state.timerStartedAt === null
        ? Date.now()
        : state.timerStartedAt

    const stage = STAGES[state.stageId]
    const solved = stage ? isSolved(newQueens, stage) : false

    set({ queens: newQueens, timerStartedAt, isSolved: solved })
  },

  restart() {
    set({
      queens: [],
      timerStartedAt: null,
      elapsedSeconds: 0,
      isSolved: false,
      isNewRecord: false,
    })
  },

  tick() {
    const { isSolved: solved, timerStartedAt } = get()
    if (solved || timerStartedAt === null) return
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }))
  },

  markSolved(elapsedSeconds: number, isNewRecord: boolean) {
    set({ isSolved: true, elapsedSeconds, isNewRecord })
  },
}))
