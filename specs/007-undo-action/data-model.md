# Data Model: Undo Action and Bottom Controls

**Branch**: `007-undo-action` | **Date**: 2026-03-04

---

## New Types (additions to `src/types/index.ts`)

### `UndoAction` (discriminated union)

Represents a single reversible user interaction. Stored as an element in the history stack.

```
UndoAction =
  | MarkBatchAction
  | QueenPlacedAction
  | QueenRemovedAction
```

#### `MarkBatchAction`

Records one or more manual X marks placed in a single user interaction (either a click cycling empty → X, or a completed drag gesture).

| Field | Type | Description |
|---|---|---|
| `type` | `'mark-batch'` | Discriminant |
| `keys` | `CellKey[]` | One or more cell keys that were added to `manualMarks` |

Undo: remove all `keys` from `manualMarks`.

#### `QueenPlacedAction`

Records a queen being placed on the board (either from empty via X-marked → queen cycle, or via any future direct-place path).

| Field | Type | Description |
|---|---|---|
| `type` | `'queen-placed'` | Discriminant |
| `queen` | `Queen` | Coordinates of the placed queen |
| `queenKey` | `CellKey` | String key `"row:col"` of the queen cell |
| `autoMarks` | `CellKey[]` | Auto-mark keys added to `autoMarksByQueen[queenKey]` (empty array if auto-mark was off) |
| `priorMark` | `CellKey \| null` | The cell key that was X-marked before the queen was placed (X → queen path). `null` if the cell was empty before placement. |

Undo:
1. Remove `queen` from `queens[]`
2. Delete `autoMarksByQueen[queenKey]`
3. If `priorMark !== null`, add `priorMark` back to `manualMarks[]`
4. Recompute `isSolved`

#### `QueenRemovedAction`

Records a queen being removed from the board (queen → empty cycle).

| Field | Type | Description |
|---|---|---|
| `type` | `'queen-removed'` | Discriminant |
| `queen` | `Queen` | Coordinates of the removed queen |
| `queenKey` | `CellKey` | String key `"row:col"` of the queen cell |
| `autoMarks` | `CellKey[]` | Auto-mark keys that were in `autoMarksByQueen[queenKey]` before removal |

Undo:
1. Add `queen` back to `queens[]`
2. Restore `autoMarksByQueen[queenKey] = autoMarks`
3. Recompute `isSolved`

---

## Updated `GameSession` Interface

New fields added to the existing `GameSession` interface in `src/types/index.ts`:

| Field | Type | Default | Description |
|---|---|---|---|
| `actionHistory` | `UndoAction[]` | `[]` | Stack of reversible actions; last element is the most recent |
| `isBatching` | `boolean` | `false` | True while a drag gesture is in progress |
| `batchBuffer` | `CellKey[]` | `[]` | Accumulates mark keys during an active drag batch |

---

## Updated `GameStoreState` Interface

New actions added to the existing `GameStoreState` interface in `src/types/index.ts`:

| Action | Signature | Description |
|---|---|---|
| `undo` | `() => void` | Reverses the most recent action in `actionHistory`; no-op if history is empty or `isSolved` |
| `startMarkBatch` | `() => void` | Sets `isBatching = true` and clears `batchBuffer`; called on drag mousedown |
| `commitMarkBatch` | `() => void` | If `batchBuffer` is non-empty, appends `{ type: 'mark-batch', keys: batchBuffer }` to `actionHistory`; clears `batchBuffer` and sets `isBatching = false`; called on mouseup |

---

## Updated `UseDragMarkOptions` Interface

New optional callbacks added to `UseDragMarkOptions` in `src/hooks/useDragMark.ts`:

| Field | Type | Description |
|---|---|---|
| `onBatchStart?` | `() => void` | Called on mousedown to signal a new drag session is beginning |
| `onBatchCommit?` | `() => void` | Called on mouseup to signal the drag session has ended |

---

## State Transitions

```
Board state after each user action and its undo:

cycleCell: empty → X-marked
  Forward: manualMarks ← [...manualMarks, key]
           history ← [...history, { type:'mark-batch', keys:[key] }]
  Undo:    manualMarks ← manualMarks.filter(k => k !== key)

cycleCell: X-marked → queen
  Forward: manualMarks ← manualMarks.filter(k => k !== key)
           queens ← [...queens, queen]
           autoMarksByQueen ← { ...prev, [queenKey]: computedAutoMarks }
           history ← [...history, { type:'queen-placed', queen, queenKey,
                                    autoMarks: computedAutoMarks, priorMark: key }]
  Undo:    queens ← queens.filter(q => !(q.row===r && q.col===c))
           autoMarksByQueen ← delete [queenKey]
           manualMarks ← [...manualMarks, priorMark]

cycleCell: queen → empty
  Forward: queens ← queens.filter(...)
           autoMarksByQueen ← delete [queenKey]
           history ← [...history, { type:'queen-removed', queen, queenKey,
                                    autoMarks: prev[queenKey] ?? [] }]
  Undo:    queens ← [...queens, queen]
           autoMarksByQueen ← { ...prev, [queenKey]: autoMarks }

drag gesture (N cells):
  Forward: (per cell) manualMarks ← [...manualMarks, key]
                      batchBuffer ← [...batchBuffer, key]
  Commit:  history ← [...history, { type:'mark-batch', keys: batchBuffer }]
  Undo:    manualMarks ← manualMarks.filter(k => !batchKeys.includes(k))
```

---

## Cleared on Load/Reset

The following fields are reset to their initial values by both `loadStage` and `restart`:

- `actionHistory: []`
- `isBatching: false`
- `batchBuffer: []`
