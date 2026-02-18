import { create } from 'zustand'
import type { CellCoord, CellKey, GameStoreState } from '@/types'
import { STAGES } from '@/lib/stages'
import { toggleQueen, isSolved, computeInvalidationSet } from '@/lib/board-state'

export const useGameStore = create<GameStoreState>((set, get) => ({
  stageId: '',
  queens: [],
  timerStartedAt: null,
  elapsedSeconds: 0,
  isSolved: false,
  isNewRecord: false,
  manualMarks: [],
  autoMarksByQueen: {},
  autoMarkEnabled: false,

  loadStage(stageId: string) {
    set({
      stageId,
      queens: [],
      timerStartedAt: null,
      elapsedSeconds: 0,
      isSolved: false,
      isNewRecord: false,
      manualMarks: [],
      autoMarksByQueen: {},
      autoMarkEnabled: false,
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

  cycleCell(coord: CellCoord) {
    const state = get()
    if (state.isSolved) return

    const key: CellKey = `${coord.row}:${coord.col}`
    const hasQueen = state.queens.some(
      (q) => q.row === coord.row && q.col === coord.col,
    )
    const isManuallyMarked = state.manualMarks.includes(key)
    const isAutoMarked = Object.values(state.autoMarksByQueen).some((cells) =>
      cells.includes(key),
    )
    const isMarked = isManuallyMarked || isAutoMarked

    if (hasQueen) {
      // Queen → Empty: remove queen and its auto-marks
      const newQueens = state.queens.filter(
        (q) => !(q.row === coord.row && q.col === coord.col),
      )
      const newAutoMarksByQueen = { ...state.autoMarksByQueen }
      delete newAutoMarksByQueen[key]
      const stage = STAGES[state.stageId]
      const solved = stage ? isSolved(newQueens, stage) : false
      set({ queens: newQueens, autoMarksByQueen: newAutoMarksByQueen, isSolved: solved })
    } else if (isMarked) {
      // X-marked → Queen: remove manual mark, place queen
      const newManualMarks = state.manualMarks.filter((k) => k !== key)
      const newQueens = [...state.queens, { row: coord.row, col: coord.col }]
      const timerStartedAt =
        newQueens.length > 0 && state.timerStartedAt === null
          ? Date.now()
          : state.timerStartedAt

      // Apply auto-marks for the newly placed queen if toggle is on
      let newAutoMarksByQueen = state.autoMarksByQueen
      if (state.autoMarkEnabled) {
        const stage = STAGES[state.stageId]
        if (stage) {
          const invalidCells = computeInvalidationSet(coord, stage)
          newAutoMarksByQueen = {
            ...state.autoMarksByQueen,
            [key]: invalidCells.map((c) => `${c.row}:${c.col}` as CellKey),
          }
        }
      }

      const stage = STAGES[state.stageId]
      const solved = stage ? isSolved(newQueens, stage) : false
      set({
        queens: newQueens,
        manualMarks: newManualMarks,
        autoMarksByQueen: newAutoMarksByQueen,
        timerStartedAt,
        isSolved: solved,
      })
    } else {
      // Empty → X-marked
      set({ manualMarks: [...state.manualMarks, key] })
    }
  },

  addManualMark(coord: CellCoord) {
    const state = get()
    const key: CellKey = `${coord.row}:${coord.col}`

    // No-op if cell has a queen
    if (state.queens.some((q) => q.row === coord.row && q.col === coord.col)) return

    // No-op if already manually marked
    if (state.manualMarks.includes(key)) return

    // No-op if auto-marked by any queen
    if (Object.values(state.autoMarksByQueen).some((cells) => cells.includes(key))) return

    set({ manualMarks: [...state.manualMarks, key] })
  },

  toggleAutoMark() {
    const state = get()
    const newEnabled = !state.autoMarkEnabled

    if (newEnabled) {
      // Retroactively apply auto-marks for all currently placed queens
      const stage = STAGES[state.stageId]
      if (stage) {
        const newAutoMarksByQueen: Record<string, CellKey[]> = {}
        for (const queen of state.queens) {
          const qKey: CellKey = `${queen.row}:${queen.col}`
          const invalidCells = computeInvalidationSet(queen, stage)
          newAutoMarksByQueen[qKey] = invalidCells.map(
            (c) => `${c.row}:${c.col}` as CellKey,
          )
        }
        set({ autoMarkEnabled: true, autoMarksByQueen: newAutoMarksByQueen })
        return
      }
    }

    set({ autoMarkEnabled: newEnabled })
  },

  restart() {
    set({
      queens: [],
      timerStartedAt: null,
      elapsedSeconds: 0,
      isSolved: false,
      isNewRecord: false,
      manualMarks: [],
      autoMarksByQueen: {},
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
