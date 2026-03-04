# Research: Undo Action and Bottom Controls

**Branch**: `007-undo-action` | **Date**: 2026-03-04

---

## Decision 1: Undo History Data Structure

**Decision**: Use an append-only array acting as a stack (last-in, first-out) stored in the Zustand game store. Each element is a typed "action delta" union: `mark-batch`, `queen-placed`, or `queen-removed`.

**Rationale**:
- The game store already owns all mutable board state (`queens`, `manualMarks`, `autoMarksByQueen`). Co-locating the history there avoids out-of-sync bugs and keeps a single source of truth.
- A stack with typed deltas stores only the diff (not a full board snapshot), keeping memory usage proportional to the number of moves rather than O(moves × board-size²).
- Zustand's `set` function is synchronous, making the append-and-pop operations atomic within a single render cycle.

**Alternatives considered**:
- *Full snapshot stack* — stores the entire board state before each move. Simpler undo logic, but wastes memory for large boards and large histories. Rejected (YAGNI).
- *Separate undo store* — a dedicated Zustand slice for history. Introduces cross-store coupling and duplicates board-state reading. Rejected.
- *Command pattern object* — heavyweight OOP approach with `execute`/`undo` methods. Overkill for a bounded set of three action types. Rejected.

---

## Decision 2: Drag-Batch Grouping Strategy

**Decision**: Add optional `onBatchStart` and `onBatchCommit` callbacks to `useDragMark`. On `mousedown`, `onBatchStart()` sets an in-progress flag in the store and clears a scratch buffer. Every `addManualMark` call during the drag also appends to the scratch buffer. On `mouseup`, `onBatchCommit()` creates a single `mark-batch` history entry from the scratch buffer and clears it.

**Rationale**:
- Cells must appear marked immediately as the cursor moves (live visual feedback). Deferring all marks to `mouseup` would break this.
- Grouping at commit time is the minimal change: `useDragMark` gains two optional callbacks; `addManualMark` gains one side-effect (buffer append when batching is active); `commitMarkBatch` creates the history entry.
- Single-click mark paths still work: `cycleCell` (empty → X) creates its own `mark-batch[1]` history entry; `commitMarkBatch` becomes a no-op because the scratch buffer is empty (drag never happened).

**Alternatives considered**:
- *Batch at mouseup only* — replace all live `addManualMark` calls with a single `addManualMarkBatch(coords[])` on mouseup. Loses live visual feedback during drag. Rejected.
- *Post-process history on mouseup* — merge all individual `mark-batch[1]` entries added during the drag into one. Requires identifying which history entries belong to "this drag session." Complex and fragile. Rejected.

---

## Decision 3: Queen Cycle Transitions in History

**Decision**: All three `cycleCell` transitions are recorded in the action history:

| Transition | History Entry |
|---|---|
| empty → X-marked | `{ type: 'mark-batch', keys: [cellKey] }` |
| X-marked → queen | `{ type: 'queen-placed', queen, queenKey, autoMarks, priorMark: cellKey }` |
| queen → empty | `{ type: 'queen-removed', queen, queenKey, autoMarks }` |

**Rationale**:
- The spec explicitly states: "Removing a queen by clicking it is itself an undoable action; pressing Undo re-places the queen."
- Storing auto-marks in the `queen-removed` entry allows exact restoration without recomputation (important because other queens may have been added/removed since, changing what `computeInvalidationSet` would return).
- `priorMark` in `queen-placed` stores the cell key that was X-marked before the queen was placed (the X → queen path). Undo of this entry must restore the X mark to match the pre-placement state.

**Alternatives considered**:
- *Only track queen placements, not removals* — means undoing a user-removed queen is impossible. Doesn't match spec requirements. Rejected.
- *Recompute auto-marks on undo rather than storing them* — cheaper storage, but produces wrong results if board state has changed since original placement. Rejected.

---

## Decision 4: Reset Button Relocation

**Decision**: Remove the `<button>` for Reset from the header section in `PuzzlePage.tsx` and add it to a new "bottom controls" row below the board, alongside the Undo button. No new component file is introduced; the JSX goes directly in `PuzzlePage.tsx`.

**Rationale**:
- The buttons are specific to `PuzzlePage` and are not reused elsewhere. Per Principle V (YAGNI), an abstraction is only warranted when three or more concrete uses exist.
- Moving Reset to the bottom groups it visually with Undo (both are "undo-like" recovery actions) and is consistent with the spec requirement for co-located bottom controls.

**Alternatives considered**:
- *New `BottomControls.tsx` component* — adds a file for a one-off use case. Rejected per YAGNI.
- *Keep Reset in header and add Undo in header too* — contradicts the spec, which explicitly requires both buttons at the bottom. Rejected.

---

## Decision 5: Disabled State When History is Empty or Puzzle Solved

**Decision**: The Undo button is disabled when `actionHistory.length === 0` or `isSolved === true`. Both Undo and Reset are disabled when `isSolved === true`. The `disabled` prop styling follows the existing `text-gray-500 hover:text-gray-800` pattern, with `opacity-50 cursor-not-allowed` added when disabled.

**Rationale**: Consistent with the existing `Board` disabled pattern and `CompletionModal` which blocks all board interactions after solve.

---

## Decision 6: History Cleared on Load and Reset

**Decision**: `loadStage` and `restart` both clear `actionHistory` and reset `isBatching`/`batchBuffer` to their initial values.

**Rationale**: History is session-scoped (per spec Assumptions). A new stage or a reset starts a fresh session with no prior moves to undo.

---

## No NEEDS CLARIFICATION items

All unknowns were resolvable from reading the existing codebase (`game-store.ts`, `useDragMark.ts`, `PuzzlePage.tsx`, `types/index.ts`). No external research required.
