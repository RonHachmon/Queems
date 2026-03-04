import { useRef, useEffect } from 'react'
import type { CellCoord, CellKey } from '@/types'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface UseDragMarkOptions {
  /**
   * Action called to mark a cell with X. Must be idempotent and a no-op for
   * non-empty cells (e.g. the `addManualMark` store action).
   */
  onMarkCell: (coord: CellCoord) => void
  /** When true the drag session will not start (board is disabled / solved). */
  disabled: boolean
  /** Called on mousedown to signal the start of a potential drag batch. */
  onBatchStart?: () => void
  /** Called on mouseup/touchend to commit the completed drag batch. */
  onBatchCommit?: () => void
}

export interface DragHandlers {
  /** Attach to each cell's onMouseDown via Board. */
  onCellMouseDown: (coord: CellCoord) => void
  /** Attach to each cell's onMouseEnter via Board. */
  onCellMouseEnter: (coord: CellCoord) => void
}

export interface UseDragMarkReturn {
  dragHandlers: DragHandlers
  /**
   * Returns true if the most recent (or in-progress) mouse-button press was
   * classified as a drag gesture — i.e. the cursor entered at least one cell
   * other than the starting cell while the button was held.
   *
   * Call this inside onCellClick to suppress cycleCell after a drag.
   * The flag resets automatically when the next mousedown begins.
   */
  isDragGesture: () => boolean
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function toCellKey(coord: CellCoord): CellKey {
  return `${coord.row}:${coord.col}`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages a click-and-drag X-marking session.
 *
 * While the primary mouse button is held and the cursor moves to a new grid
 * cell, every empty cell the cursor passes through is immediately marked with X
 * via `onMarkCell`. Releasing the button ends the session.
 *
 * A gesture is classified as a DRAG (not a click) when the cursor enters at
 * least one cell different from the cell where mousedown fired. Use
 * `isDragGesture()` to suppress the three-state click cycle in that case.
 */
export function useDragMark({ onMarkCell, disabled, onBatchStart, onBatchCommit }: UseDragMarkOptions): UseDragMarkReturn {
  // ── Session refs (never cause re-renders) ──────────────────────────────────
  const isDragging = useRef(false)
  const startCoord = useRef<CellCoord | null>(null)
  const startMarked = useRef(false)   // whether the starting cell was already marked this session
  const didDrag = useRef(false)       // whether the cursor entered a different cell during this press
  const visitedCells = useRef<Set<CellKey>>(new Set())

  // ── Global mouseup/touchend: end session when button/finger released anywhere ─
  useEffect(() => {
    const endSession = () => {
      isDragging.current = false
      onBatchCommit?.()
    }
    window.addEventListener('mouseup', endSession)
    window.addEventListener('touchend', endSession)
    return () => {
      window.removeEventListener('mouseup', endSession)
      window.removeEventListener('touchend', endSession)
    }
  }, [onBatchCommit])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function onCellMouseDown(coord: CellCoord) {
    if (disabled) return
    onBatchStart?.()
    isDragging.current = true
    startCoord.current = coord
    startMarked.current = false
    didDrag.current = false
    visitedCells.current = new Set()
  }

  function onCellMouseEnter(coord: CellCoord) {
    if (!isDragging.current || startCoord.current === null) return

    const coordKey = toCellKey(coord)
    const startKey = toCellKey(startCoord.current)

    // Skip cells already processed during this session
    if (visitedCells.current.has(coordKey)) return

    // First time the cursor enters a cell different from the starting cell
    if (coordKey !== startKey && !didDrag.current) {
      didDrag.current = true

      // Retroactively mark the starting cell (it was "under the cursor" when the
      // button was pressed). addManualMark is a no-op if the cell is non-empty.
      if (!startMarked.current) {
        onMarkCell(startCoord.current)
        visitedCells.current.add(startKey)
        startMarked.current = true
      }
    }

    // Only mark in drag mode (cursor has left the starting cell at least once)
    if (didDrag.current) {
      onMarkCell(coord)
      visitedCells.current.add(coordKey)
    }
  }

  function isDragGesture(): boolean {
    return didDrag.current
  }

  return {
    dragHandlers: { onCellMouseDown, onCellMouseEnter },
    isDragGesture,
  }
}
