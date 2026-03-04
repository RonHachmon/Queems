# Quickstart: Undo Action and Bottom Controls

**Branch**: `007-undo-action` | **Date**: 2026-03-04

This guide gives an implementer everything they need to start and finish this feature end-to-end.

---

## 1. Orientation

### What this feature adds
- An **Undo button** below the puzzle board that reverses the last user action.
- Relocates the **Reset button** from the header to below the board, next to Undo.
- A new **action history stack** in the game store.

### What this feature does NOT change
- Game rules, conflict detection, auto-mark logic — untouched.
- Best times store, settings store — untouched.
- Stage select page — untouched.
- `CompletionModal` behavior — untouched.

---

## 2. Files to Change (in implementation order)

| Order | File | Change |
|---|---|---|
| 1 | `tests/logic/game-store.test.ts` | Add undo tests (RED first — TDD) |
| 2 | `src/types/index.ts` | Add `UndoAction`, update `GameSession` + `GameStoreState` |
| 3 | `src/stores/game-store.ts` | Add history tracking + `undo`, `startMarkBatch`, `commitMarkBatch` |
| 4 | `src/hooks/useDragMark.ts` | Add optional `onBatchStart` / `onBatchCommit` callbacks |
| 5 | `src/pages/PuzzlePage.tsx` | Wire batch callbacks; remove Reset from header; add bottom controls |

---

## 3. Key Implementation Notes

### `UndoAction` union type
Add to `src/types/index.ts` before the `GameSession` interface:

```typescript
export type UndoAction =
  | { type: 'mark-batch'; keys: CellKey[] }
  | { type: 'queen-placed'; queen: Queen; queenKey: CellKey; autoMarks: CellKey[]; priorMark: CellKey | null }
  | { type: 'queen-removed'; queen: Queen; queenKey: CellKey; autoMarks: CellKey[] }
```

### New fields on `GameSession`
```typescript
actionHistory: UndoAction[]
isBatching: boolean
batchBuffer: CellKey[]
```

### New actions on `GameStoreState`
```typescript
undo: () => void
startMarkBatch: () => void
commitMarkBatch: () => void
```

### History recording in `cycleCell`
Every branch of `cycleCell` appends exactly one entry to `actionHistory`:
- `else` branch (empty → X): `{ type: 'mark-batch', keys: [key] }`
- `isMarked` branch (X → queen): `{ type: 'queen-placed', ..., priorMark: key }`
- `hasQueen` branch (queen → empty): `{ type: 'queen-removed', ..., autoMarks: state.autoMarksByQueen[key] ?? [] }`

### Batch accumulation in `addManualMark`
After the three no-op guards, when adding to `manualMarks`, also conditionally append to `batchBuffer`:
```typescript
set({
  manualMarks: [...state.manualMarks, key],
  ...(state.isBatching && { batchBuffer: [...state.batchBuffer, key] }),
})
```

### `undo` switch
```typescript
undo() {
  const state = get()
  if (state.isSolved || state.actionHistory.length === 0) return
  const last = state.actionHistory[state.actionHistory.length - 1]
  const history = state.actionHistory.slice(0, -1)
  switch (last.type) {
    case 'mark-batch':
      set({ manualMarks: state.manualMarks.filter(k => !last.keys.includes(k)), actionHistory: history })
      break
    case 'queen-placed': {
      const newQueens = state.queens.filter(q => !(q.row === last.queen.row && q.col === last.queen.col))
      const newAutoMarks = { ...state.autoMarksByQueen }
      delete newAutoMarks[last.queenKey]
      const newManualMarks = last.priorMark ? [...state.manualMarks, last.priorMark] : state.manualMarks
      const stage = STAGES[state.stageId]
      set({ queens: newQueens, autoMarksByQueen: newAutoMarks, manualMarks: newManualMarks,
            isSolved: stage ? isSolved(newQueens, stage) : false, actionHistory: history })
      break
    }
    case 'queen-removed': {
      const newQueens = [...state.queens, last.queen]
      const newAutoMarks = { ...state.autoMarksByQueen, [last.queenKey]: last.autoMarks }
      const stage = STAGES[state.stageId]
      set({ queens: newQueens, autoMarksByQueen: newAutoMarks,
            isSolved: stage ? isSolved(newQueens, stage) : false, actionHistory: history })
      break
    }
  }
}
```

### `useDragMark` changes
Add to `UseDragMarkOptions`:
```typescript
onBatchStart?: () => void
onBatchCommit?: () => void
```
Call `onBatchStart?.()` at the start of `onCellMouseDown`.
Call `onBatchCommit?.()` at the end of `endSession`.

### `PuzzlePage.tsx` wiring
```typescript
const { undo, startMarkBatch, commitMarkBatch, actionHistory, ... } = useGameStore()

const { dragHandlers, isDragGesture } = useDragMark({
  onMarkCell: addManualMark,
  onBatchStart: startMarkBatch,
  onBatchCommit: commitMarkBatch,
  disabled: isSolved,
})
```

Remove the Reset `<button>` from the header. Add below `<Board>`:
```tsx
<div className="flex gap-4 w-full max-w-sm justify-center">
  <button
    type="button"
    onClick={undo}
    disabled={actionHistory.length === 0 || isSolved}
    aria-label="Undo last action"
    className={cn(
      'flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors',
      (actionHistory.length === 0 || isSolved) && 'opacity-50 cursor-not-allowed pointer-events-none'
    )}
  >
    <Undo2 className="w-4 h-4" strokeWidth={2.5} />
    <span className="text-sm font-medium">Undo</span>
  </button>
  <button
    type="button"
    onClick={() => restart(false)}
    disabled={isSolved}
    aria-label="Restart puzzle"
    className={cn(
      'flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors',
      isSolved && 'opacity-50 cursor-not-allowed pointer-events-none'
    )}
  >
    <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
    <span className="text-sm font-medium">Reset</span>
  </button>
</div>
```

---

## 4. Running Tests

```bash
pnpm vitest                     # run all tests
pnpm vitest tests/logic/game-store.test.ts  # run only game-store tests
```

Expected flow:
1. Write new tests in `game-store.test.ts` — they fail (RED)
2. Implement types → store changes — tests pass (GREEN)
3. Hook and page changes have no unit tests; verify manually

---

## 5. Manual Verification Checklist

- [ ] Place a queen; press Undo — queen and its auto-marks disappear
- [ ] Place two queens; press Undo twice — board is empty
- [ ] Click a cell (empty → X); press Undo — X disappears
- [ ] Drag across 4 cells; press Undo once — all 4 X marks disappear
- [ ] Place X mark on a cell, then click it to place a queen (X → queen); press Undo — queen gone, X mark restored
- [ ] Click a queen to remove it (queen → empty); press Undo — queen restored with auto-marks
- [ ] Undo button is disabled when board is empty
- [ ] Both buttons are disabled after puzzle is solved
- [ ] Reset button is absent from the header
- [ ] Both buttons appear below the board
- [ ] Reset still works (clears board, resets timer)
