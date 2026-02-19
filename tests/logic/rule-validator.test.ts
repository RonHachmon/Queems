import { describe, it, expect } from 'vitest'
import { wouldConflict, deriveConflicts } from '@/lib/rule-validator'
import type { Stage, Queen, CellCoord } from '@/types'

// ─── Minimal 5×5 test stage ──────────────────────────────────────────────────
const testStage: Stage = {
  id: 'test',
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

describe('wouldConflict', () => {
  it('returns false when no existing queens', () => {
    expect(wouldConflict(at(0, 0), [], testStage)).toBe(false)
  })

  it('detects same-row conflict', () => {
    const queens: Queen[] = [at(2, 3)]
    expect(wouldConflict(at(2, 0), queens, testStage)).toBe(true)
  })

  it('detects same-column conflict', () => {
    const queens: Queen[] = [at(1, 4)]
    expect(wouldConflict(at(3, 4), queens, testStage)).toBe(true)
  })

  it('detects diagonal adjacency (top-left)', () => {
    const queens: Queen[] = [at(2, 2)]
    expect(wouldConflict(at(1, 1), queens, testStage)).toBe(true)
  })

  it('detects diagonal adjacency (top-right)', () => {
    const queens: Queen[] = [at(2, 2)]
    expect(wouldConflict(at(1, 3), queens, testStage)).toBe(true)
  })

  it('detects diagonal adjacency (bottom-left)', () => {
    const queens: Queen[] = [at(2, 2)]
    expect(wouldConflict(at(3, 1), queens, testStage)).toBe(true)
  })

  it('detects diagonal adjacency (bottom-right)', () => {
    const queens: Queen[] = [at(2, 2)]
    expect(wouldConflict(at(3, 3), queens, testStage)).toBe(true)
  })

  it('detects orthogonal adjacency (left)', () => {
    const queens: Queen[] = [at(2, 2)]
    expect(wouldConflict(at(2, 1), queens, testStage)).toBe(true)
  })

  it('detects orthogonal adjacency (right)', () => {
    const queens: Queen[] = [at(2, 2)]
    expect(wouldConflict(at(2, 3), queens, testStage)).toBe(true)
  })

  it('detects same-region conflict', () => {
    // Both (0,0) and (0,1) are in region A
    const queens: Queen[] = [at(0, 0)]
    expect(wouldConflict(at(0, 1), queens, testStage)).toBe(true)
  })

  it('returns false when placement is valid (no rule violations)', () => {
    // (0,0) queen in A; (2,4) candidate in C — different row, col, not adjacent, different region
    const queens: Queen[] = [at(0, 0)]
    expect(wouldConflict(at(2, 4), queens, testStage)).toBe(false)
  })

  it('returns true when candidate matches existing queen exactly', () => {
    const queens: Queen[] = [at(1, 2)]
    expect(wouldConflict(at(1, 2), queens, testStage)).toBe(true)
  })

  it('detects multiple simultaneous rule violations', () => {
    // (2,2) shares region B with (0,2); also row conflict with (2,4)
    const queens: Queen[] = [at(0, 2), at(2, 4)]
    expect(wouldConflict(at(2, 2), queens, testStage)).toBe(true)
  })
})

describe('deriveConflicts', () => {
  it('returns empty map when no queens placed', () => {
    expect(deriveConflicts([], testStage).size).toBe(0)
  })

  it('returns empty map when single queen with no violations', () => {
    expect(deriveConflicts([at(0, 0)], testStage).size).toBe(0)
  })

  it('flags both queens when they share a row', () => {
    const conflicts = deriveConflicts([at(0, 0), at(0, 4)], testStage)
    expect(conflicts.has('0:0')).toBe(true)
    expect(conflicts.has('0:4')).toBe(true)
  })

  it('flags both queens when they share a column', () => {
    const conflicts = deriveConflicts([at(0, 2), at(3, 2)], testStage)
    expect(conflicts.has('0:2')).toBe(true)
    expect(conflicts.has('3:2')).toBe(true)
  })

  it('flags both queens when they are adjacent', () => {
    const conflicts = deriveConflicts([at(1, 1), at(2, 2)], testStage)
    expect(conflicts.has('1:1')).toBe(true)
    expect(conflicts.has('2:2')).toBe(true)
  })

  it('flags both queens when they share a region', () => {
    // (0,0) and (1,1) both in region A
    const conflicts = deriveConflicts([at(0, 0), at(1, 1)], testStage)
    expect(conflicts.has('0:0')).toBe(true)
    expect(conflicts.has('1:1')).toBe(true)
  })

  it('does not flag valid placements', () => {
    // Solution queens for testStage: A(0,0) B(1,2) C(2,4) D(3,1) E(4,3)
    const validQueens: Queen[] = [at(0, 0), at(1, 2), at(2, 4), at(3, 1), at(4, 3)]
    expect(deriveConflicts(validQueens, testStage).size).toBe(0)
  })
})
