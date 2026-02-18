# Quickstart: Click-and-Drag X Marking (003-drag-mark-x)

## Prerequisites

```bash
# From repo root — install dependencies if not already done
pnpm install
```

## Running the Dev Server

```bash
pnpm dev
# → http://localhost:5173
```

Navigate to any puzzle stage (e.g., `/stage/lvl-01`) and use the grid to test.

## Manual Testing Checklist

### Core drag behaviour (FR-001 / FR-002)

1. Open any puzzle stage.
2. Press and **hold** the left mouse button on an empty cell.
3. Without releasing, move the cursor across several other empty cells.
4. Verify each cell shows an X as the cursor enters it.
5. Release the mouse button — confirm no further cells change.

### Non-empty cells unaffected (FR-003 / FR-004)

1. Place a queen on one cell (click it twice).
2. Manually X-mark another cell (single click).
3. Drag across both — confirm neither changes; only empty cells in the path get X marks.

### Click cycle preserved (FR-007)

1. Click a single empty cell **without moving** → cycles to X.
2. Click the X cell without moving → cycles to queen.
3. Click the queen without moving → cycles to empty.
4. Verify all three transitions work exactly as before.

### Return-to-origin edge case (spec edge case / research Decision 3)

1. Press on empty cell A, drag to empty cell B, drag back to A, release on A.
2. Verify: A and B are both marked with X; no click cycle fires; A does not advance to queen.

### Drag session persists outside grid (FR-008)

1. Press on a cell, drag off the grid (outside the board), re-enter the grid.
2. Verify marking continues on empty cells after re-entry.

### Disabled state (puzzle solved)

1. Solve any puzzle (or trigger `isSolved` via dev tools).
2. Verify that holding and dragging across the board marks nothing.

## Running Tests

```bash
# All tests
pnpm vitest

# Watch mode during TDD
pnpm vitest --watch

# Only drag-related tests
pnpm vitest game-store
```

## TDD Order (per Constitution Principle IV)

The **only** game-logic module introduced by this feature is the `addManualMark` action.
Follow this order strictly:

1. Write failing tests in `tests/logic/game-store.test.ts` — confirm RED.
2. Implement `addManualMark` in `src/stores/game-store.ts` — confirm GREEN.
3. Implement `useDragMark` hook and wire up components.

## Key Files

| File | Role |
|------|------|
| `src/hooks/useDragMark.ts` | New hook — drag session management |
| `src/stores/game-store.ts` | Add `addManualMark` action |
| `src/components/Board/Cell.tsx` | Add `onMouseDown` / `onMouseEnter` props |
| `src/components/Board/Board.tsx` | Forward drag handlers to each Cell |
| `src/pages/PuzzlePage.tsx` | Instantiate hook; wire to Board |
| `tests/logic/game-store.test.ts` | New TDD test file for `addManualMark` |

## Architecture Summary

```
PuzzlePage
  └── useDragMark({ onMarkCell: addManualMark, disabled: isSolved })
        │  returns { dragHandlers, isDragGesture }
        │
        ├── Board
        │     onCellMouseDown  → dragHandlers.onCellMouseDown
        │     onCellMouseEnter → dragHandlers.onCellMouseEnter
        │     onCellClick      → coord => {
        │                          if (isDragGesture()) return   ← suppress cycle after drag
        │                          cycleCell(coord)              ← normal click
        │                        }
        │
        └── Cell (per cell)
              onMouseDown  → () => onCellMouseDown(coord)
              onMouseEnter → () => onCellMouseEnter(coord)
              onClick      → () => onCellClick(coord)
```
