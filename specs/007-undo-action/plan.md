# Implementation Plan: Undo Action and Bottom Controls

**Branch**: `007-undo-action` | **Date**: 2026-03-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-undo-action/spec.md`

## Summary

Add an Undo button and relocate the Reset button to the bottom of the puzzle board. Undo reverses the last user action — a queen placement (with its auto-marks), a queen removal, or a manual X-mark batch (single click or drag gesture). Implemented by extending the Zustand game store with an action-history stack and typed delta entries, adding batch-grouping callbacks to the drag hook, and updating the PuzzlePage layout.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: React 19, Zustand 5, Framer Motion 11, Lucide React, Tailwind CSS v4, clsx + tailwind-merge
**Storage**: N/A (action history is ephemeral — in-memory only, not persisted)
**Testing**: Vitest 2 + @testing-library/react
**Target Platform**: Web SPA (Vite 6, mobile-first layout)
**Project Type**: Single web application
**Performance Goals**: Undo executes in a single synchronous Zustand `set` call; no perceptible delay
**Constraints**: History stack is unbounded for this iteration (no max-size limit); entire session history is kept
**Scale/Scope**: Single PuzzlePage; 5 files modified, 0 new files created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Specification-First | ✅ PASS | `spec.md` completed and validated before this plan |
| II. Puzzle Rule Integrity | ✅ PASS | Undo only manipulates `queens`, `manualMarks`, `autoMarksByQueen` — no changes to rule-validator or board-state logic |
| III. Component-First Design | ✅ PASS | Undo/Reset buttons added to `PuzzlePage.tsx` directly (no game logic in JSX; no new abstraction needed per YAGNI) |
| IV. Test-First for Game Logic | ✅ PASS | `game-store.ts` is a logic module; 10 undo test cases defined in contracts/store-api.md must be written RED before implementation |
| V. Simplicity / YAGNI | ✅ PASS | No new files, no new abstractions; history stored as plain typed array; redo explicitly out of scope |

**Gate result: PASS — proceed to implementation.**

## Project Structure

### Documentation (this feature)

```text
specs/007-undo-action/
├── plan.md              ← this file
├── spec.md              ← feature specification
├── research.md          ← Phase 0 decisions (completed)
├── data-model.md        ← Phase 1 entity and state design (completed)
├── quickstart.md        ← Phase 1 implementation guide (completed)
├── contracts/
│   └── store-api.md     ← store API + hook contract + test contracts (completed)
└── tasks.md             ← Phase 2 output (/speckit.tasks command — NOT created here)
```

### Source Code (files modified by this feature)

```text
src/
├── types/
│   └── index.ts                 ← add UndoAction union; extend GameSession + GameStoreState
├── stores/
│   └── game-store.ts            ← add actionHistory/isBatching/batchBuffer state;
│                                   extend cycleCell with history recording;
│                                   extend addManualMark with batch-buffer append;
│                                   add undo(), startMarkBatch(), commitMarkBatch() actions;
│                                   clear history in loadStage + restart
├── hooks/
│   └── useDragMark.ts           ← add onBatchStart? and onBatchCommit? to options;
│                                   call them on mousedown / mouseup
└── pages/
    └── PuzzlePage.tsx           ← wire batch callbacks to useDragMark;
                                    remove Reset from header;
                                    add bottom controls row (Undo + Reset)

tests/
└── logic/
    └── game-store.test.ts       ← add 10 undo test cases (TDD — RED before implementation)
```

**Structure Decision**: Single web application. All changes are within the existing `src/` tree. No new directories or files are created.

## Complexity Tracking

No constitution violations. Table omitted per template instructions.
