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
