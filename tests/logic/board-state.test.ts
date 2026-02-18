import { describe, it, expect } from 'vitest'
import { toggleQueen, isSolved, computeInvalidationSet } from '@/lib/board-state'
import type { Stage, Queen, CellCoord } from '@/types'

// ─── Minimal 5×5 test stage ──────────────────────────────────────────────────
const testStage: Stage = {
  id: 'test',
  number: 0,
  label: 'Test',
  size: 5,
  grid: [
    ['blue', 'blue', 'green', 'green', 'green'],
    ['blue', 'blue', 'green', 'green', 'red'],
    ['purple', 'purple', 'green', 'red', 'red'],
    ['purple', 'purple', 'purple', 'red', 'yellow'],
    ['purple', 'yellow', 'yellow', 'yellow', 'yellow'],
  ],
}

const at = (row: number, col: number): CellCoord => ({ row, col })

// Valid 5-queen solution for testStage (distinct rows, cols, regions, no adjacency)
const validSolution: Queen[] = [at(0, 0), at(1, 2), at(2, 4), at(3, 1), at(4, 3)]

describe('toggleQueen', () => {
  it('adds a queen to an empty board', () => {
    const result = toggleQueen([], at(2, 3))
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ row: 2, col: 3 })
  })

  it('adds a queen to a board that already has queens', () => {
    const existing: Queen[] = [at(0, 0), at(1, 2)]
    const result = toggleQueen(existing, at(3, 4))
    expect(result).toHaveLength(3)
    expect(result).toContainEqual({ row: 3, col: 4 })
  })

  it('removes a queen when toggling an occupied cell', () => {
    const queens: Queen[] = [at(0, 0), at(2, 3), at(4, 1)]
    const result = toggleQueen(queens, at(2, 3))
    expect(result).toHaveLength(2)
    expect(result).not.toContainEqual({ row: 2, col: 3 })
    expect(result).toContainEqual({ row: 0, col: 0 })
    expect(result).toContainEqual({ row: 4, col: 1 })
  })

  it('removes the only queen from a single-queen board', () => {
    const queens: Queen[] = [at(1, 1)]
    const result = toggleQueen(queens, at(1, 1))
    expect(result).toHaveLength(0)
  })

  it('does not mutate the original array (pure function)', () => {
    const original: Queen[] = [at(0, 0)]
    const originalLength = original.length
    toggleQueen(original, at(1, 1)) // add
    toggleQueen(original, at(0, 0)) // remove
    expect(original).toHaveLength(originalLength)
  })
})

describe('isSolved', () => {
  it('returns false when no queens are placed', () => {
    expect(isSolved([], testStage)).toBe(false)
  })

  it('returns false when fewer than N queens are placed', () => {
    expect(isSolved([at(0, 0), at(1, 2), at(2, 4)], testStage)).toBe(false)
  })

  it('returns false when exactly N queens but with conflicts', () => {
    // 5 queens but two share a row → conflict
    const conflicting: Queen[] = [at(0, 0), at(0, 2), at(1, 4), at(3, 1), at(4, 3)]
    expect(isSolved(conflicting, testStage)).toBe(false)
  })

  it('returns false when N queens placed but same-column conflict', () => {
    // col 0 appears twice: (0,0) and (2,0)
    const conflicting: Queen[] = [at(0, 0), at(1, 2), at(2, 0), at(3, 3), at(4, 4)]
    expect(isSolved(conflicting, testStage)).toBe(false)
  })

  it('returns false when N queens placed but same-region conflict', () => {
    // (0,0) and (1,1) are both in region A
    const conflicting: Queen[] = [at(0, 0), at(1, 1), at(2, 4), at(3, 2), at(4, 3)]
    expect(isSolved(conflicting, testStage)).toBe(false)
  })

  it('returns true for the valid 5-queen solution', () => {
    expect(isSolved(validSolution, testStage)).toBe(true)
  })

  it('returns false when more than N queens are placed', () => {
    // 6 queens on a 5×5 board must have duplicates or conflicts
    const tooMany: Queen[] = [...validSolution, at(2, 1)]
    expect(isSolved(tooMany, testStage)).toBe(false)
  })
})

// ─── computeInvalidationSet ───────────────────────────────────────────────────

describe('computeInvalidationSet', () => {
  // Queen placed at (2,2) — middle of the 5×5 testStage
  // Region at (2,2) is 'B'
  const queenAt = at(2, 2)

  it('excludes the queen own cell from the result', () => {
    const result = computeInvalidationSet(queenAt, testStage)
    const hasOwn = result.some((c) => c.row === 2 && c.col === 2)
    expect(hasOwn).toBe(false)
  })

  it('includes all cells in the same row', () => {
    const result = computeInvalidationSet(queenAt, testStage)
    // Row 2: cols 0,1,3,4 should all be present
    for (const col of [0, 1, 3, 4]) {
      expect(result.some((c) => c.row === 2 && c.col === col)).toBe(true)
    }
  })

  it('includes all cells in the same column', () => {
    const result = computeInvalidationSet(queenAt, testStage)
    // Col 2: rows 0,1,3,4 should all be present
    for (const row of [0, 1, 3, 4]) {
      expect(result.some((c) => c.row === row && c.col === 2)).toBe(true)
    }
  })

  it('includes all 8 adjacent cells', () => {
    const result = computeInvalidationSet(queenAt, testStage)
    // Adjacent to (2,2): (1,1),(1,2),(1,3),(2,1),(2,3),(3,1),(3,2),(3,3)
    const adjacentCells = [
      { row: 1, col: 1 }, { row: 1, col: 3 },
      { row: 3, col: 1 }, { row: 3, col: 3 },
    ]
    for (const cell of adjacentCells) {
      expect(result.some((c) => c.row === cell.row && c.col === cell.col)).toBe(true)
    }
  })

  it('includes all cells in the same colored region', () => {
    // testStage: region at (2,2) is grid[2][2] = 'B'
    // 'B' cells: (0,2),(0,3),(0,4),(1,2),(1,3),(2,2),(2,3) — excluding (2,2) itself
    const result = computeInvalidationSet(queenAt, testStage)
    const regionBCells = [
      { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 },
      { row: 1, col: 2 }, { row: 1, col: 3 },
      { row: 2, col: 3 },
    ]
    for (const cell of regionBCells) {
      expect(result.some((c) => c.row === cell.row && c.col === cell.col)).toBe(true)
    }
  })

  it('deduplicates cells that match multiple conditions', () => {
    // (1,2) is same-col AND adjacent to (2,2) AND same region 'B'
    // It should appear exactly once in the result
    const result = computeInvalidationSet(queenAt, testStage)
    const count = result.filter((c) => c.row === 1 && c.col === 2).length
    expect(count).toBe(1)
  })

  it('returns only board-valid cells (no out-of-bounds)', () => {
    // Queen at corner (0,0) — adjacent cells that are off-board must not appear
    const cornerQueen = at(0, 0)
    const result = computeInvalidationSet(cornerQueen, testStage)
    for (const cell of result) {
      expect(cell.row).toBeGreaterThanOrEqual(0)
      expect(cell.row).toBeLessThan(testStage.size)
      expect(cell.col).toBeGreaterThanOrEqual(0)
      expect(cell.col).toBeLessThan(testStage.size)
    }
  })

  it('is a pure function — does not mutate inputs', () => {
    const queens = [at(0, 0)]
    const stageCopy = JSON.parse(JSON.stringify(testStage)) as Stage
    computeInvalidationSet(at(2, 2), testStage)
    // Stage should be unchanged
    expect(testStage.grid).toEqual(stageCopy.grid)
    expect(queens).toHaveLength(1)
  })
})
