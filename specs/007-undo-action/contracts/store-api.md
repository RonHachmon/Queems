# Store API Contract: Undo Action

**Branch**: `007-undo-action` | **Date**: 2026-03-04

This document defines the complete internal API contract for the undo feature — the Zustand store actions, the hook interface change, and observable state shape. All implementation MUST conform to this contract.

---

## `useGameStore` — New State Fields

```typescript
// Appended to GameSession in src/types/index.ts

actionHistory: UndoAction[]   // default: []
isBatching: boolean           // default: false
batchBuffer: CellKey[]        // default: []
```

---

## `useGameStore` — New Actions

### `undo(): void`

Reverses the most recent action in `actionHistory`.

**Pre-conditions**:
- `actionHistory.length > 0` (caller should check; no-op if empty)
- `isSolved === false` (caller should check; no-op if solved)

**Post-conditions by action type**:

| `type` | State changes |
|---|---|
| `mark-batch` | `manualMarks` has all `keys` removed |
| `queen-placed` | `queens` has `queen` removed; `autoMarksByQueen[queenKey]` deleted; if `priorMark !== null`, `priorMark` added back to `manualMarks`; `isSolved` recomputed |
| `queen-removed` | `queen` added back to `queens`; `autoMarksByQueen[queenKey]` restored to `autoMarks`; `isSolved` recomputed |

**Always**: pops (removes) the last entry from `actionHistory`.

---

### `startMarkBatch(): void`

Called at the start of a drag gesture (mousedown).

**Post-conditions**:
- `isBatching = true`
- `batchBuffer = []`

---

### `commitMarkBatch(): void`

Called at the end of a drag gesture (mouseup).

**Post-conditions**:
- If `batchBuffer.length > 0`: `actionHistory` gets `{ type: 'mark-batch', keys: [...batchBuffer] }` appended
- If `batchBuffer.length === 0`: no history entry created (no-op for single-click paths)
- `isBatching = false`
- `batchBuffer = []`

---

## `cycleCell(coord)` — Modified Behavior

The existing `cycleCell` action is updated to record history entries. All existing behavior is preserved; only the history side-effect is added.

| Transition | History entry appended |
|---|---|
| empty → X-marked | `{ type: 'mark-batch', keys: [key] }` |
| X-marked → queen | `{ type: 'queen-placed', queen, queenKey, autoMarks, priorMark: key }` |
| queen → empty | `{ type: 'queen-removed', queen, queenKey, autoMarks: prev[queenKey] ?? [] }` |

---

## `addManualMark(coord)` — Modified Behavior

When `isBatching === true`, appends the cell key to `batchBuffer` in addition to adding it to `manualMarks`. All existing no-op guards remain unchanged.

---

## `loadStage` and `restart` — Modified Behavior

Both actions reset undo state:
```
actionHistory: []
isBatching: false
batchBuffer: []
```

---

## `useDragMark` Hook — Extended Options

```typescript
interface UseDragMarkOptions {
  onMarkCell: (coord: CellCoord) => void   // unchanged
  onBatchStart?: () => void                 // NEW: called on mousedown
  onBatchCommit?: () => void                // NEW: called on mouseup / touchend
  disabled: boolean                         // unchanged
}
```

**Behavior**:
- `onBatchStart?.()` is called inside `onCellMouseDown`, immediately before the existing session-start logic.
- `onBatchCommit?.()` is called inside the `endSession` handler (which runs on `mouseup` / `touchend`), after `isDragging.current = false`.

---

## `PuzzlePage` — Bottom Controls Layout

```
[Board]
[BottomControlsRow]
  ┌─────────────────────────────┐
  │  [Undo]          [Reset]   │
  └─────────────────────────────┘
[Hint text]
[Aria-live region]
[CompletionModal]
```

**Undo button**:
- Label: "Undo"
- Icon: `Undo2` from `lucide-react`
- Disabled: `actionHistory.length === 0 || isSolved`
- aria-label: `"Undo last action"`

**Reset button** (moved from header):
- Label: "Reset"
- Icon: `RotateCcw` from `lucide-react` (unchanged)
- Disabled: `isSolved`
- aria-label: `"Restart puzzle"` (unchanged)

**Header** (after change):
- Left: Back/Menu button (unchanged)
- Center: Stage title (unchanged)
- Right: *(empty — Reset button removed)*

---

## Test Contracts (`tests/logic/game-store.test.ts`)

The following behaviors MUST have test coverage (TDD — tests written RED before implementation):

1. `undo()` after `cycleCell` empty→X removes the mark
2. `undo()` after `cycleCell` X→queen removes queen, restores X mark, removes auto-marks
3. `undo()` after `cycleCell` queen→empty re-places queen and restores auto-marks
4. `undo()` after drag batch (multiple `addManualMark` + `commitMarkBatch`) removes all marks in batch
5. `undo()` with empty history is a no-op (no state change, no error)
6. `undo()` when `isSolved` is `true` is a no-op
7. `commitMarkBatch()` with empty buffer adds no history entry
8. `loadStage` clears `actionHistory`
9. `restart` clears `actionHistory`
10. Chained undos correctly step back multiple actions one at a time
