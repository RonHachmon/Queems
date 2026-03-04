import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/stores/game-store'
import { useSettingsStore } from '@/stores/settings-store'
import type { CellKey } from '@/types'

// Reset the store to a clean empty board before each test.
// useGameStore.setState merges into existing state, so action functions are preserved.
function resetStore() {
  useGameStore.setState({
    stageId: 'test',
    queens: [],
    timerStartedAt: null,
    elapsedSeconds: 0,
    isSolved: false,
    isNewRecord: false,
    manualMarks: [],
    autoMarksByQueen: {},
    autoMarkEnabled: false,
    actionHistory: [],
    isBatching: false,
    batchBuffer: [],
  })
}

describe('loadStage', () => {
  it('initializes autoMarkEnabled from the settings store when setting is ON', () => {
    useSettingsStore.setState({ autoMarkEnabled: true })
    useGameStore.getState().loadStage('stage-1')
    expect(useGameStore.getState().autoMarkEnabled).toBe(true)
  })

  it('initializes autoMarkEnabled from the settings store when setting is OFF', () => {
    useSettingsStore.setState({ autoMarkEnabled: false })
    useGameStore.getState().loadStage('stage-1')
    expect(useGameStore.getState().autoMarkEnabled).toBe(false)
  })
})

describe('addManualMark', () => {
  beforeEach(() => {
    resetStore()
  })

  it('adds an empty cell key to manualMarks', () => {
    useGameStore.getState().addManualMark({ row: 1, col: 2 })
    const { manualMarks } = useGameStore.getState()
    expect(manualMarks).toContain('1:2' as CellKey)
    expect(manualMarks).toHaveLength(1)
  })

  it('is a no-op when the cell already has a queen', () => {
    useGameStore.setState({ queens: [{ row: 1, col: 2 }] })
    useGameStore.getState().addManualMark({ row: 1, col: 2 })
    const { manualMarks } = useGameStore.getState()
    expect(manualMarks).not.toContain('1:2' as CellKey)
    expect(manualMarks).toHaveLength(0)
  })

  it('is a no-op when the cell is already manually marked (idempotent)', () => {
    useGameStore.setState({ manualMarks: ['1:2' as CellKey] })
    useGameStore.getState().addManualMark({ row: 1, col: 2 })
    const { manualMarks } = useGameStore.getState()
    // Must still be exactly one entry, not two
    expect(manualMarks.filter((k) => k === ('1:2' as CellKey))).toHaveLength(1)
  })

  it('is a no-op when the cell is auto-marked by a queen', () => {
    useGameStore.setState({
      autoMarksByQueen: { '0:0': ['1:2' as CellKey] },
    })
    useGameStore.getState().addManualMark({ row: 1, col: 2 })
    const { manualMarks } = useGameStore.getState()
    expect(manualMarks).not.toContain('1:2' as CellKey)
    expect(manualMarks).toHaveLength(0)
  })

  it('marks multiple different empty cells independently', () => {
    useGameStore.getState().addManualMark({ row: 0, col: 0 })
    useGameStore.getState().addManualMark({ row: 2, col: 3 })
    const { manualMarks } = useGameStore.getState()
    expect(manualMarks).toContain('0:0' as CellKey)
    expect(manualMarks).toContain('2:3' as CellKey)
    expect(manualMarks).toHaveLength(2)
  })

  it('does not mark the starting cell of a queen when a different cell is targeted', () => {
    // Queen at (0,0); mark at (0,1) should succeed; mark at (0,0) must not
    useGameStore.setState({ queens: [{ row: 0, col: 0 }] })
    useGameStore.getState().addManualMark({ row: 0, col: 0 })
    useGameStore.getState().addManualMark({ row: 0, col: 1 })
    const { manualMarks } = useGameStore.getState()
    expect(manualMarks).not.toContain('0:0' as CellKey)
    expect(manualMarks).toContain('0:1' as CellKey)
  })
})

// ─── T002: Foundational undo behaviors ────────────────────────────────────────

describe('undo - foundational', () => {
  beforeEach(() => {
    resetStore()
  })

  it('is a no-op when actionHistory is empty', () => {
    useGameStore.setState({ actionHistory: [] })
    useGameStore.getState().undo()
    const { manualMarks, queens, actionHistory } = useGameStore.getState()
    expect(queens).toHaveLength(0)
    expect(manualMarks).toHaveLength(0)
    expect(actionHistory).toHaveLength(0)
  })

  it('is a no-op when isSolved is true', () => {
    useGameStore.setState({
      isSolved: true,
      queens: [{ row: 0, col: 0 }],
      actionHistory: [{ type: 'mark-batch', keys: ['1:1' as CellKey] }],
    })
    useGameStore.getState().undo()
    const { queens, actionHistory } = useGameStore.getState()
    // State must be unchanged
    expect(queens).toHaveLength(1)
    expect(actionHistory).toHaveLength(1)
  })

  it('loadStage clears actionHistory', () => {
    useGameStore.setState({
      actionHistory: [{ type: 'mark-batch', keys: ['0:0' as CellKey] }],
    })
    useGameStore.getState().loadStage('any-stage')
    expect(useGameStore.getState().actionHistory).toHaveLength(0)
  })

  it('restart clears actionHistory', () => {
    useGameStore.setState({
      actionHistory: [{ type: 'mark-batch', keys: ['0:0' as CellKey] }],
    })
    useGameStore.getState().restart(false)
    expect(useGameStore.getState().actionHistory).toHaveLength(0)
  })

  it('commitMarkBatch with empty buffer creates no history entry', () => {
    useGameStore.getState().startMarkBatch()
    useGameStore.getState().commitMarkBatch()
    expect(useGameStore.getState().actionHistory).toHaveLength(0)
    expect(useGameStore.getState().isBatching).toBe(false)
  })
})

// ─── T004: Queen-placement undo ───────────────────────────────────────────────

describe('undo - queen placement (cycleCell)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('undo after X→queen removes queen and restores the X mark (no auto-marks)', () => {
    // Start: cell (1,2) is X-marked
    useGameStore.setState({ manualMarks: ['1:2' as CellKey] })
    // cycleCell X→queen
    useGameStore.getState().cycleCell({ row: 1, col: 2 })
    const afterPlace = useGameStore.getState()
    expect(afterPlace.queens).toHaveLength(1)
    expect(afterPlace.manualMarks).not.toContain('1:2' as CellKey)
    expect(afterPlace.actionHistory).toHaveLength(1)

    // Undo: queen gone, X mark restored
    useGameStore.getState().undo()
    const afterUndo = useGameStore.getState()
    expect(afterUndo.queens).toHaveLength(0)
    expect(afterUndo.manualMarks).toContain('1:2' as CellKey)
    expect(afterUndo.actionHistory).toHaveLength(0)
  })

  it('undo after X→queen removes auto-marks associated with that queen', () => {
    // Start: cell (1,2) is X-marked; auto-mark is enabled; we'll fake auto-marks via state inspection
    // We set up the auto-marks manually to test undo removes them
    useGameStore.setState({
      manualMarks: ['1:2' as CellKey],
      autoMarkEnabled: false, // keep simple, no real auto-marks
    })
    useGameStore.getState().cycleCell({ row: 1, col: 2 })

    // Manually inject auto-marks into the recorded history and state to simulate enabled auto-mark
    useGameStore.setState({
      autoMarksByQueen: { '1:2': ['0:0' as CellKey, '2:0' as CellKey] },
      actionHistory: [{
        type: 'queen-placed',
        queen: { row: 1, col: 2 },
        queenKey: '1:2' as CellKey,
        autoMarks: ['0:0' as CellKey, '2:0' as CellKey],
        priorMark: '1:2' as CellKey,
      }],
    })

    useGameStore.getState().undo()
    const { queens, autoMarksByQueen, manualMarks } = useGameStore.getState()
    expect(queens).toHaveLength(0)
    expect(autoMarksByQueen['1:2']).toBeUndefined()
    expect(manualMarks).toContain('1:2' as CellKey)
  })

  it('undo after queen→empty re-places the queen and restores auto-marks', () => {
    // Start: queen at (0,0) with auto-marks
    useGameStore.setState({
      queens: [{ row: 0, col: 0 }],
      autoMarksByQueen: { '0:0': ['1:1' as CellKey, '2:2' as CellKey] },
    })
    // cycleCell queen→empty
    useGameStore.getState().cycleCell({ row: 0, col: 0 })
    const afterRemove = useGameStore.getState()
    expect(afterRemove.queens).toHaveLength(0)
    expect(afterRemove.autoMarksByQueen['0:0']).toBeUndefined()
    expect(afterRemove.actionHistory).toHaveLength(1)
    expect(afterRemove.actionHistory[0].type).toBe('queen-removed')

    // Undo: queen restored with auto-marks
    useGameStore.getState().undo()
    const afterUndo = useGameStore.getState()
    expect(afterUndo.queens).toHaveLength(1)
    expect(afterUndo.queens[0]).toEqual({ row: 0, col: 0 })
    expect(afterUndo.autoMarksByQueen['0:0']).toEqual(['1:1', '2:2'])
    expect(afterUndo.actionHistory).toHaveLength(0)
  })

  it('chained undos step back two queen actions correctly', () => {
    // Place queen at (0,0) from empty
    useGameStore.setState({ manualMarks: ['0:0' as CellKey] })
    useGameStore.getState().cycleCell({ row: 0, col: 0 }) // X→queen at (0,0)

    // Place queen at (1,1) from empty (mark it first)
    useGameStore.setState({ manualMarks: [...useGameStore.getState().manualMarks, '1:1' as CellKey] })
    useGameStore.getState().cycleCell({ row: 1, col: 1 }) // X→queen at (1,1)

    expect(useGameStore.getState().queens).toHaveLength(2)
    expect(useGameStore.getState().actionHistory).toHaveLength(2)

    // Undo #1: removes (1,1)
    useGameStore.getState().undo()
    expect(useGameStore.getState().queens).toHaveLength(1)
    expect(useGameStore.getState().queens[0]).toEqual({ row: 0, col: 0 })
    expect(useGameStore.getState().actionHistory).toHaveLength(1)

    // Undo #2: removes (0,0)
    useGameStore.getState().undo()
    expect(useGameStore.getState().queens).toHaveLength(0)
    expect(useGameStore.getState().actionHistory).toHaveLength(0)
  })
})

// ─── T007: Manual-mark-batch undo ────────────────────────────────────────────

describe('undo - manual mark batch', () => {
  beforeEach(() => {
    resetStore()
  })

  it('undo after cycleCell empty→X removes the single mark', () => {
    // Cell (2,3) is empty; cycleCell → X mark
    useGameStore.getState().cycleCell({ row: 2, col: 3 })
    expect(useGameStore.getState().manualMarks).toContain('2:3' as CellKey)
    expect(useGameStore.getState().actionHistory).toHaveLength(1)

    useGameStore.getState().undo()
    expect(useGameStore.getState().manualMarks).not.toContain('2:3' as CellKey)
    expect(useGameStore.getState().actionHistory).toHaveLength(0)
  })

  it('undo after drag batch removes all marks placed in that batch', () => {
    useGameStore.getState().startMarkBatch()
    useGameStore.getState().addManualMark({ row: 0, col: 0 })
    useGameStore.getState().addManualMark({ row: 0, col: 1 })
    useGameStore.getState().addManualMark({ row: 0, col: 2 })
    useGameStore.getState().commitMarkBatch()

    const { manualMarks, actionHistory } = useGameStore.getState()
    expect(manualMarks).toHaveLength(3)
    expect(actionHistory).toHaveLength(1)
    expect(actionHistory[0].type).toBe('mark-batch')

    useGameStore.getState().undo()
    expect(useGameStore.getState().manualMarks).toHaveLength(0)
    expect(useGameStore.getState().actionHistory).toHaveLength(0)
  })

  it('startMarkBatch resets isBatching and batchBuffer', () => {
    useGameStore.setState({ isBatching: true, batchBuffer: ['0:0' as CellKey] })
    useGameStore.getState().startMarkBatch()
    expect(useGameStore.getState().isBatching).toBe(true)
    expect(useGameStore.getState().batchBuffer).toHaveLength(0)
  })

  it('addManualMark appends to batchBuffer when isBatching is true', () => {
    useGameStore.getState().startMarkBatch()
    useGameStore.getState().addManualMark({ row: 1, col: 1 })
    expect(useGameStore.getState().batchBuffer).toContain('1:1' as CellKey)
  })

  it('addManualMark does not append to batchBuffer when isBatching is false', () => {
    useGameStore.setState({ isBatching: false })
    useGameStore.getState().addManualMark({ row: 1, col: 1 })
    expect(useGameStore.getState().batchBuffer).toHaveLength(0)
  })
})
