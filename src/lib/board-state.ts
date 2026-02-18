import type { CellCoord, Queen, Stage } from '@/types'
import { deriveConflicts } from '@/lib/rule-validator'

/**
 * Pure function — returns a new array with the queen added (if coord is empty)
 * or removed (if coord is already occupied). Never mutates the input array.
 */
export function toggleQueen(queens: Queen[], coord: CellCoord): Queen[] {
  const exists = queens.some((q) => q.row === coord.row && q.col === coord.col)
  if (exists) {
    return queens.filter((q) => !(q.row === coord.row && q.col === coord.col))
  }
  return [...queens, { row: coord.row, col: coord.col }]
}

/**
 * Returns true when exactly N queens are placed (one per row and column)
 * and deriveConflicts reports zero violations.
 */
export function isSolved(queens: Queen[], stage: Stage): boolean {
  if (queens.length !== stage.size) return false
  return deriveConflicts(queens, stage).size === 0
}

/**
 * Pure function — returns all cells invalidated by placing a queen at `queen`.
 * A cell is invalidated when it shares the same row, column, any of the 8
 * adjacent cells (orthogonal + diagonal), or the same colored region.
 * The queen's own cell is excluded. Each invalidated cell appears exactly once.
 */
export function computeInvalidationSet(queen: CellCoord, stage: Stage): CellCoord[] {
  const { row: qr, col: qc } = queen
  const region = stage.grid[qr][qc]
  const seen = new Set<string>()
  const result: CellCoord[] = []

  for (let r = 0; r < stage.size; r++) {
    for (let c = 0; c < stage.size; c++) {
      if (r === qr && c === qc) continue // skip queen's own cell

      const sameRow = r === qr
      const sameCol = c === qc
      const adjacent = Math.abs(r - qr) <= 1 && Math.abs(c - qc) <= 1
      const sameRegion = stage.grid[r][c] === region

      if (sameRow || sameCol || adjacent || sameRegion) {
        const key = `${r}:${c}`
        if (!seen.has(key)) {
          seen.add(key)
          result.push({ row: r, col: c })
        }
      }
    }
  }

  return result
}
