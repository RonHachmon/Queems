// ─── 002-mark-cells: TypeScript Contracts ─────────────────────────────────────
// This file defines the new and modified interfaces for the cell X-marking feature.
// These are contracts only — not runnable code.

import type { CellCoord, CellKey, Stage, Queen } from '@/types'

// ─── New types ────────────────────────────────────────────────────────────────

/**
 * The three possible visual states of a cell after this feature is implemented.
 * Derived at render time — never stored directly.
 */
export type CellState = 'empty' | 'marked' | 'queen'

// ─── Pure function contract ───────────────────────────────────────────────────

/**
 * Returns every cell that would be invalidated by placing a queen at `queen`.
 * Includes cells sharing the same row, column, any of the 8 adjacent squares,
 * or the same colored region.  The queen's own cell is EXCLUDED.
 *
 * Must be a pure function with no side effects (lib/board-state.ts).
 */
export type ComputeInvalidationSetFn = (
  queen: CellCoord,
  stage: Stage,
) => CellCoord[]

// ─── Extended GameSession state (additions) ───────────────────────────────────

/**
 * New fields added to GameSession in src/types/index.ts
 */
export interface MarkingSessionFields {
  /** Cells manually marked by the player (cycle step: empty → X) */
  manualMarks: CellKey[]

  /**
   * Maps each placed queen's CellKey to the list of cells it auto-marked.
   * Cleared per-queen when that queen is removed.
   */
  autoMarksByQueen: Record<string, CellKey[]>

  /** Whether the Auto-Mark toggle is currently on */
  autoMarkEnabled: boolean
}

// ─── Extended GameStoreState actions (additions) ──────────────────────────────

export interface MarkingStoreActions {
  /**
   * Three-state click handler replacing placeOrRemoveQueen:
   *   empty    → X-marked (add to manualMarks)
   *   X-marked → queen    (remove from manualMarks, add queen, apply auto-marks if enabled)
   *   queen    → empty    (remove queen and its autoMarksByQueen entry)
   */
  cycleCell: (coord: CellCoord) => void

  /**
   * Toggles the Auto-Mark feature.
   * Turning ON retroactively marks all cells invalidated by currently placed queens.
   * Turning OFF leaves existing marks unchanged; only stops future auto-marking.
   */
  toggleAutoMark: () => void
}

// ─── Updated component props ──────────────────────────────────────────────────

/**
 * Updated CellProps — adds isMarked.
 * Source: src/types/index.ts (CellProps interface)
 */
export interface UpdatedCellProps {
  coord: CellCoord
  regionId: string
  hasQueen: boolean
  isConflict: boolean
  isMarked: boolean        // NEW: true when cell displays an X mark
  onClick: () => void
  disabled: boolean
  borders: { right: boolean; bottom: boolean }
}

/**
 * Updated BoardProps — adds markedCells for the Board to pass isMarked to each Cell.
 * Source: src/types/index.ts (BoardProps interface)
 */
export interface UpdatedBoardProps {
  stage: Stage
  queens: Queen[]
  conflicts: Map<string, true>
  markedCells: Set<CellKey>  // NEW: derived set passed from PuzzlePage
  onCellClick: (coord: CellCoord) => void
  disabled: boolean
}

// ─── Derived value contract ───────────────────────────────────────────────────

/**
 * markedCells derivation (computed in PuzzlePage, passed to Board).
 * Union of manualMarks and all values in autoMarksByQueen.
 *
 * Analogous to how ConflictMap is derived from queens + stage.
 */
export type DeriveMarkedCellsFn = (
  manualMarks: CellKey[],
  autoMarksByQueen: Record<string, CellKey[]>,
) => Set<CellKey>
