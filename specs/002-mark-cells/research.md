# Research: Cell X-Marking with Auto-Mark Assistance

**Branch**: `002-mark-cells` | **Date**: 2026-02-18
**Spec**: [spec.md](./spec.md)

---

## 1. Three-State Click Cycle

**Decision**: Replace the existing two-state `toggleQueen` in `game-store.ts` with a new
`cycleCell` action that moves each cell through `empty → marked (X) → queen → empty`.

**Rationale**: The current `placeOrRemoveQueen` calls `toggleQueen` from `board-state.ts`,
which only knows about queens. The cycle now includes a third state (X mark) tracked
separately. Replacing the action name to `cycleCell` makes the intent explicit and prevents
mis-use of the old API.

**Alternatives considered**:
- Reusing `placeOrRemoveQueen` with an extended signature — rejected: name is misleading for
  a three-state cycle and callers would need conditional logic outside the store.
- Adding an `isMarked` flag to the `Queen` entity — rejected: conflates two distinct concerns
  (mark state vs queen placement). Marks exist independently of queens.

---

## 2. Mark Storage Structure

**Decision**: Store two separate arrays/records in the game store (ephemeral, non-persisted):

```
manualMarks:       CellKey[]                   // cells the player manually marked
autoMarksByQueen:  Record<CellKey, CellKey[]>  // queenKey → cells it auto-marked
```

The effective visual mark set is derived in PuzzlePage by unioning `manualMarks` with all
values of `autoMarksByQueen`, similar to how `ConflictMap` is derived from `queens`.

**Rationale**:
- Plain arrays and records serialize cleanly in Zustand without Map/Set complications.
- Separation of `manualMarks` and `autoMarksByQueen` makes correct retraction possible
  (FR-006/FR-007): removing a queen deletes exactly `autoMarksByQueen[queenKey]` without
  touching manual marks.
- Deriving the visual `markedCells: Set<CellKey>` at render time is O(N²) at worst
  (N≤9 board) and consistent with the existing `ConflictMap` derivation pattern.

**Alternatives considered**:
- Single `marks: Map<CellKey, Set<'manual' | CellKey>>` per-cell — harder to retract per-queen
  marks efficiently and requires iterating all cells.
- `marks: Record<CellKey, CellMarkState>` (object per cell) — large when most cells are
  unmarked; plain array is more idiomatic for small, sparse state.

---

## 3. `computeInvalidationSet` Pure Function

**Decision**: Add `computeInvalidationSet(queen: CellCoord, stage: Stage): CellCoord[]` to
`src/lib/board-state.ts`. It returns all cells invalidated by placing a queen at `queen` —
same row, same column, all 8 adjacent cells, same colored region — excluding the queen's
own cell. This mirrors the existing constraint logic in `rule-validator.ts` (same four rules).

**Rationale**: Keeping it in `board-state.ts` (pure lib module) satisfies Constitution
Principle II (game logic must be in an independently testable module). It re-uses the same
invalidation rules that `deriveConflicts` already enforces so there is no rule duplication.

**Alternatives considered**:
- Inline the invalidation computation in the store action — rejected: violates Principle II
  (no game logic in Zustand stores).
- Derive auto-marks from `deriveConflicts` output — rejected: `deriveConflicts` marks *pairs*
  of conflicting queens, not cells a queen would invalidate for a *future* placement. The
  semantics differ.

---

## 4. Auto-Mark Toggle UI

**Decision**: Render a simple toggle button (checkbox + label) in `PuzzlePage.tsx` between
the timer and the board. State (`autoMarkEnabled: boolean`) lives in the game store.

**Rationale**: Single source of truth for all game session state. The toggle is scoped to the
session and resets to `false` when a new stage loads (FR-012), matching the store lifecycle.

**Alternatives considered**:
- Local `useState` in `PuzzlePage` — rejected: the store needs `autoMarkEnabled` to apply
  auto-marks inside `cycleCell`; passing it as an argument to every store action adds
  unnecessary coupling.
- Separate Zustand store — rejected: overkill for a single boolean scoped to a game session.

---

## 5. Backward Compatibility

**Decision**: The existing `placeOrRemoveQueen` action and `toggleQueen` pure function are
left in place until the feature branch is fully implemented. All new UI paths go through
`cycleCell`. Tests for the old path remain valid and continue to pass.

**Rationale**: Minimizes the diff surface and keeps the existing `001-queens-mock` behavior
safe during development on this branch.

---

## 6. Accessibility

**Decision**: Update the `Cell` aria-label to include the mark state:
`"Row N, Column M, [region] region[, X marked][, queen placed][, conflict]"`.

**Rationale**: Screen-reader users need to know a cell's current state for keyboard
interaction. Consistent with the existing aria-label pattern in `Cell.tsx`.

---

## Summary of New Entities

| Entity | Location | Type |
|--------|----------|------|
| `manualMarks` | game-store state | `CellKey[]` |
| `autoMarksByQueen` | game-store state | `Record<CellKey, CellKey[]>` |
| `autoMarkEnabled` | game-store state | `boolean` |
| `markedCells` | PuzzlePage derived | `Set<CellKey>` |
| `computeInvalidationSet` | lib/board-state.ts | Pure function |
| `cycleCell` | game-store action | Store action |
| `toggleAutoMark` | game-store action | Store action |
