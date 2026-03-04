# Implementation Plan: Stage Select Pagination

**Branch**: `008-stage-select-pagination` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/008-stage-select-pagination/spec.md`

## Summary

Add client-side pagination to the Stages tab on the Stage Select page. Currently all 23 stage cards are rendered in a single scrolling grid. The change introduces a fixed page size of 12 (3 columns × 4 rows), ephemeral `currentPage` state in `StageSelectPage`, and a new focused `Pagination` component with Previous/Next controls and a "N / M" indicator.

## Technical Context

**Language/Version**: TypeScript 5 (strict)
**Primary Dependencies**: React 19, Tailwind CSS v4, Lucide React, clsx/tailwind-merge
**Storage**: N/A — pagination state is ephemeral; no localStorage changes
**Testing**: Vitest 2 + @testing-library/react
**Target Platform**: Web SPA (Vite 6, localhost:5173)
**Project Type**: Single-project SPA
**Performance Goals**: Instantaneous page switching (zero network calls; pure array slice)
**Constraints**: No new npm dependencies; no changes to game-logic modules; no changes to existing stores
**Scale/Scope**: 23 stages currently; page size = 12; pagination visible immediately (2 pages)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | `spec.md` exists and is fully populated |
| II. Puzzle Rule Integrity | ✅ PASS | No game-logic modules touched |
| III. Component-First Design | ✅ PASS | Pagination controls extracted to dedicated `Pagination.tsx` |
| IV. Test-First for Game Logic | ✅ PASS | No new game-logic modules; no TDD required |
| V. Simplicity / YAGNI | ✅ PASS | `useState` only, no new store, no new dependencies |

**Post-design re-check**: All principles still pass after Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/008-stage-select-pagination/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── checklists/
│   └── requirements.md  ← Spec quality checklist
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Pagination.tsx        ← NEW: Prev/Next buttons + "N / M" indicator
└── pages/
    └── StageSelectPage.tsx   ← MODIFIED: currentPage state + slice + <Pagination>

tests/                        ← No new test files required (UI-only feature)
```

**Structure Decision**: Single-project SPA (existing structure). One new component file, one modified page file. No contracts directory (pure UI, no API surface).

## Phase 0: Research

**Status**: Complete — see [research.md](./research.md)

Key decisions resolved:
- **State location**: Local `useState` in `StageSelectPage` (ephemeral per spec)
- **Page size**: 12 cards / page (3 cols × 4 rows grid alignment)
- **Controls component**: Dedicated `Pagination.tsx` (Constitution III compliance)

## Phase 1: Design & Contracts

**Status**: Complete

### Data Model

See [data-model.md](./data-model.md). Summary:

- New state field: `currentPage: number` (default `1`) in `StageSelectPage`
- New constant: `PAGE_SIZE = 12`
- New component props: `PaginationProps { currentPage, totalPages, onPrev, onNext }`
- Derived values computed inline: `visibleStageIds`, `totalPages`, `hasPrev`, `hasNext`
- No persistent state, no store changes

### Contracts

No API contracts — this is a pure UI feature with no backend surface. No `contracts/` directory needed.

### Component Design

#### `Pagination.tsx`

```
Props: { currentPage: number, totalPages: number, onPrev: () => void, onNext: () => void }

Render null when totalPages <= 1 (FR-006)

Layout:
  [ < Prev ]  [ N / M ]  [ Next > ]

- "< Prev" button: disabled when currentPage === 1
- "Next >" button: disabled when currentPage === totalPages
- Indicator: "{currentPage} / {totalPages}"
```

#### `StageSelectPage.tsx` changes

```
Add: const [currentPage, setCurrentPage] = useState(1)
Reset: setCurrentPage(1) on tab switch (when activeTab changes away from 'stages')
Derive: const totalPages = Math.ceil(STAGE_IDS.length / PAGE_SIZE)
Derive: const visibleIds = STAGE_IDS.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE)
Replace: STAGE_IDS.map(...) → visibleIds.map(...)
Add below grid: <Pagination currentPage={currentPage} totalPages={totalPages}
                            onPrev={() => setCurrentPage(p => p - 1)}
                            onNext={() => setCurrentPage(p => p + 1)} />
```

### Quickstart

See [quickstart.md](./quickstart.md).

## Complexity Tracking

No constitution violations. No entries required.
