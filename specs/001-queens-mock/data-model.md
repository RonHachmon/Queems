# Data Model: Queems Queens Puzzle Mock

**Branch**: `001-queens-mock` | **Date**: 2026-02-17

---

## Core Types

### CellCoord

A position on the puzzle board, zero-indexed.

```ts
interface CellCoord {
  row: number  // 0-based row index
  col: number  // 0-based column index
}
```

---

### RegionId

A branded string identifying a colored region on the board.
Each stage defines its own set of region IDs (e.g., `'red'`, `'blue'`, `'amber'`).

```ts
type RegionId = string
```

---

### Cell

A single tile on the puzzle board. Belongs to exactly one region.

```ts
interface Cell {
  coord: CellCoord
  regionId: RegionId
}
```

---

### Stage

A pre-defined puzzle configuration. Immutable — defined statically in `src/lib/stages/`.

```ts
interface Stage {
  id: string          // e.g. 'stage-01'
  number: number      // display number (1, 2, 3, ...)
  label: string       // display name, e.g. 'Stage 1'
  size: number        // N — board is NxN, N regions, N queens to place
  /**
   * 2D array [row][col] → RegionId.
   * Length: size × size cells.
   * Every RegionId that appears must appear exactly `size` times
   * (not enforced at runtime, enforced by stage definition).
   */
  grid: RegionId[][]
}
```

**Stage validation invariants** (checked in tests, not at runtime):
- `grid.length === size` (N rows)
- `grid[i].length === size` for all i (N cols per row)
- Exactly N distinct RegionIds appear in grid
- Each RegionId appears at least once (no empty region)

---

### Queen

A queen placed on the board. Stored as a `CellCoord`; region is derived from the stage's grid.

```ts
type Queen = CellCoord
```

*Rationale*: Region is always derivable from `stage.grid[queen.row][queen.col]`.
Storing it separately would introduce a redundancy that could go stale.

---

### ConflictMap

Describes which cells are in conflict given the current queen placements.
Derived in real-time by `src/lib/board-state.ts`; never stored in state.

```ts
/**
 * Maps `"row:col"` → true for every cell that is part of a conflict.
 * A cell is in conflict if a queen there violates any rule with another queen,
 * OR if a queen placed elsewhere causes this cell to be flagged.
 */
type ConflictMap = Map<string, true>

// Helper key function used throughout:
// const key = (coord: CellCoord) => `${coord.row}:${coord.col}`
```

---

### GameSession

The ephemeral state of an active puzzle attempt. Stored in `game-store.ts` (Zustand).
Discarded when the player navigates away or restarts.

```ts
interface GameSession {
  stageId: string        // which stage is being played
  queens: Queen[]        // current queen placements (0 to N items)
  timerStartedAt: number | null  // Date.now() timestamp of first move; null = not started
  elapsedSeconds: number         // seconds elapsed (updated by interval while playing)
  isSolved: boolean              // true once all constraints satisfied
  isNewRecord: boolean           // true if isSolved and time < previous best
}
```

**State transitions**:
```
Initial:       queens=[], timerStartedAt=null, elapsedSeconds=0, isSolved=false
After move 1:  queens=[q1], timerStartedAt=Date.now(), elapsedSeconds=0
After move N:  queens=[...], isSolved=true (if all rules satisfied)
After restart: reset to Initial
```

---

### BestTimesState

The persisted best-time records for all stages. Stored in `best-times-store.ts` (Zustand
+ persist middleware → `localStorage` key `queems-best-times`).

```ts
interface BestTimesState {
  /**
   * Maps stageId → fastest completion time in whole seconds.
   * A stage with no record is absent from the map (not 0 or null).
   */
  bestTimes: Record<string, number>
}
```

**Persistence schema** (localStorage value):
```json
{
  "state": {
    "bestTimes": {
      "stage-01": 87,
      "stage-03": 124
    }
  },
  "version": 0
}
```

---

## Derived / Computed Values

These are computed on the fly and never stored:

| Value | Computed from | Where |
|-------|--------------|-------|
| `ConflictMap` | `queens[]` + `stage.grid` | `src/lib/board-state.ts` |
| `isSolved` | `queens.length === stage.size && ConflictMap.size === 0` | `src/lib/board-state.ts` |
| `regionOfCell(coord)` | `stage.grid[coord.row][coord.col]` | `src/lib/rule-validator.ts` |
| `timerDisplay` | `elapsedSeconds` → `"M:SS"` format | `src/components/Timer.tsx` |
| `isNewRecord` | `elapsedSeconds < bestTimes[stageId]` | `game-store.ts` (on solve) |

---

## Rule Validator Contract

The rule validator (`src/lib/rule-validator.ts`) exposes pure functions — no state, no
side effects. These are the functions tested first (TDD, Constitution IV).

```ts
/**
 * Returns true if placing a queen at `candidate` would conflict with any
 * queen in `existingQueens` given the `stage` definition.
 *
 * Violations checked:
 *   1. Same row
 *   2. Same column
 *   3. Immediately adjacent (any of 8 surrounding cells)
 *   4. Same colored region
 */
function wouldConflict(
  candidate: CellCoord,
  existingQueens: Queen[],
  stage: Stage
): boolean

/**
 * Given all current queen placements, returns the full set of conflicting cells.
 * Each cell in the returned map is part of at least one violation.
 * Returns an empty map when no violations exist.
 */
function deriveConflicts(queens: Queen[], stage: Stage): ConflictMap
```

---

## Stage Data Schema (static definitions)

Each stage file (`src/lib/stages/stage-NN.ts`) exports one `Stage` object:

```ts
// src/lib/stages/stage-01.ts  (example — 5×5 board)
import type { Stage } from '@/types'

export const stage01: Stage = {
  id: 'stage-01',
  number: 1,
  label: 'Stage 1',
  size: 5,
  grid: [
    ['red',    'red',    'blue',   'blue',   'blue'  ],
    ['red',    'amber',  'blue',   'green',  'blue'  ],
    ['amber',  'amber',  'amber',  'green',  'purple'],
    ['amber',  'amber',  'green',  'green',  'purple'],
    ['amber',  'teal',   'teal',   'purple', 'purple'],
  ],
}
```

**Region color convention**: RegionIds are lowercase color names (strings).
The UI maps these to Tailwind background-color classes via a lookup table in `src/lib/region-colors.ts`.

---

## Entity Relationships

```
Stage (static)
  └─ grid: RegionId[][] (NxN)

GameSession (ephemeral, Zustand game-store)
  ├─ stageId → Stage (looked up from stages index)
  └─ queens: Queen[] (CellCoord[])
       └─ derived → ConflictMap (board-state.ts)

BestTimesState (persisted, Zustand best-times-store → localStorage)
  └─ bestTimes: { [stageId]: seconds }
```
