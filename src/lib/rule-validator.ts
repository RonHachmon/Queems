import type { CellCoord, Queen, Stage, ConflictMap } from '@/types'

/** Returns true if placing a queen at `candidate` would violate any rule. */
export function wouldConflict(
  candidate: CellCoord,
  existingQueens: Queen[],
  stage: Stage,
): boolean {
  const candidateRegion = stage.grid[candidate.row][candidate.col]

  for (const queen of existingQueens) {
    const sameRow = candidate.row === queen.row
    const sameCol = candidate.col === queen.col
    const adjacent =
      Math.abs(candidate.row - queen.row) <= 1 &&
      Math.abs(candidate.col - queen.col) <= 1
    const sameRegion = stage.grid[queen.row][queen.col] === candidateRegion

    if (sameRow || sameCol || adjacent || sameRegion) return true
  }
  return false
}

/**
 * Returns a Map keyed by "row:col" for every queen involved in at least one
 * rule violation. Always derived from state — never stored.
 */
export function deriveConflicts(queens: Queen[], stage: Stage): ConflictMap {
  const conflicts: ConflictMap = new Map()

  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const a = queens[i]
      const b = queens[j]

      const sameRow = a.row === b.row
      const sameCol = a.col === b.col
      const adjacent =
        Math.abs(a.row - b.row) <= 1 && Math.abs(a.col - b.col) <= 1
      const sameRegion = stage.grid[a.row][a.col] === stage.grid[b.row][b.col]

      if (sameRow || sameCol || adjacent || sameRegion) {
        conflicts.set(`${a.row}:${a.col}`, true)
        conflicts.set(`${b.row}:${b.col}`, true)
      }
    }
  }

  return conflicts
}
