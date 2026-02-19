# Tasks: Settings Tab with Persisted Auto-Mark Toggle

**Input**: Design documents from `/specs/006-settings-automark/`
**Branch**: `006-settings-automark`
**Date**: 2026-02-19
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in all task descriptions

---

## Phase 1: Setup (Shared Types)

**Purpose**: Add new types and remove dead type signatures — foundational for ALL subsequent work. No code can compile without this.

- [x] T001 Add `AppSettings` and `SettingsState` interfaces to `src/types/index.ts`; remove `toggleAutoMark: () => void` from `GameStoreState`

**Checkpoint**: TypeScript types compile; all dependent files show errors only for removed `toggleAutoMark` (expected — resolved in Phase 4)

---

## Phase 2: Foundational (Settings Store)

**Purpose**: New persistent settings store that ALL user stories depend on. Must be complete and tested before any UI work.

**⚠️ CRITICAL**: User story 1 cannot be implemented until this phase is complete (UI reads from this store)

- [x] T002 Write RED unit tests for `useSettingsStore` in `tests/logic/settings-store.test.ts` — cover: default `autoMarkEnabled: true`, `setAutoMark(false)`, `setAutoMark(true)`, idempotent call
- [x] T003 Implement `src/stores/settings-store.ts` using Zustand `persist` middleware (key: `queems-settings`, default `autoMarkEnabled: true`) — confirm T002 tests turn GREEN

**Checkpoint**: `pnpm vitest tests/logic/settings-store.test.ts` → all tests GREEN

---

## Phase 3: User Story 1 — Access and Toggle Auto-Mark from Settings (Priority: P1) 🎯 MVP

**Goal**: Stage Select page has "Stages" / "Settings" pill tab navigation; Settings tab contains a working, persisted Auto-mark toggle defaulting to ON.

**Independent Test**: Navigate to `/`, click Settings tab, toggle Auto-mark OFF, hard-refresh — confirm tab shows the toggle still OFF and `queems-settings` key in localStorage contains `false`.

### Implementation for User Story 1

- [x] T004 [US1] Add `activeTab` local state (`'stages' | 'settings'`) and render pill tab bar ("Stages" / "Settings") to `src/pages/StageSelectPage.tsx` — active tab: `bg-amber-400 text-white rounded-full`, inactive: `text-gray-500 hover:text-gray-700`
- [x] T005 [US1] Implement Settings tab content in `src/pages/StageSelectPage.tsx`: read `autoMarkEnabled` and `setAutoMark` from `useSettingsStore`; render styled toggle switch (`role="switch"`, `aria-checked`, amber-400 track when ON / gray-300 when OFF, CSS `transition` on thumb translate, descriptive label and supporting sub-text)

**Checkpoint**: User Story 1 fully functional — Settings tab visible, toggle persists across page reload, default is ON for new users

---

## Phase 4: User Story 2 — Auto-Mark Setting Applies in Puzzle (Priority: P2)

**Goal**: When a puzzle loads, `autoMarkEnabled` in the game session is initialized from the persisted setting (not hard-coded `false`). The Auto-mark toggle is removed from `PuzzlePage`. `toggleAutoMark` action is deleted.

**Independent Test**: Set Auto-mark OFF in Settings, navigate to any puzzle, place a queen — no cells auto-mark. Set it ON, start a new puzzle, place a queen — invalid cells auto-mark.

### Implementation for User Story 2

- [x] T006 [US2] Update `tests/logic/game-store.test.ts`: remove `toggleAutoMark` describe block; add test asserting `loadStage` sets `autoMarkEnabled` to the value returned by `useSettingsStore.getState()` — confirm test is RED before T007
- [x] T007 [P] [US2] Update `src/stores/game-store.ts`: in `loadStage`, replace `autoMarkEnabled: false` with `autoMarkEnabled: useSettingsStore.getState().autoMarkEnabled`; remove entire `toggleAutoMark` action — confirm T006 tests turn GREEN
- [x] T008 [P] [US2] Remove Auto-mark toggle UI (label + checkbox, currently lines 143–153) and `toggleAutoMark` from destructured `useGameStore()` in `src/pages/PuzzlePage.tsx`

**Checkpoint**: `pnpm vitest tests/logic/game-store.test.ts` → all GREEN; puzzle page has no toggle; auto-mark behavior follows Settings preference

---

## Phase 5: User Story 3 — Visually Cohesive Settings Tab (Priority: P3)

**Goal**: The Settings tab looks and feels native to the app: amber accent for active tab, smooth toggle animation, accessible labels, and descriptive supporting text that non-technical users understand.

**Independent Test**: View Settings tab side-by-side with Stage Select header and StageCard components — typography, spacing, and color usage are visually consistent.

### Implementation for User Story 3

- [x] T009 [P] [US3] Refine tab bar in `src/pages/StageSelectPage.tsx`: add `transition-colors duration-150` on tab buttons; ensure `aria-selected` and `role="tab"` / `role="tablist"` / `role="tabpanel"` ARIA attributes are present for full keyboard accessibility
- [x] T010 [P] [US3] Refine Settings tab content in `src/pages/StageSelectPage.tsx`: add supporting description text below toggle label (e.g. "Automatically marks cells that would violate the rules when you place a queen"); confirm toggle thumb uses `transition-transform duration-200`; ensure toggle container has adequate touch target size (`min-h-[44px]`)

**Checkpoint**: All three user stories work together; visual design passes side-by-side comparison with existing components

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify full integration, confirm build health, and update project documentation.

- [x] T011 Run `pnpm vitest` and confirm all tests pass (settings-store + game-store + existing suites)
- [x] T012 [P] Run `pnpm eslint src --ext .ts,.tsx` and resolve any lint errors introduced by this feature
- [x] T013 [P] Run `pnpm build` and confirm the production build succeeds with no TypeScript errors
- [x] T014 Update `CLAUDE.md` Recent Changes section: add `006-settings-automark: Settings tab on Stage Select — Auto-mark toggle moved, persisted (queems-settings), new settings-store`

**Checkpoint**: `pnpm build` exits 0; all tests GREEN; CLAUDE.md updated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001 (types); BLOCKS US1 implementation
- **Phase 3 (US1)**: Depends on Phase 2 completion (T003 GREEN)
- **Phase 4 (US2)**: Depends on Phase 2 completion; US1 not required (different files)
- **Phase 5 (US3)**: Depends on Phase 3 (refines same UI)
- **Phase 6 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2 (settings store) — no dependency on US2 or US3
- **US2 (P2)**: Requires Phase 2 (settings store) — no dependency on US1 or US3; can run in parallel with US1
- **US3 (P3)**: Requires US1 Phase 3 (refines the same component)

### Within Each Phase

- T002 (write RED tests) MUST complete and FAIL before T003 (implementation) — Constitution IV
- T006 (write RED tests) MUST complete and FAIL before T007 (implementation)
- T007 and T008 are marked [P] — different files, safe to run after T006

### Parallel Opportunities

- After T001: T002 can start immediately
- After T003 (Phase 2 done): T004 (US1) and T006 (US2 tests) can start in parallel
- After T006: T007 and T008 can run in parallel (different files)
- After T004: T005 can start immediately (same file, sequential)
- T009 and T010 can run in parallel (same file but independent sections — or treat as one task if preferred)
- T011, T012, T013 can run in parallel in the final polish phase

---

## Parallel Example: Phase 4 (US2)

```text
Step 1 — sequential:
  T006: Update tests/logic/game-store.test.ts (write RED tests)

Step 2 — parallel (after T006 is confirmed RED):
  Task A: T007 — Update src/stores/game-store.ts (loadStage + remove toggleAutoMark)
  Task B: T008 — Remove toggle from src/pages/PuzzlePage.tsx
```

## Parallel Example: Phase 3+4 (after Phase 2)

```text
After T003 is GREEN, two tracks can proceed independently:

Track 1 — User Story 1:
  T004 → T005

Track 2 — User Story 2:
  T006 → (T007 ∥ T008)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 (types)
2. Complete Phase 2: T002 → T003 (settings store, TDD)
3. Complete Phase 3: T004 → T005 (Settings tab UI)
4. **STOP and VALIDATE**: Open `/`, click Settings, toggle, reload — persistence works
5. Ready to demo US1 independently

### Incremental Delivery

1. Phase 1 + Phase 2 → Settings store ready
2. Phase 3 (US1) → Tab UI + toggle functional — demo-able MVP
3. Phase 4 (US2) → Gameplay respects setting; PuzzlePage cleaned up
4. Phase 5 (US3) → Visual polish and accessibility
5. Phase 6 → Full build validation

### Full Sequential Order (single developer)

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014
```

---

## Notes

- **TDD discipline**: T002 and T006 are "write RED tests" tasks — confirm FAIL before implementing the corresponding store/action changes
- **No new npm dependencies**: All implementation uses existing Zustand, Tailwind v4, React — `pnpm install` not needed
- **[P] tasks**: Different files, no shared state — safe to run in parallel
- Each checkpoint is a valid commit point
- The toggle in PuzzlePage (T008) can be removed independently of the game-store changes (T007) — different files
