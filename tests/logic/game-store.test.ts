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
