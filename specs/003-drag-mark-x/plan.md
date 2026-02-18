# Implementation Plan: Click-and-Drag X Marking

**Branch**: `003-drag-mark-x` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-drag-mark-x/spec.md`

## Summary

Add click-and-drag X marking to the game board: while holding the mouse button down and
moving the cursor across cells, every empty cell the cursor enters is immediately marked
with an X. A drag is distinguished from a single click by whether the cursor enters a
second grid cell during the press. All drag state is ephemeral, managed by a new
`useDragMark` hook that never touches the Zustand store. A new `addManualMark` store
action marks a cell with X only if it is currently empty, providing a safe, idempotent
interface for the drag hook. The existing three-state click cycle is fully preserved.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, no `any`)
**Primary Dependencies**: React 19, Zustand 5, Framer Motion v11, Lucide React, Tailwind CSS v4
**Storage**: No new storage — drag session state is ephemeral hook-local refs; marks persist
in the existing `manualMarks` field of the ephemeral Zustand game store
**Testing**: Vitest 2 (TDD mandatory for `addManualMark` store action)
**Target Platform**: Web SPA (Vite 6, `http://localhost:5173`), desktop mouse only
**Project Type**: Single-project web application
**Performance Goals**: X mark appears synchronously on `mouseenter` — no debounce, no async;
board is max 9×9 = 81 cells so all checks are O(N) with N ≤ 81 — negligible overhead
**Constraints**: Drag MUST NOT modify queens; click cycle MUST be unchanged when no drag
occurs; touch/pointer abstraction is out of scope per spec Assumptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | `specs/003-drag-mark-x/spec.md` reviewed and complete; all checklist items pass |
| II. Puzzle Rule Integrity | ✅ PASS | `addManualMark` only touches `manualMarks[]`; queens, `deriveConflicts`, and `isSolved` are untouched by drag |
| III. Component-First | ✅ PASS | Drag logic extracted into `useDragMark` hook; Cell/Board receive new props as data; no game logic in JSX |
| IV. Test-First for Logic | ✅ PASS | TDD tests for `addManualMark` MUST be written and confirmed RED before implementation |
| V. YAGNI | ✅ PASS | No undo, no drag-to-queen, no touch support, no visual drag trail — all explicitly out of spec scope |

**Post-Phase 1 re-check**: All gates still pass. Drag state is hook-local refs (not stored in
Zustand), matching the existing ephemeral pattern. Component contract adds exactly two optional
props to Cell and two handler props to Board — minimal footprint.

## Project Structure

### Documentation (this feature)

```text
specs/003-drag-mark-x/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── typescript-interfaces.ts   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created by /speckit.plan)
```

### Source Code (changes only)

```text
src/
├── hooks/
│   └── useDragMark.ts           ← NEW: drag session logic; returns handlers for Board
├── stores/
│   └── game-store.ts            ← ADD addManualMark(coord) action; idempotent empty-cell mark
├── components/
│   └── Board/
│       ├── Cell.tsx             ← ADD onMouseDown?: () => void | onMouseEnter?: () => void props
│       └── Board.tsx            ← ADD onCellMouseDown / onCellMouseEnter callbacks;
│                                   pass drag handlers to each Cell
└── pages/
    └── PuzzlePage.tsx           ← ADD useDragMark(); pass drag handlers to Board;
                                    pass addManualMark as the drag mark action

tests/
└── logic/
    └── game-store.test.ts       ← NEW: TDD for addManualMark (RED-then-GREEN)
```

**Structure Decision**: Single-project web SPA. The new `src/hooks/` directory is a natural
addition alongside the existing `src/stores/` and `src/lib/` directories — all non-JSX
behaviour lives in dedicated modules per Constitution Principle III.
