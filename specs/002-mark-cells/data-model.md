# Data Model: Cell X-Marking with Auto-Mark Assistance

**Branch**: `002-mark-cells` | **Date**: 2026-02-18

---

## Cell State

A cell now has one of three visual states, derived from the store at render time:

| State | Condition | Visual |
|-------|-----------|--------|
| `empty` | No queen, not in `markedCells` | Blank region color |
| `marked` | Not a queen, key in `markedCells` | Region color + X icon |
| `queen` | Key in `queens` array | Region color + Crown icon |

A cell cannot be both `marked` and `queen` simultaneously (placing a queen on an X cell
removes the manual mark; auto-marks on a queen's cell are never applied — FR-005).

---

## Store State (additions to `GameSession`)

```
manualMarks: CellKey[]
```
- Array of `"row:col"` keys representing cells the player manually marked with X.
- Populated when the player clicks an empty cell (cycle step 1).
- Entry removed when the player clicks the marked cell to advance to queen (cycle step 2).
- Cleared entirely on `restart()` and `loadStage()`.

```
autoMarksByQueen: Record<CellKey, CellKey[]>
```
- Maps each placed queen's `"row:col"` key to the list of `"row:col"` cell keys that were
  auto-marked when that queen was placed.
- Populated when `cycleCell` places a queen while `autoMarkEnabled === true`.
- Entry deleted (by queen key) when that queen is removed.
- Cleared entirely on `restart()` and `loadStage()`.

```
autoMarkEnabled: boolean
```
- `false` by default. Set to `true` when the player activates the Auto-Mark toggle.
- Reset to `false` on `loadStage()` (new stage); preserved across `restart()` within a
  session per FR-012 (only resets when starting a *new stage*, not when restarting).
- Controls whether `cycleCell` populates `autoMarksByQueen` on queen placement.

---

## Derived at Render Time

```
markedCells: Set<CellKey>
```
- Computed in `PuzzlePage` before rendering `Board`.
- Union of `manualMarks` and all arrays in `autoMarksByQueen`.
- Passed to `Board` → `Cell` to determine `isMarked` per cell.
- Pattern mirrors existing `ConflictMap` derivation.

```typescript
// Derivation (PuzzlePage)
const markedCells = useMemo(() => {
  const set = new Set<CellKey>(manualMarks)
  for (const cells of Object.values(autoMarksByQueen)) {
    for (const key of cells) set.add(key as CellKey)
  }
  return set
}, [manualMarks, autoMarksByQueen])
```

---

## State Transitions — `cycleCell(coord)`

```
GIVEN cell at coord:

  HAS QUEEN  →  remove queen
                delete autoMarksByQueen[queenKey]
                (manual marks for other cells unaffected)

  IS MARKED  →  place queen at coord
  (manual        remove coord from manualMarks (if present)
   or auto)      if autoMarkEnabled: populate autoMarksByQueen[queenKey]
                 start timer if first queen

  IS EMPTY   →  add coord to manualMarks
```

---

## State Transitions — `toggleAutoMark()`

```
OFF → ON:
  set autoMarkEnabled = true
  for each placed queen: compute computeInvalidationSet(queen, stage)
                         populate autoMarksByQueen[queenKey]

ON → OFF:
  set autoMarkEnabled = false
  (existing auto-marks remain — spec scenario 6)
```

---

## `computeInvalidationSet` — Pure Function

```
input:  queen: CellCoord, stage: Stage
output: CellCoord[]

Collects all cells (r, c) where r ≠ queen.row OR c ≠ queen.col (i.e., not the queen itself) AND:
  - r === queen.row                                  (same row)
  - c === queen.col                                  (same column)
  - |r - queen.row| <= 1 && |c - queen.col| <= 1     (adjacent, including diagonals)
  - stage.grid[r][c] === stage.grid[queen.row][queen.col]  (same region)

A cell matching ANY of the four conditions is included exactly once (deduplication required).
```

---

## Entity Relationships

```
GameSession
  ├── queens:             Queen[]           (existing)
  ├── manualMarks:        CellKey[]         (NEW)
  ├── autoMarksByQueen:   Record<CK,CK[]>   (NEW)
  └── autoMarkEnabled:    boolean           (NEW)

PuzzlePage (render)
  ├── conflicts:    ConflictMap    ← deriveConflicts(queens, stage)  [existing]
  └── markedCells:  Set<CellKey>  ← union(manualMarks, autoMarksByQueen values)  [NEW]

Board
  └── Cell (per cell)
        ├── hasQueen:   boolean   ← queens includes coord
        ├── isMarked:   boolean   ← markedCells has cellKey  [NEW]
        └── isConflict: boolean   ← conflicts has cellKey
```
