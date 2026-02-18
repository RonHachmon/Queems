/**
 * TypeScript Interface Contracts: Click-and-Drag X Marking (003-drag-mark-x)
 *
 * These interfaces define the exact public API surface for all new and modified
 * modules introduced by this feature. Implementation files MUST honour these contracts.
 */

import type { CellCoord, CellKey } from '@/types'

// ---------------------------------------------------------------------------
// useDragMark hook
// ---------------------------------------------------------------------------

/**
 * Handlers returned by useDragMark to be spread onto Board props.
 * Board attaches these to each cell's mouse events.
 */
export interface DragHandlers {
  /**
   * Call when the primary mouse button is pressed on a cell.
   * Initialises a new drag session.
   */
  onCellMouseDown: (coord: CellCoord) => void

  /**
   * Call when the cursor enters a cell while the primary mouse button is held.
   * Marks the cell with X if it is empty and not yet visited this session.
   */
  onCellMouseEnter: (coord: CellCoord) => void
}

/**
 * Return value of the useDragMark hook.
 */
export interface UseDragMarkReturn {
  /** Spread these handlers onto Board's onCellMouseDown / onCellMouseEnter props. */
  dragHandlers: DragHandlers

  /**
   * Returns true if the current (or just-ended) interaction was classified as
   * a drag gesture — i.e., the cursor entered at least one cell different from
   * the starting cell while the button was held.
   *
   * Use this inside onCellClick to suppress cycleCell after a drag.
   */
  isDragGesture: () => boolean
}

/**
 * Parameters passed to useDragMark on each render.
 */
export interface UseDragMarkOptions {
  /**
   * Action to call when a cell should be marked with X.
   * The hook calls this only for empty cells; the action itself MUST also be idempotent.
   */
  onMarkCell: (coord: CellCoord) => void

  /**
   * Whether the board is disabled (puzzle solved). When true, the drag session
   * MUST NOT start and no cells are marked.
   */
  disabled: boolean
}

// ---------------------------------------------------------------------------
// game-store additions
// ---------------------------------------------------------------------------

/**
 * New action added to GameStoreState.
 * Marks the cell at coord with X only if it is currently empty
 * (no queen, no manual mark, no auto-mark).
 * Calling it on a non-empty cell is a no-op.
 */
export interface AddManualMarkAction {
  addManualMark: (coord: CellCoord) => void
}

// ---------------------------------------------------------------------------
// Cell component (updated props)
// ---------------------------------------------------------------------------

/**
 * New optional props added to the existing CellProps interface.
 * All existing props remain unchanged.
 */
export interface CellDragProps {
  /**
   * Called when the primary mouse button is pressed on this cell.
   * Optional — if omitted, no drag session is started from this cell.
   */
  onMouseDown?: () => void

  /**
   * Called when the cursor enters this cell.
   * Optional — if omitted, no drag marking occurs on hover.
   */
  onMouseEnter?: () => void
}

// ---------------------------------------------------------------------------
// Board component (updated props)
// ---------------------------------------------------------------------------

/**
 * New optional props added to the existing BoardProps interface.
 * All existing props remain unchanged.
 */
export interface BoardDragProps {
  /**
   * Called with the coord of the cell where mousedown fired.
   * Board passes this to each Cell's onMouseDown prop.
   * Optional — if omitted, drag marking is disabled on the board.
   */
  onCellMouseDown?: (coord: CellCoord) => void

  /**
   * Called with the coord of the cell the cursor entered while the button is held.
   * Board passes this to each Cell's onMouseEnter prop.
   * Optional — if omitted, drag marking is disabled on the board.
   */
  onCellMouseEnter?: (coord: CellCoord) => void
}

// ---------------------------------------------------------------------------
// Helper type (for reference — already exists in src/types/index.ts)
// ---------------------------------------------------------------------------

/**
 * CellKey is the string representation of a cell coordinate: "row:col".
 * Already defined in src/types/index.ts; repeated here for documentation.
 */
export type { CellKey, CellCoord }

/**
 * Internal type used by the useDragMark hook (not exported from the hook itself).
 * Captures all mutable refs needed across a single drag session.
 */
export interface DragSessionRefs {
  isDragging: boolean
  startCoord: CellCoord | null
  startMarked: boolean
  didDrag: boolean
  visitedCells: Set<CellKey>
}
