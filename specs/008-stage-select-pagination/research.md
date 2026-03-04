# Research: Stage Select Pagination

**Feature**: 008-stage-select-pagination
**Date**: 2026-03-04
**Status**: Complete — no NEEDS CLARIFICATION markers to resolve

---

## Decision 1: Pagination State Location

**Decision**: Ephemeral local `useState` inside `StageSelectPage`
**Rationale**: The spec explicitly states pagination state is ephemeral and must reset on tab switch and page load. A Zustand store would add persistent complexity for zero benefit. `useState` is the minimum viable mechanism.
**Alternatives considered**:
- Zustand store — rejected; overkill for transient UI state, violates YAGNI (Constitution V)
- URL query params (e.g., `?page=2`) — rejected; spec does not require deep-linking to a page; adds routing complexity for no user value
- `useReducer` — rejected; a single `currentPage: number` has no multi-field state to justify a reducer

---

## Decision 2: Page Size

**Decision**: 12 cards per page (constant, not configurable)
**Rationale**: 12 = 3 columns × 4 rows, which aligns perfectly with the existing responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). At the current 23-stage count, this gives 2 pages (12 + 11), making pagination immediately visible and functional. The spec documents this assumption explicitly.
**Alternatives considered**:
- 9 per page (3×3) — produces 3 pages, slightly more navigation; no ergonomic advantage for 23 items
- 6 per page (3×2) — 4 pages; excessive for 23 stages, adds navigation friction
- Configurable page size — rejected; YAGNI (Constitution V), spec does not require it

---

## Decision 3: Pagination Controls Component

**Decision**: Extract a dedicated `Pagination.tsx` component with Previous/Next buttons and a "N / M" page indicator
**Rationale**: Constitution III mandates small, focused components with a single responsibility. Inlining pagination controls in `StageSelectPage` would violate Component-First Design. A separate component is independently testable.
**Alternatives considered**:
- Inline JSX in `StageSelectPage` — rejected; violates Constitution III Component-First Design
- Third-party pagination library — rejected; YAGNI (Constitution V); the controls needed are trivially simple

---

## Codebase Findings

- Total stages: **23** (`STAGE_IDS: string[]`, 14 Feb 2026 + 4 Mar 2026 + remainder)
- Current rendering: all 23 cards in one grid, no slicing
- `StageCard` props: `{ stage: Stage, bestTime: number | undefined, onSelect: (id: string) => void }`
- No existing pagination components or patterns in the codebase
- `STAGES` is a `Record<string, Stage>` keyed by stage id; `STAGE_IDS` is the ordered `string[]`

---

## Summary: No NEEDS CLARIFICATION Markers

All unknowns resolved using codebase inspection and spec assumptions. Ready for Phase 1 design.
