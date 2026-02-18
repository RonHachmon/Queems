# Tasks: Click-and-Drag X Marking

**Input**: Design documents from `/specs/003-drag-mark-x/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: TDD is MANDATORY for `addManualMark` (Constitution Principle IV). The drag hook
(`useDragMark`) is UI interaction logic — tests are recommended but not constitutionally required.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no pending dependencies between them)
- **[Story]**: Which user story this task belongs to ([US1], [US2], [US3])
- Exact file paths are provided in every task description

---

## Phase 1: Setup (Codebase Orientation)

**Purpose**: Confirm existing integration points before touching any code

- [x] T001 Review `src/components/Board/Cell.tsx`, `src/components/Board/Board.tsx`, `src/stores/game-store.ts`, and `src/pages/PuzzlePage.tsx` against the contracts in `specs/003-drag-mark-x/contracts/typescript-interfaces.ts` to confirm props, actions, and call sites match the plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The `addManualMark` store action is the only game-logic change and MUST be
TDD-complete before any user story implementation begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete (Constitution Principle IV requires RED → GREEN before implementation).

- [x] T002 Write RED tests for `addManualMark` in `tests/logic/game-store.test.ts` — four test cases: (1) empty cell gets added to `manualMarks`, (2) cell with a queen is ignored (no change to store), (3) cell already in `manualMarks` is ignored, (4) cell auto-marked in `autoMarksByQueen` is ignored. Confirm all four tests FAIL before any implementation.

- [x] T003 Implement `addManualMark(coord: CellCoord)` action in `src/stores/game-store.ts` — convert coord to `CellKey`, check membership in `queens`, `manualMarks`, and all `autoMarksByQueen` values; if cell is empty in all three, push key to `manualMarks`. Run `pnpm vitest game-store` and confirm all four tests now PASS.

**Checkpoint**: `addManualMark` is tested and GREEN — user story phases can now begin.

---

## Phase 3: User Story 1 — Drag to Mark Multiple Empty Cells (Priority: P1) 🎯 MVP

**Goal**: Holding the primary mouse button and dragging across the grid immediately marks
each empty cell with X. Releasing the button ends the gesture.

**Independent Test**: Open any puzzle stage, press and hold the mouse button on an empty
cell, drag across at least three other empty cells, then release. All four cells must show X
marks before the button is released. No other cell state changes.

### Implementation for User Story 1

- [x] T004 [US1] Create `src/hooks/useDragMark.ts` — define the `UseDragMarkOptions` and `UseDragMarkReturn` types (matching `specs/003-drag-mark-x/contracts/typescript-interfaces.ts`); declare all five refs (`isDragging`, `startCoord`, `startMarked`, `didDrag`, `visitedCells`); export the hook stub returning `{ dragHandlers: { onCellMouseDown, onCellMouseEnter }, isDragGesture }`

- [x] T005 [US1] Implement `onCellMouseDown(coord)` in `src/hooks/useDragMark.ts` — if `disabled` is true, return early; else set `isDragging.current = true`, `startCoord.current = coord`, `startMarked.current = false`, `didDrag.current = false`, clear `visitedCells.current`

- [x] T006 [US1] Implement `onCellMouseEnter(coord)` in `src/hooks/useDragMark.ts` — guard: if `!isDragging.current`, return; convert `startCoord` and `coord` to `CellKey`; if `coord` key is already in `visitedCells`, return; if `didDrag.current` is false (first new cell entered): set `didDrag.current = true`, and if `!startMarked.current`, call `onMarkCell(startCoord.current)` and add start key to `visitedCells`, set `startMarked.current = true`; then call `onMarkCell(coord)` and add coord key to `visitedCells`

- [x] T007 [US1] Add window `mouseup` listener via `useEffect` in `src/hooks/useDragMark.ts` — listener sets `isDragging.current = false`; effect returns cleanup that removes the listener; `useEffect` dependency array is empty (listener added once on mount)

- [x] T008 [US1] Implement `isDragGesture()` in `src/hooks/useDragMark.ts` — returns `didDrag.current` (read-only; caller resets didDrag by calling `onCellMouseDown` on the next gesture start); verify the full hook compiles with no TypeScript errors (`pnpm tsc --noEmit`)

- [x] T009 [P] [US1] Add `onMouseDown?: () => void` and `onMouseEnter?: () => void` to `CellProps` in `src/components/Board/Cell.tsx`; wire both to the `motion.button` element alongside the existing `onClick` prop; confirm TypeScript compiles cleanly

- [x] T010 [P] [US1] Add `onCellMouseDown?: (coord: CellCoord) => void` and `onCellMouseEnter?: (coord: CellCoord) => void` to `BoardProps` in `src/components/Board/Board.tsx`; in the cell rendering loop, pass `onMouseDown={() => onCellMouseDown?.({ row: rowIdx, col: colIdx })}` and `onMouseEnter={() => onCellMouseEnter?.({ row: rowIdx, col: colIdx })}` to each `Cell`; confirm TypeScript compiles cleanly

- [x] T011 [US1] Update `src/pages/PuzzlePage.tsx` — (1) destructure `addManualMark` from `useGameStore()`; (2) call `useDragMark({ onMarkCell: addManualMark, disabled: isSolved })` and destructure `{ dragHandlers, isDragGesture }`; (3) pass `onCellMouseDown={dragHandlers.onCellMouseDown}` and `onCellMouseEnter={dragHandlers.onCellMouseEnter}` to `<Board />`; (4) replace the inline `onCellClick={cycleCell}` with `onCellClick={(coord) => { if (isDragGesture()) return; cycleCell(coord); }}`

**Checkpoint**: Run `pnpm dev`, open any stage, drag across empty cells — all should show X
marks in real time. Releasing the button stops marking. US1 is independently functional.

---

## Phase 4: User Story 2 — Existing Marks and Queens Unaffected (Priority: P2)

**Goal**: Confirm that dragging over cells that already carry an X mark or a queen does
not modify those cells. This story is enforced by `addManualMark` (Phase 2) and the
`visitedCells` tracking in `useDragMark` (Phase 3) — no new code is required.

**Independent Test**: Place a queen (click a cell twice) and manually mark another cell with
X (single click). Then drag across an entire row that contains both non-empty cells and
empty cells. Verify: the queen remains, the existing X remains, and only cells that were
empty now show X.

### Validation for User Story 2

- [x] T012 [US2] Validate `addManualMark` test coverage in `tests/logic/game-store.test.ts` — confirm test cases T002's items (2), (3), and (4) specifically cover the US2 scenarios: queen cell no-op, manual X no-op, auto-mark no-op. If any case is missing, add it now and re-run `pnpm vitest game-store`.

- [x] T013 [US2] Manual validation — with `pnpm dev` running, follow the US2 independent test above on at least two different puzzle stages. Confirm zero regressions: queens stay placed, existing X marks are unchanged, empty cells in the same drag path receive X marks.

**Checkpoint**: US2 independently validated. Non-empty cells are provably unaffected by drag.

---

## Phase 5: User Story 3 — Click Cycle Preserved and Distinct From Drag (Priority: P3)

**Goal**: Confirm that pressing and releasing on a single cell without dragging to another
cell still produces the original three-state cycle: empty → X → queen → empty. The
`isDragGesture()` guard added in T011 enforces this.

**Independent Test**: Without using any drag gesture, click a single empty cell → X; click
again → queen; click again → empty. All three transitions must match pre-feature behaviour.
Then perform a drag, and confirm no click cycle fires when the button is released.

### Validation for User Story 3

- [x] T014 [US3] Manual validation of click cycle preservation — on a fresh stage, click (no drag) each of the three states in order on a single cell and confirm empty→X→queen→empty still cycles correctly. Repeat for at least three different cells.

- [x] T015 [US3] Manual validation of drag/click separation — perform a drag that starts on empty cell A, moves to empty B, and ends back on A (return-to-origin edge case per research Decision 3). Confirm: A and B are both X-marked; no cell advances to queen; the click cycle did NOT fire.

**Checkpoint**: All three user stories are independently functional and validated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates across all stories.

- [x] T016 [P] Run `pnpm vitest` and confirm all tests pass (zero failures, zero regressions in existing `rule-validator.test.ts`, `board-state.test.ts`, `best-times-store.test.ts`)

- [x] T017 [P] Run `pnpm eslint src --ext .ts,.tsx` and fix all lint errors introduced by this feature (Cell.tsx, Board.tsx, PuzzlePage.tsx, useDragMark.ts)

- [x] T018 Run `pnpm tsc --noEmit` and confirm zero TypeScript errors across the full project

- [x] T019 Verify drag works correctly when the board is disabled (`isSolved = true`) — `useDragMark` should early-return on `mousedown` when `disabled` is true; confirm no cells are marked after solving a puzzle

- [x] T020 Verify Auto-Mark interaction — with Auto-Mark toggle ON, drag-place some X marks, then place a queen via click; confirm auto-marks apply correctly and drag-placed X marks are preserved (not incorrectly removed on queen removal)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 completion (requires drag to be working to manually validate)
- **Phase 5 (US3)**: Depends on Phase 3 completion (isDragGesture guard must exist)
- **Phase 6 (Polish)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational (Phase 2) — no dependency on US2 or US3
- **US2 (P2)**: Depends on US1 (drag must work to test non-empty-cell behaviour)
- **US3 (P3)**: Depends on US1 (isDragGesture guard in PuzzlePage must exist)

### Within Phase 3 (US1)

```
T004 → T005 → T006 → T007 → T008   (all in src/hooks/useDragMark.ts, sequential)
T009                                 (src/components/Board/Cell.tsx, parallel with T010)
T010                                 (src/components/Board/Board.tsx, parallel with T009)
T009 + T010 + T008 → T011           (PuzzlePage wiring requires all three to be done)
```

### Parallel Opportunities

- **T009 and T010** can be worked in parallel (different files, no shared state)
- **T016 and T017** can run in parallel (pnpm test and eslint are independent)
- **T004–T008** are all in `useDragMark.ts` — sequential within the file

---

## Parallel Example: Phase 3 (US1)

```
# After T008 completes, launch these in parallel:
Task A: "Add onMouseDown/onMouseEnter to Cell.tsx" → T009
Task B: "Add onCellMouseDown/onCellMouseEnter to Board.tsx" → T010

# After T008 + T009 + T010 all complete:
Task: "Wire useDragMark in PuzzlePage.tsx" → T011
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational — TDD for `addManualMark` (T002–T003) ⚠️ Required by constitution
3. Complete Phase 3: User Story 1 (T004–T011)
4. **STOP and VALIDATE**: Drag across cells, verify X marks appear in real time
5. Deploy/demo if ready — drag marking is the core feature and is fully functional

### Incremental Delivery

1. Phase 1 + Phase 2 → `addManualMark` is tested and ready
2. Phase 3 → Drag marking live → **MVP shipped**
3. Phase 4 → Verify non-empty cell safety (no new code, pure validation)
4. Phase 5 → Verify click cycle backward compatibility (pure validation)
5. Phase 6 → Full quality gate pass

---

## Notes

- [P] tasks = different files, no pending dependencies — safe to run in parallel
- [US1]/[US2]/[US3] labels map tasks to spec.md user stories for traceability
- `addManualMark` tests (T002) MUST be confirmed RED before T003 implementation — this is a constitution gate, not optional
- The `isDragGesture()` guard in T011 is critical for US3 — without it, dragging back to origin would double-cycle the starting cell
- `useDragMark` uses refs (not state) for drag session tracking to avoid spurious re-renders
- The window `mouseup` listener (T007) is essential for FR-008 (drag persists when cursor leaves grid)
- Commit after each checkpoint to preserve a known-good state
