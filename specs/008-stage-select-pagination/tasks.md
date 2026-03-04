# Tasks: Stage Select Pagination

**Input**: Design documents from `specs/008-stage-select-pagination/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: No test tasks generated — no game-logic modules introduced; spec does not request TDD (Constitution IV applies only to `lib/` and `stores/`).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared type definition that both the component and page will consume.

- [x] T001 Add `PaginationProps` interface to `src/types/index.ts` (`{ currentPage: number, totalPages: number, onPrev: () => void, onNext: () => void }`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `Pagination` component shell — required before either StageSelectPage wiring (US1) or indicator work (US2) can proceed.

**⚠️ CRITICAL**: US1 and US2 implementation tasks cannot start until this phase is complete.

- [x] T002 Create `src/components/Pagination.tsx` — functional component accepting `PaginationProps`; renders `null` when `totalPages <= 1`; renders Prev button (disabled when `currentPage === 1`) and Next button (disabled when `currentPage === totalPages`); use `cn()` for conditional disabled styles; buttons use Tailwind classes consistent with existing UI (amber-400 accent, gray tones)

**Checkpoint**: Foundation ready — US1 and US2 can now proceed in parallel

---

## Phase 3: User Story 1 — Browse Stages One Page at a Time (Priority: P1) 🎯 MVP

**Goal**: Display 12 stage cards per page with working Prev/Next navigation replacing the current single scrolling grid.

**Independent Test**: Load `/`, confirm exactly 12 cards visible on page 1. Click Next → different 11 cards appear. Click Prev → original 12 return. Prev disabled on page 1; Next disabled on page 2.

### Implementation for User Story 1

- [x] T003 [P] [US1] Modify `src/pages/StageSelectPage.tsx` — add `const PAGE_SIZE = 12` constant; add `const [currentPage, setCurrentPage] = useState(1)` state; derive `const totalPages = Math.ceil(STAGE_IDS.length / PAGE_SIZE)` and `const visibleIds = STAGE_IDS.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)`; replace `STAGE_IDS.map(...)` with `visibleIds.map(...)`; render `<Pagination currentPage={currentPage} totalPages={totalPages} onPrev={() => setCurrentPage(p => p - 1)} onNext={() => setCurrentPage(p => p + 1)} />` below the stage grid inside the `panel-stages` tabpanel

**Checkpoint**: User Story 1 fully functional — pagination navigates between pages with correct card subsets

---

## Phase 4: User Story 2 — Know Position Within All Stages (Priority: P2)

**Goal**: Display a "N / M" page indicator between the Prev and Next buttons so users know where they are.

**Independent Test**: Load Stages tab and confirm "1 / 2" indicator is visible. Click Next → indicator updates to "2 / 2".

### Implementation for User Story 2

- [x] T004 [P] [US2] Update `src/components/Pagination.tsx` — add a `<span>` element between the Prev and Next buttons displaying `{currentPage} / {totalPages}`; style with `text-sm text-gray-500 font-medium` Tailwind classes consistent with existing typography

**Checkpoint**: User Story 2 functional — page indicator displays and updates on navigation

---

## Phase 5: User Story 3 — Return to First Page When Re-entering Stages Tab (Priority: P3)

**Goal**: Reset `currentPage` to 1 whenever the user switches away from and back to the Stages tab.

**Independent Test**: Navigate to page 2, click Settings tab, click Stages tab — confirm page 1 is shown and indicator reads "1 / 2".

### Implementation for User Story 3

- [x] T005 [US3] Update `src/pages/StageSelectPage.tsx` — in the `setActiveTab` call sites (both tab buttons' `onClick` handlers), reset pagination by calling `setCurrentPage(1)` whenever the Stages tab is being switched away from; simplest approach: wrap `setActiveTab` calls with a handler that also resets `currentPage`

**Checkpoint**: All three user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility and final validation.

- [x] T006 [P] Update `src/components/Pagination.tsx` — add `aria-label="Previous page"` and `aria-label="Next page"` to the respective buttons; add `aria-current="page"` to the indicator `<span>`; verify `disabled` prop correctly prevents interaction (not just visual styling)
- [x] T007 Run manual smoke test per `specs/008-stage-select-pagination/quickstart.md` — verify all 8 test steps pass; confirm `pnpm build` succeeds with no TypeScript errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 — BLOCKS US1 and US2
- **US1 (Phase 3) and US2 (Phase 4)**: Both depend on T002 — can proceed **in parallel** (different files: `StageSelectPage.tsx` vs `Pagination.tsx`)
- **US3 (Phase 5)**: Depends on T003 (needs `currentPage` state in `StageSelectPage.tsx`)
- **Polish (Phase 6)**: T006 depends on T004; T007 depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Requires T001, T002 → implements T003
- **US2 (P2)**: Requires T001, T002 → implements T004 (parallel with T003)
- **US3 (P3)**: Requires T003 → implements T005

### Parallel Opportunities

- **T003 and T004** can run in parallel after T002 completes (different files: `StageSelectPage.tsx` and `Pagination.tsx`)
- **T006 and T007 prep** can begin in parallel (T006 modifies Pagination; T007 is read-only validation)

---

## Parallel Execution Example: After Foundational

```text
After T002 completes:

  Thread A:  T003 [US1] → modify StageSelectPage.tsx
  Thread B:  T004 [US2] → update Pagination.tsx (add indicator)

  After both complete:
  Thread A:  T005 [US3] → tab-switch reset in StageSelectPage.tsx
  Thread B:  T006 [Polish] → aria attributes in Pagination.tsx

  Final: T007 → smoke test validation
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: User Story 1 (T003)
4. **STOP and VALIDATE**: 12 cards per page, Prev/Next navigation working
5. Deliverable: functional pagination without indicator or tab-reset

### Incremental Delivery

1. T001 → T002 → T003 — MVP: paginated grid working
2. T004 — Enhancement: page indicator added
3. T005 — Enhancement: tab-switch reset added
4. T006 → T007 — Polish: accessibility + final validation

---

## Notes

- Only 2 files change in production code: `src/components/Pagination.tsx` (new) and `src/pages/StageSelectPage.tsx` (modified)
- `PaginationProps` in `src/types/index.ts` follows existing project convention (`StageCardProps` is also there)
- No new npm dependencies
- No store, router, or game-logic changes
- `PAGE_SIZE = 12` lives as a constant in `StageSelectPage.tsx`; `Pagination.tsx` is unaware of page size
- `pnpm build` TypeScript check is the primary correctness gate (strict mode)
