# Data Model: Click-and-Drag X Marking

**Feature**: `003-drag-mark-x` | **Date**: 2026-02-18

## Overview

This feature introduces no new persisted data and no new Zustand state fields. All drag
session state is ephemeral, held in mutable refs inside the `useDragMark` hook. The only
store change is a new action `addManualMark` that writes to the existing `manualMarks`
field — a field already present and persisted only for the duration of the game session.

---

## Existing Store Fields Used (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `manualMarks` | `CellKey[]` | X marks placed by the player; drag marks are appended here |
| `queens` | `Queen[]` | Placed queens; read by `addManualMark` to check emptiness |
| `autoMarksByQueen` | `Record<string, CellKey[]>` | Auto-marks; read by `addManualMark` to check emptiness |

`addManualMark` reads all three to determine whether a cell is empty before appending to
`manualMarks`. No other store fields are read or written by the drag feature.

---

## New Store Action

### `addManualMark(coord: CellCoord): void`

**Purpose**: Mark a single cell with X if and only if it is currently empty.

**Pre-conditions**:
- The cell at `coord` has no queen (`queens` array does not contain `coord`).
- The cell's `CellKey` is not already in `manualMarks`.
- The cell's `CellKey` is not in any value array of `autoMarksByQueen`.

**Post-conditions**:
- If all pre-conditions hold: `manualMarks` gains one new entry equal to `toCellKey(coord)`.
- If any pre-condition fails: store state is unchanged (idempotent / no-op).

**Side effects**: None. Does not trigger auto-mark logic, does not check win condition.

---

## Ephemeral Drag Session State

All fields below live as `useRef` values inside `useDragMark`. They are never rendered
and never cause re-renders.

| Ref | Type | Initialised | Description |
|-----|------|-------------|-------------|
| `isDragging` | `boolean` | `false` | True while the mouse button is held down on the grid |
| `startCoord` | `CellCoord \| null` | `null` | The cell where `mousedown` fired |
| `startMarked` | `boolean` | `false` | Whether the starting cell has already been marked during this session |
| `didDrag` | `boolean` | `false` | Whether the cursor entered a cell different from `startCoord` |
| `visitedCells` | `Set<CellKey>` | `new Set()` | All cell keys visited (and skipped or marked) during the current session |

### Session Lifecycle

```
mousedown(coord A)
  → isDragging = true
  → startCoord = A
  → startMarked = false
  → didDrag = false
  → visitedCells = new Set()

mouseenter(coord B) [while isDragging, B ≠ A]
  → if !startMarked:
      addManualMark(A)  [if A is empty]
      visitedCells.add(A)
      startMarked = true
      didDrag = true
  → if B not in visitedCells:
      addManualMark(B)  [if B is empty]
      visitedCells.add(B)

mouseenter(coord A again) [while isDragging, A already in visitedCells]
  → skip (already visited)

window mouseup
  → isDragging = false
  → [didDrag flag retained until onClick resolves, then reset]

onClick(coord A) [fires only if mousedown and mouseup were both on A]
  → if didDrag: suppress cycleCell (return early)
  → else: call cycleCell(A) [normal click behaviour]
  → reset all refs
```

---

## State Ownership Summary

| State | Owner | Lifetime |
|-------|-------|----------|
| `isDragging` | `useDragMark` ref | Single drag gesture |
| `startCoord` | `useDragMark` ref | Single drag gesture |
| `startMarked` | `useDragMark` ref | Single drag gesture |
| `didDrag` | `useDragMark` ref | Single drag gesture + until onClick resolves |
| `visitedCells` | `useDragMark` ref | Single drag gesture |
| `manualMarks` | `game-store` (Zustand) | Full puzzle session |

---

## No New Entities

The drag feature adds no new data entities, no new localStorage keys, and no new
data contracts between components beyond the two new event-handler props on `Cell`.
