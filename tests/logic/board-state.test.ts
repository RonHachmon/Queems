import { describe, it, expect } from 'vitest'
import { toggleQueen, isSolved } from '@/lib/board-state'
import type { Stage, Queen, CellCoord } from '@/types'

// ─── Minimal 5×5 test stage ──────────────────────────────────────────────────
const testStage: Stage = {
  id: 'test',
  number: 0,
  label: 'Test',
  size: 5,
  grid: [
    ['A', 'A', 'B', 'B', 'B'],
    ['A', 'A', 'B', 'B', 'C'],
    ['D', 'D', 'B', 'C', 'C'],
    ['D', 'D', 'D', 'C', 'E'],
    ['D', 'E', 'E', 'E', 'E'],
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
