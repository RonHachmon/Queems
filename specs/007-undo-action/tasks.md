# Tasks: Undo Action and Bottom Controls

**Input**: Design documents from `/specs/007-undo-action/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/store-api.md ✅ quickstart.md ✅

**Tests**: Included — Constitution Principle IV mandates TDD for all game-logic modules. `game-store.ts` is a logic module; tests MUST be written RED before implementation.

**Organization**: Tasks are grouped by user story. US1 and US2 both modify `game-store.ts` and must be sequential. US3 modifies only `PuzzlePage.tsx` and depends on US1+US2 completing first.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no dependency conflict)
- **[Story]**: User story from spec.md (US1, US2, US3)

---

## Phase 1: Setup (Shared Type Definitions)

**Purpose**: Extend shared types that all implementation tasks depend on. Blocks every subsequent phase.

- [x] T001 Add `UndoAction` discriminated union type; extend `GameSession` with `actionHistory`, `isBatching`, `batchBuffer`; extend `GameStoreState` with `undo`, `startMarkBatch`, `commitMarkBatch` — `src/types/index.ts`

**Checkpoint**: Types compile. All downstream files referencing new interfaces will show type errors until implemented (expected).

---

## Phase 2: Foundational (Store Scaffold + Baseline Tests)

**Purpose**: Initialize undo state in the store and write RED baseline tests. Both can be done in parallel (different files).

⚠️ **CRITICAL**: Tests MUST fail (RED) before any implementation begins.

- [x] T002 Write RED tests for foundational undo behaviors: `undo()` no-op when history is empty; `undo()` no-op when `isSolved` is true; `loadStage` clears `actionHistory`; `restart` clears `actionHistory`; `commitMarkBatch()` with empty buffer creates no history entry — `tests/logic/game-store.test.ts`
- [x] T003 [P] Add `actionHistory: []`, `isBatching: false`, `batchBuffer: []` to initial store state; reset all three fields in `loadStage` and `restart` — `src/stores/game-store.ts`

**Checkpoint**: T002 tests fail (RED ✅). T003 compiles; `loadStage` and `restart` now reset history. Foundation ready.

---

## Phase 3: User Story 1 — Undo a Queen Placement (Priority: P1) 🎯 MVP

**Goal**: Players can undo a queen placement (and its auto-marks) or undo a queen removal, stepping back one action at a time.

**Independent Test**: Place a queen on any cell → verify auto-marks appear → press Undo → verify queen and all associated auto-marks are gone. Board matches pre-placement state exactly.

> ⚠️ **TDD**: Write T004 first. Confirm RED. Then implement T005 and T006.

- [x] T004 Write RED tests for queen-undo scenarios: (a) `undo()` after `cycleCell` X→queen removes queen, restores X mark, removes auto-marks; (b) `undo()` after `cycleCell` queen→empty re-places queen and restores auto-marks; (c) chained undos step back two queen actions correctly — `tests/logic/game-store.test.ts`
- [x] T005 [US1] In `cycleCell`: append `{ type: 'queen-removed', queen, queenKey, autoMarks: prev[queenKey] ?? [] }` to `actionHistory` in the `hasQueen` branch; append `{ type: 'queen-placed', queen, queenKey, autoMarks, priorMark: key }` in the `isMarked` branch — `src/stores/game-store.ts`
- [x] T006 [US1] Implement `undo()` action: pop last entry from `actionHistory`; switch on `type`; for `queen-placed` remove queen + delete auto-marks + restore prior mark + recompute `isSolved`; for `queen-removed` restore queen + restore auto-marks + recompute `isSolved`; no-op guards for empty history and `isSolved` — `src/stores/game-store.ts`

**Checkpoint**: T004 tests pass (GREEN ✅). User Story 1 is fully functional: queen placement and removal are both undoable.

---

## Phase 4: User Story 2 — Undo a Manual Mark Placement (Priority: P2)

**Goal**: Players can undo a single X mark (click) or an entire drag-mark batch with one Undo press.

**Independent Test**: Drag across 4 empty cells → verify 4 X marks appear → press Undo once → verify all 4 X marks are gone. Then click one cell to place an X → press Undo → verify that single X mark disappears.

> ⚠️ **TDD**: Write T007 first. Confirm RED. Then implement T008, T009, T010.

- [x] T007 Write RED tests for mark-batch undo: (a) `undo()` after `cycleCell` empty→X removes the single mark; (b) after `startMarkBatch` + 3× `addManualMark` + `commitMarkBatch`, `undo()` removes all 3 marks; (c) `commitMarkBatch()` with zero marks in buffer creates no history entry — `tests/logic/game-store.test.ts`
- [x] T008 [US2] In `cycleCell` `else` branch (empty→X): append `{ type: 'mark-batch', keys: [key] }` to `actionHistory`; in `addManualMark` after the no-op guards: when `isBatching === true` also append the key to `batchBuffer` — `src/stores/game-store.ts`
- [x] T009 [US2] Implement `startMarkBatch()` action: set `isBatching = true`, `batchBuffer = []`; implement `commitMarkBatch()` action: if `batchBuffer.length > 0` append `{ type: 'mark-batch', keys: [...batchBuffer] }` to `actionHistory`; always reset `isBatching = false`, `batchBuffer = []`; implement `undo()` case for `mark-batch`: remove all `keys` from `manualMarks` — `src/stores/game-store.ts`
- [x] T010 [P] [US2] Add optional `onBatchStart?: () => void` and `onBatchCommit?: () => void` to `UseDragMarkOptions`; call `onBatchStart?.()` at the start of `onCellMouseDown`; call `onBatchCommit?.()` at the end of the `endSession` handler (after `isDragging.current = false`) — `src/hooks/useDragMark.ts`

**Checkpoint**: T007 tests pass (GREEN ✅). User Story 2 fully functional: single-click X marks and drag batches are both undoable as single steps.

---

## Phase 5: User Story 3 — Bottom-Positioned Controls (Priority: P3)

**Goal**: Undo button and Reset button appear below the board; Reset is removed from the header.

**Independent Test**: Open any puzzle — confirm no Reset button in the header. Confirm Undo and Reset buttons are visible below the board. Confirm Undo is disabled when no history. Confirm both disabled when puzzle is solved.

- [x] T011 [US3] Remove the Reset `<button>` from the header section; add a `<div>` bottom-controls row below `<Board>` containing Undo (`Undo2` icon, aria-label "Undo last action") and Reset (`RotateCcw` icon, aria-label "Restart puzzle") buttons with correct disabled states — `src/pages/PuzzlePage.tsx`
- [x] T012 [US3] Destructure `undo`, `startMarkBatch`, `commitMarkBatch`, `actionHistory` from `useGameStore`; pass `onBatchStart: startMarkBatch` and `onBatchCommit: commitMarkBatch` to `useDragMark`; wire Undo button `onClick` to `undo`; set Undo `disabled` when `actionHistory.length === 0 || isSolved`; set Reset `disabled` when `isSolved` — `src/pages/PuzzlePage.tsx`

**Checkpoint**: User Story 3 fully functional. No Reset in header. Both buttons visible below board. Both disabled when solved. Undo disabled when history is empty.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 Run full test suite and fix any failures — `pnpm vitest`
- [x] T014 [P] Complete manual verification checklist from `specs/007-undo-action/quickstart.md` (all 11 items)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 (T001) — BLOCKS all user story phases
- **Phase 3 (US1)**: Requires Phase 2 complete — T004 → T005 → T006 (sequential, same file)
- **Phase 4 (US2)**: Requires Phase 3 complete — T007 → T008 → T009; T010 [P] can overlap with T007
- **Phase 5 (US3)**: Requires Phase 4 complete (needs `undo`, `startMarkBatch`, `commitMarkBatch` in store + hook)
- **Phase 6 (Polish)**: Requires Phase 5 complete

### Within Phase Dependencies

```
T001 → T002, T003 (in parallel)
T002 + T003 → T004
T004 → T005 → T006
T006 → T007
T007 → T008 → T009
T007 → T010 (in parallel with T008/T009 — different file)
T009 + T010 → T011
T011 → T012
T012 → T013, T014
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only
- **US2 (P2)**: Depends on US1 (both modify `game-store.ts` — must be sequential)
- **US3 (P3)**: Depends on US2 (`undo`, batch actions, and hook callbacks must exist)

---

## Parallel Opportunities

### Within Phase 2

```
# Both can start immediately after T001:
T002: Write RED baseline tests   → tests/logic/game-store.test.ts
T003: Add initial store state    → src/stores/game-store.ts
```

### Within Phase 4

```
# T010 can start in parallel with T007 (different files):
T007: Write RED mark-batch tests → tests/logic/game-store.test.ts
T010: Extend useDragMark hook    → src/hooks/useDragMark.ts
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002, T003)
3. Complete Phase 3 (T004 → T005 → T006)
4. **STOP and VALIDATE**: Undo for queen placement works end-to-end
5. Undo button can be added to the page bottom even without drag batching — just set `startMarkBatch`/`commitMarkBatch` as no-ops

### Incremental Delivery

1. Phase 1 + 2 → Types and store scaffold ready
2. Phase 3 → Queen undo works (MVP!)
3. Phase 4 → Drag-batch undo works
4. Phase 5 → Layout complete; both buttons visible at bottom
5. Phase 6 → Verified and polished

### Notes

- US1 and US2 both touch `game-store.ts` — complete them sequentially
- `undo()` in Phase 3 only handles `queen-placed` and `queen-removed`; Phase 4 extends it with the `mark-batch` case
- `cycleCell` in Phase 3 only records the queen-related transitions; Phase 4 adds the empty→X recording
- Mark the `[P]` tasks T003 and T010 for parallel execution when time is limited

---

## Task Count Summary

| Phase | Tasks | Story |
|---|---|---|
| Phase 1: Setup | 1 | — |
| Phase 2: Foundational | 2 | — |
| Phase 3: US1 Undo Queen | 3 | P1 |
| Phase 4: US2 Undo Mark Batch | 4 | P2 |
| Phase 5: US3 Bottom Controls | 2 | P3 |
| Phase 6: Polish | 2 | — |
| **Total** | **14** | |
