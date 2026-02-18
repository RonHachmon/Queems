# Implementation Plan: Cell X-Marking with Auto-Mark Assistance

**Branch**: `002-mark-cells` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-mark-cells/spec.md`

## Summary

Add a three-state cell click cycle (empty → X-marked → queen → empty) and an optional
Auto-Mark toggle that automatically X-marks every cell invalidated by a placed queen.
Implemented as a pure logic function (`computeInvalidationSet`) in the existing lib layer,
with mark state stored in the ephemeral Zustand game store, and X rendering added to
`Cell.tsx` via a new `isMarked` prop.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, no `any`)
**Primary Dependencies**: React 19, Zustand 5, Framer Motion v11, Lucide React, Tailwind CSS v4
**Storage**: No new storage — mark state is ephemeral (game session only, not persisted)
**Testing**: Vitest 2 + @testing-library/react (TDD mandatory for `computeInvalidationSet`)
**Target Platform**: Web SPA (Vite 6, `http://localhost:5173`)
**Project Type**: Single-project web application
**Performance Goals**: X mark appears within 100 ms of click (SC-001/SC-003); board is max
9×9 = 81 cells so all derivations are O(N²) with N ≤ 9 — negligible overhead
**Constraints**: Mark state must not affect `deriveConflicts` or `isSolved` logic (FR-010)
**Scale/Scope**: Single-player local browser game; no server, no persistence for marks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | `specs/002-mark-cells/spec.md` reviewed and complete |
| II. Puzzle Rule Integrity | ✅ PASS | `computeInvalidationSet` is a pure function in `lib/board-state.ts`; X marks are cosmetic and do not touch `deriveConflicts` or `isSolved` |
| III. Component-First | ✅ PASS | `Cell.tsx` gets a new `isMarked` prop; no game logic enters JSX; `Board.tsx` receives `markedCells` as a derived prop |
| IV. Test-First for Logic | ✅ PASS | Tests for `computeInvalidationSet` MUST be written and confirmed RED before implementation |
| V. YAGNI | ✅ PASS | Only the three-state cycle and auto-mark toggle are implemented; no speculative abstractions |

**Post-Phase 1 re-check**: All gates still pass. The data model keeps marks in the ephemeral
store (no new persistence), derivation follows the existing `ConflictMap` pattern, and the
component contract is minimal.

## Project Structure

### Documentation (this feature)

```text
specs/002-mark-cells/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── typescript-interfaces.ts   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (changes only)

```text
src/
├── types/index.ts              ← Add CellKey[] mark fields, isMarked to CellProps,
│                                  markedCells to BoardProps, cycleCell/toggleAutoMark actions
├── lib/
│   └── board-state.ts          ← Add computeInvalidationSet() pure function
├── stores/
│   └── game-store.ts           ← Add manualMarks, autoMarksByQueen, autoMarkEnabled state;
│                                  add cycleCell, toggleAutoMark actions; update restart/loadStage
├── components/
│   └── Board/
│       ├── Cell.tsx             ← Add isMarked prop; render X icon; update aria-label
│       └── Board.tsx            ← Add markedCells prop; derive isMarked per cell
└── pages/
    └── PuzzlePage.tsx           ← Derive markedCells; swap to cycleCell; add Auto-Mark toggle UI

tests/
└── logic/
    └── board-state.test.ts      ← Add TDD tests for computeInvalidationSet (RED first)
```

**Structure Decision**: Single-project web application. No new directories required.
All changes are additive modifications to existing files following established patterns
(`lib/` for pure logic, `stores/` for state, `components/` for UI).

## Phase 0: Research Summary

See [research.md](./research.md) for full rationale. Key decisions:

1. **Three-state cycle via `cycleCell`**: New store action replaces `placeOrRemoveQueen` in
   UI call sites. Old action preserved for backward compatibility during the branch.

2. **Mark storage**: `manualMarks: CellKey[]` + `autoMarksByQueen: Record<CellKey, CellKey[]>`
   in the ephemeral store. Chosen over per-cell objects for sparse efficiency and clean
   per-queen retraction.

3. **`computeInvalidationSet`** in `lib/board-state.ts`: Pure function, same four constraint
   rules as `deriveConflicts`, independently testable.

4. **Auto-Mark toggle state** in game store (not local `useState`) so `cycleCell` can read
   it without prop drilling.

5. **`markedCells: Set<CellKey>`** derived in `PuzzlePage` (mirrors `ConflictMap` pattern)
   and passed down to `Board` → `Cell`.

## Phase 1: Design & Contracts

See [data-model.md](./data-model.md) and [contracts/typescript-interfaces.ts](./contracts/typescript-interfaces.ts).

### Key design decisions

**`computeInvalidationSet` deduplication**: A corner cell can satisfy multiple conditions
simultaneously (e.g., adjacent AND same row). The function must deduplicate. Strategy: track
seen cells with a `Set<CellKey>` internally, push to result array only once.

**Auto-Mark on toggle-ON with existing queens** (FR-008): `toggleAutoMark` iterates all
current queens and computes their invalidation sets, merging into `autoMarksByQueen`. This
ensures existing queens are accounted for when the player enables the toggle mid-game.

**Manual mark vs auto mark on the same cell** (FR-007): Because they are stored separately
(`manualMarks` array vs `autoMarksByQueen` record), removing a queen only deletes
`autoMarksByQueen[queenKey]` — the cell may still appear in `manualMarks` and thus remain
visually marked.

**Click priority when a cell has both manual + auto marks**: The cell is visually X-marked
regardless of source. Clicking it advances to queen state (FR-009). The manual mark is
removed from `manualMarks`; auto-marks from other queens (in other `autoMarksByQueen`
entries) are unaffected.

**Timer start**: Unchanged — timer starts on the first queen placement. X-marking alone does
not start the timer.

**Reset / LoadStage**: Both clear `manualMarks` and `autoMarksByQueen`. `loadStage` also
resets `autoMarkEnabled` to `false` (FR-012). `restart` preserves `autoMarkEnabled` (same
session, same stage).

### `cycleCell` logic (pseudocode)

```
cycleCell(coord):
  if isSolved → return (no-op)

  key = `${coord.row}:${coord.col}`
  hasQueen = queens contains coord
  isMarked = markedCells contains key  (derived from manualMarks + autoMarksByQueen)

  if hasQueen:
    newQueens = queens without coord
    newAutoMarks = autoMarksByQueen without entry for key
    update: queens, autoMarksByQueen, check isSolved

  else if isMarked:
    newManualMarks = manualMarks without key
    newQueens = [...queens, coord]
    timerStartedAt = first queen? Date.now() : existing
    if autoMarkEnabled:
      invalidCells = computeInvalidationSet(coord, stage)
      newAutoMarks[key] = invalidCells mapped to CellKeys
    update: queens, manualMarks, autoMarksByQueen, timerStartedAt, check isSolved

  else (empty):
    newManualMarks = [...manualMarks, key]
    update: manualMarks
```

## Complexity Tracking

No constitution violations. No complexity justification required.
