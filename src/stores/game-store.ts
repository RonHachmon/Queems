import { create } from 'zustand'
import type { CellCoord, CellKey, GameStoreState } from '@/types'
import { STAGES } from '@/lib/stages'
import { toggleQueen, isSolved, computeInvalidationSet } from '@/lib/board-state'
import { useSettingsStore } from '@/stores/settings-store'

export const useGameStore = create<GameStoreState>((set, get) => ({
  stageId: '',
  queens: [],
  timerStartedAt: null,
  elapsedSeconds: 0,
  isSolved: false,
  isNewRecord: false,
  manualMarks: [],
  autoMarksByQueen: {},
  autoMarkEnabled: true,
  actionHistory: [],
  isBatching: false,
  batchBuffer: [],

  loadStage(stageId: string) {
    set({
      stageId,
      queens: [],
      timerStartedAt: Date.now(),
      elapsedSeconds: 0,
      isSolved: false,
      isNewRecord: false,
      manualMarks: [],
      autoMarksByQueen: {},
      autoMarkEnabled: useSettingsStore.getState().autoMarkEnabled,
      actionHistory: [],
      isBatching: false,
      batchBuffer: [],
    })
  },

  placeOrRemoveQueen(coord: CellCoord) {
    const state = get()
    if (state.isSolved) return

    const newQueens = toggleQueen(state.queens, coord)

    const stage = STAGES[state.stageId]
    const solved = stage ? isSolved(newQueens, stage) : false

    set({ queens: newQueens, isSolved: solved })
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
      const prevAutoMarks = state.autoMarksByQueen[key] ?? []
      const newQueens = state.queens.filter(
        (q) => !(q.row === coord.row && q.col === coord.col),
      )
      const newAutoMarksByQueen = { ...state.autoMarksByQueen }
      delete newAutoMarksByQueen[key]
      const stage = STAGES[state.stageId]
      const solved = stage ? isSolved(newQueens, stage) : false
      set({
        queens: newQueens,
        autoMarksByQueen: newAutoMarksByQueen,
        isSolved: solved,
        actionHistory: [
          ...state.actionHistory,
          { type: 'queen-removed', queen: { row: coord.row, col: coord.col }, queenKey: key, autoMarks: prevAutoMarks },
        ],
      })
    } else if (isMarked) {
      // X-marked → Queen: remove manual mark, place queen
      const priorMark: CellKey | null = isManuallyMarked ? key : null
      const newManualMarks = state.manualMarks.filter((k) => k !== key)
      const newQueens = [...state.queens, { row: coord.row, col: coord.col }]

      // Apply auto-marks for the newly placed queen if auto-mark is enabled
      let newAutoMarksByQueen = state.autoMarksByQueen
      let computedAutoMarks: CellKey[] = []
      if (state.autoMarkEnabled) {
        const stage = STAGES[state.stageId]
        if (stage) {
          const invalidCells = computeInvalidationSet(coord, stage)
          computedAutoMarks = invalidCells.map((c) => `${c.row}:${c.col}` as CellKey)
          newAutoMarksByQueen = { ...state.autoMarksByQueen, [key]: computedAutoMarks }
        }
      }

      const stage = STAGES[state.stageId]
      const solved = stage ? isSolved(newQueens, stage) : false
      set({
        queens: newQueens,
        manualMarks: newManualMarks,
        autoMarksByQueen: newAutoMarksByQueen,
        isSolved: solved,
        actionHistory: [
          ...state.actionHistory,
          { type: 'queen-placed', queen: { row: coord.row, col: coord.col }, queenKey: key, autoMarks: computedAutoMarks, priorMark },
        ],
      })
    } else {
      // Empty → X-marked
      set({
        manualMarks: [...state.manualMarks, key],
        actionHistory: [...state.actionHistory, { type: 'mark-batch', keys: [key] }],
      })
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

    set({
      manualMarks: [...state.manualMarks, key],
      ...(state.isBatching && { batchBuffer: [...state.batchBuffer, key] }),
    })
  },

  undo() {
    const state = get()
    if (state.isSolved || state.actionHistory.length === 0) return

    const last = state.actionHistory[state.actionHistory.length - 1]
    const newHistory = state.actionHistory.slice(0, -1)

    switch (last.type) {
      case 'mark-batch':
        set({
          manualMarks: state.manualMarks.filter((k) => !last.keys.includes(k)),
          actionHistory: newHistory,
        })
        break
      case 'queen-placed': {
        const newQueens = state.queens.filter(
          (q) => !(q.row === last.queen.row && q.col === last.queen.col),
        )
        const newAutoMarksByQueen = { ...state.autoMarksByQueen }
        delete newAutoMarksByQueen[last.queenKey]
        const newManualMarks = last.priorMark
          ? [...state.manualMarks, last.priorMark]
          : state.manualMarks
        const stage = STAGES[state.stageId]
        set({
          queens: newQueens,
          autoMarksByQueen: newAutoMarksByQueen,
          manualMarks: newManualMarks,
          isSolved: stage ? isSolved(newQueens, stage) : false,
          actionHistory: newHistory,
        })
        break
      }
      case 'queen-removed': {
        const newQueens = [...state.queens, last.queen]
        const newAutoMarksByQueen = last.autoMarks.length > 0
          ? { ...state.autoMarksByQueen, [last.queenKey]: last.autoMarks }
          : state.autoMarksByQueen
        const stage = STAGES[state.stageId]
        set({
          queens: newQueens,
          autoMarksByQueen: newAutoMarksByQueen,
          isSolved: stage ? isSolved(newQueens, stage) : false,
          actionHistory: newHistory,
        })
        break
      }
    }
  },

  startMarkBatch() {
    set({ isBatching: true, batchBuffer: [] })
  },

  commitMarkBatch() {
    const state = get()
    if (state.batchBuffer.length > 0) {
      set({
        actionHistory: [...state.actionHistory, { type: 'mark-batch', keys: [...state.batchBuffer] }],
      })
    }
    set({ isBatching: false, batchBuffer: [] })
  },

  restart(hardReset: boolean) {
    set({
      queens: [],
      isSolved: false,
      isNewRecord: false,
      manualMarks: [],
      autoMarksByQueen: {},
      actionHistory: [],
      isBatching: false,
      batchBuffer: [],
      ...(hardReset && { elapsedSeconds: 0, timerStartedAt: Date.now() }),
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
