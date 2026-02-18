# Quickstart: Cell X-Marking with Auto-Mark Assistance

**Branch**: `002-mark-cells` | **Date**: 2026-02-18

---

## What Changes

The Queens puzzle gains two new interaction patterns:

1. **Three-state click cycle** — cells now cycle `empty → X → queen → empty` instead of the
   previous two-state `empty ↔ queen` toggle.

2. **Auto-Mark toggle** — an optional toggle on the puzzle screen that, when on, automatically
   X-marks every cell invalidated by each newly placed queen (same row, column, adjacent cells,
   same colored region). Auto-marks are retracted when their causing queen is removed.

---

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/types/index.ts` | Modify | Add `CellKey[]` / `Record` mark fields to `GameSession`; add `isMarked` to `CellProps`; add `markedCells` to `BoardProps`; add `cycleCell` / `toggleAutoMark` to `GameStoreState` |
| `src/lib/board-state.ts` | Modify | Add pure `computeInvalidationSet(queen, stage)` function |
| `src/stores/game-store.ts` | Modify | Add `manualMarks`, `autoMarksByQueen`, `autoMarkEnabled` state; add `cycleCell`, `toggleAutoMark` actions; update `restart` and `loadStage` to reset mark state |
| `src/components/Board/Cell.tsx` | Modify | Accept `isMarked` prop; render X icon when marked and no queen; update aria-label |
| `src/components/Board/Board.tsx` | Modify | Accept `markedCells` prop; derive `isMarked` per cell; pass to `Cell` |
| `src/pages/PuzzlePage.tsx` | Modify | Derive `markedCells` from store; swap `placeOrRemoveQueen` → `cycleCell`; render Auto-Mark toggle; pass `markedCells` to `Board` |
| `tests/logic/board-state.test.ts` | Modify | Add TDD tests for `computeInvalidationSet` (write tests RED first, then implement) |

---

## New Zustand Store Shape (game-store.ts)

```typescript
// New fields on GameSession
manualMarks:      CellKey[]                    // default: []
autoMarksByQueen: Record<CellKey, CellKey[]>   // default: {}
autoMarkEnabled:  boolean                      // default: false

// New actions on GameStoreState
cycleCell(coord: CellCoord): void
toggleAutoMark(): void
```

The existing `placeOrRemoveQueen` action is **kept** but superseded by `cycleCell` in all
UI call sites. It may be removed in a follow-up cleanup task.

---

## New Pure Function (board-state.ts)

```typescript
export function computeInvalidationSet(queen: CellCoord, stage: Stage): CellCoord[]
```

Returns all cells (excluding the queen's own cell) that are in the same row, column, adjacent
(8-directional), or same colored region as `queen`. Tests MUST be written first (red),
then the implementation.

---

## PuzzlePage Additions

```tsx
// Derived before render
const markedCells = useMemo(() => {
  const set = new Set<CellKey>(manualMarks)
  for (const cells of Object.values(autoMarksByQueen)) {
    cells.forEach(k => set.add(k as CellKey))
  }
  return set
}, [manualMarks, autoMarksByQueen])

// New UI element — Auto-Mark toggle
<label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
  <input
    type="checkbox"
    checked={autoMarkEnabled}
    onChange={toggleAutoMark}
    disabled={isSolved}
    className="w-4 h-4 cursor-pointer"
  />
  Auto-mark invalid cells
</label>
```

---

## Running Tests

```bash
pnpm vitest                          # run all tests
pnpm vitest tests/logic/board-state  # run board-state tests only
```

Write `computeInvalidationSet` tests first. Confirm they fail (red). Then implement.

---

## Development Order (matches tasks.md)

1. Write failing tests for `computeInvalidationSet`
2. Implement `computeInvalidationSet` (make tests green)
3. Update `src/types/index.ts` with new types and interfaces
4. Update `game-store.ts` (add state + actions)
5. Update `Cell.tsx` (isMarked prop + X rendering)
6. Update `Board.tsx` (markedCells prop + isMarked derivation)
7. Update `PuzzlePage.tsx` (derive markedCells + toggle UI + swap action)
8. Manual smoke test: full click cycle, auto-mark on/off, queen removal retracts marks
