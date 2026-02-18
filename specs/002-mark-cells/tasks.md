# Tasks: Cell X-Marking with Auto-Mark Assistance

**Input**: Design documents from `/specs/002-mark-cells/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, research.md ✅, quickstart.md ✅

**Tests**: TDD is required for `computeInvalidationSet` (Constitution Principle IV — game-logic in `lib/` must be test-first). UI component tasks do not require test-first.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths relative to repo root

---

## Phase 1: Setup

**Purpose**: Baseline verification before any changes

- [x] T001 Run `pnpm vitest` and confirm all existing tests pass; note any pre-existing failures before touching files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update shared types that ALL user story phases depend on

**⚠️ CRITICAL**: No user story work can begin until T002 is complete — all downstream files import from `src/types/index.ts`

- [x] T002 Extend `src/types/index.ts`: add `manualMarks: CellKey[]`, `autoMarksByQueen: Record<string, CellKey[]>`, `autoMarkEnabled: boolean` to `GameSession`; add `cycleCell(coord: CellCoord): void` and `toggleAutoMark(): void` to `GameStoreState`; add `isMarked: boolean` to `CellProps`; add `markedCells: Set<CellKey>` to `BoardProps`

**Checkpoint**: Types file updated — user story phases can now begin (T003–T005 can run in parallel)

---

## Phase 3: User Story 1 — Three-State Cell Click Cycle (Priority: P1) 🎯 MVP

**Goal**: Cells cycle through empty → X-marked → queen → empty on each click. Manual X marks persist as player annotations.

**Independent Test**: Click any empty cell once → X appears. Click again → queen appears. Click queen → returns to empty. Restart clears all marks.

### Implementation for User Story 1

- [x] T003 [US1] Update `src/stores/game-store.ts`: add `manualMarks: []` to initial state; implement `cycleCell(coord)` (manual-marks-only — no auto-mark logic yet); update `restart()` to reset `manualMarks: []`; update `loadStage()` to reset `manualMarks: []`
- [x] T004 [P] [US1] Update `src/components/Board/Cell.tsx`: add `isMarked: boolean` prop; import `X` from `lucide-react`; render `<X className="w-1/2 h-1/2 text-gray-500" strokeWidth={2.5} />` when `isMarked && !hasQueen`; update `aria-label` to include `, X marked` when `isMarked && !hasQueen`
- [x] T005 [P] [US1] Update `src/components/Board/Board.tsx`: add `markedCells: Set<CellKey>` to `BoardProps` destructure; derive `isMarked` per cell as `markedCells.has(\`\${rowIdx}:\${colIdx}\`)` and pass to `<Cell>`
- [x] T006 [US1] Update `src/pages/PuzzlePage.tsx`: destructure `manualMarks`, `cycleCell` from `useGameStore()`; derive `markedCells` with `useMemo` as `new Set<CellKey>(manualMarks)`; replace `placeOrRemoveQueen` with `cycleCell` in `onCellClick`; pass `markedCells` to `<Board>`

**Checkpoint**: Three-state click cycle works with manual marks. Restart clears all X marks. No auto-mark functionality yet — that comes in Phase 4.

---

## Phase 4: User Story 2 — Auto-Mark Toggle (Priority: P2)

**Goal**: An "Auto-mark invalid cells" toggle on the puzzle screen. When on, placing a queen automatically X-marks every cell in the same row, column, adjacent 8 cells, and same colored region.

**Independent Test**: Enable toggle → place one queen → verify all invalid cells show X without clicking them. Remove queen → verify auto-marks are cleared (manual marks remain).

### Tests for User Story 2 ⚠️ TDD Required — Write FIRST, Confirm RED Before Implementing

- [x] T007 [US2] Add failing tests for `computeInvalidationSet` in `tests/logic/board-state.test.ts`: test that it returns cells in same row; test cells in same column; test all 8 adjacent cells; test cells in same colored region; test deduplication (corner cell matching multiple conditions appears once); test that the queen's own cell is excluded; confirm tests FAIL (red) before proceeding to T008

### Implementation for User Story 2

- [x] T008 [US2] Implement `computeInvalidationSet(queen: CellCoord, stage: Stage): CellCoord[]` in `src/lib/board-state.ts`: iterate all board cells, collect those where `r === queen.row` OR `c === queen.col` OR `(|r-queen.row| <= 1 && |c-queen.col| <= 1)` OR `stage.grid[r][c] === stage.grid[queen.row][queen.col]`, excluding the queen's own cell; deduplicate using an internal `Set<string>`; confirm T007 tests turn GREEN before proceeding
- [x] T009 [US2] Extend `src/stores/game-store.ts`: add `autoMarksByQueen: {}` and `autoMarkEnabled: false` to initial state; implement `toggleAutoMark()` (ON: retroactively compute + store invalidation sets for all current queens using `computeInvalidationSet`; OFF: set `autoMarkEnabled: false`, leave existing marks unchanged); extend `cycleCell()` so that when placing a queen with `autoMarkEnabled === true` it populates `autoMarksByQueen[queenKey]` from `computeInvalidationSet`; when removing a queen, delete `autoMarksByQueen[queenKey]`; update `loadStage()` to also reset `autoMarksByQueen: {}` and `autoMarkEnabled: false`; update `restart()` to reset `autoMarksByQueen: {}`
- [x] T010 [US2] Extend `src/pages/PuzzlePage.tsx`: destructure `autoMarksByQueen`, `autoMarkEnabled`, `toggleAutoMark` from `useGameStore()`; update `markedCells` `useMemo` to union `manualMarks` with all arrays in `Object.values(autoMarksByQueen)`; add Auto-Mark toggle UI below timer — `<label>` wrapping `<input type="checkbox" checked={autoMarkEnabled} onChange={toggleAutoMark} disabled={isSolved} />` with text "Auto-mark invalid cells"

**Checkpoint**: Auto-Mark toggle works. Placing a queen auto-marks all invalid cells. Removing a queen retracts its auto-marks. Manual marks survive queen removal.

---

## Phase 5: User Story 3 — Auto-Marks Do Not Block Queen Placement (Priority: P3)

**Goal**: Clicking any X-marked cell (auto or manual) always advances it to queen state. Auto-marks are hints, not restrictions.

**Independent Test**: Enable Auto-Mark, place a queen, then click one of the auto-marked cells — it should become a queen (overriding the X mark). Conflict highlighting still works normally.

### Implementation for User Story 3

- [x] T011 [US3] Verify `cycleCell` in `src/stores/game-store.ts` handles the `isMarked` check using both `manualMarks` and `autoMarksByQueen` values — the `else if isMarked` branch must fire for auto-marked cells and place a queen (this should already be true after T009; if `isMarked` was derived only from `manualMarks` in T003, update it now to also check `autoMarksByQueen`)

**Checkpoint**: Auto-marks act as visual hints only. Clicking a cell with any X mark (auto or manual) cycles it to queen state. Conflict validation is unaffected by mark state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, and integration smoke test

- [x] T012 [P] Run `pnpm vitest` — all tests (including new `computeInvalidationSet` tests) must pass; fix any regressions
- [x] T013 Run `pnpm dev` and perform the full smoke test from `specs/002-mark-cells/quickstart.md`: (1) click empty cell → X appears, (2) click X cell → queen, (3) click queen → empty, (4) restart → all marks cleared, (5) enable Auto-Mark + place queen → invalid cells auto-marked, (6) remove queen → auto-marks removed + manual marks preserved, (7) click auto-marked cell → queen placed, (8) conflict detection still works normally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story phases
- **Phase 3 (US1)**: Depends on T002; T003, T004, T005 can run in parallel; T006 depends on T003+T004+T005
- **Phase 4 (US2)**: Depends on Phase 3 completion; T007 first; T008 depends on T007; T009 depends on T008; T010 depends on T009
- **Phase 5 (US3)**: Depends on T009 (store extension) — usually a no-op verification
- **Phase 6 (Polish)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Can start after T002 — independent of US2/US3
- **US2 (P2)**: Depends on US1 completion (extends the store and page built in US1)
- **US3 (P3)**: Depends on US2 completion (validates behavior of extended `cycleCell`)

### Within Each User Story

- US1: T003, T004, T005 in parallel → T006 after all three
- US2: T007 → T008 → T009 → T010 (strict sequential — TDD order enforced)
- US3: T011 (single verification task)

### Parallel Opportunities

- T003, T004, T005 can run simultaneously (store, Cell, Board — different files)
- T012 and T013 can begin as soon as Phase 5 is complete

---

## Parallel Example: User Story 1

```bash
# After T002 completes, launch these three in parallel:
Task A: T003 — Update src/stores/game-store.ts (cycleCell + manualMarks)
Task B: T004 — Update src/components/Board/Cell.tsx (isMarked + X icon)
Task C: T005 — Update src/components/Board/Board.tsx (markedCells prop)

# Then, after A+B+C complete:
Task D: T006 — Update src/pages/PuzzlePage.tsx (wire everything together)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — T001–T006)

1. Complete Phase 1: run existing tests (T001)
2. Complete Phase 2: update types (T002)
3. Complete Phase 3 in parallel: T003 + T004 + T005, then T006
4. **STOP and VALIDATE**: Click cycle works, restart clears marks
5. Demo/merge US1 if desired — the X-mark cycle is independently useful

### Incremental Delivery

1. T001–T002 → Foundation ready
2. T003–T006 → US1 complete: three-state click cycle (MVP!)
3. T007–T010 → US2 complete: auto-mark toggle works
4. T011 → US3 verified: auto-marks don't block placement
5. T012–T013 → Polish and final validation

---

## Notes

- `[P]` tasks operate on different files with no mutual dependencies at that point
- `[Story]` label maps each task to the user story it delivers
- For T007: tests MUST be confirmed RED before T008 implementation (Constitution IV)
- `cycleCell` replaces `placeOrRemoveQueen` in all UI call sites; the old action is preserved in the store but no longer called from the UI
- X marks (manual or auto) have no effect on `deriveConflicts` or `isSolved` — game logic is unchanged
- `markedCells: Set<CellKey>` is always derived, never stored — follows the existing `ConflictMap` pattern
