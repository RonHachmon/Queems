# Tasks: Dark Mode

**Input**: Design documents from `/specs/009-dark-mode/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: No test tasks generated — the spec contains no new game logic, and Constitution IV mandates TDD only for `lib/` and `stores/` logic changes. The `darkModeEnabled` boolean is a trivial state addition; no test files are required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies within the phase)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable Tailwind v4's `dark:` variant — required before ANY dark-mode class can be used in any component. One line, zero risk.

- [x] T001 Add `@variant dark (&:where(.dark, .dark *));` directive to `src/assets/index.css` immediately after the `@import "tailwindcss";` line

**Checkpoint**: Run `pnpm build` — must pass with zero errors before continuing.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire up the theme state — store field, TypeScript types, and the DOM-class effect. ALL user stories depend on this being complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Extend `AppSettings` interface (add `darkModeEnabled: boolean`) and `SettingsState` interface (add `setDarkMode: (value: boolean) => void`) in `src/types/index.ts`
- [x] T003 Add `darkModeEnabled` state field (default `false` initially, OS preference handled in T009) and `setDarkMode` action to `src/stores/settings-store.ts`
- [x] T004 Add `useEffect` in `src/App.tsx` that calls `document.documentElement.classList.toggle('dark', darkModeEnabled)` whenever `darkModeEnabled` changes, subscribed via `useSettingsStore`

**Checkpoint**: Foundation ready — toggling `darkModeEnabled` in the Zustand devtools should add/remove the `dark` class on `<html>`. TypeScript must have zero errors (`pnpm build`).

---

## Phase 3: User Story 1 — Toggle Dark Mode from Settings (Priority: P1) 🎯 MVP

**Goal**: User can open Settings tab, toggle Dark Mode on/off, and see the Stage Select page (cards, tab bar, settings panel, timer, header) switch themes immediately. Puzzle region colors are visually unchanged.

**Independent Test**: Open app → Settings tab → toggle Dark Mode switch → verify page background, tab bar, cards, and text flip between light/dark palettes → toggle off → verify return to light. No navigation required.

### Implementation for User Story 1

- [x] T005 [US1] Add Dark Mode toggle switch row (label: "Dark mode", description: "Switch to a darker color scheme") to the Settings panel in `src/pages/StageSelectPage.tsx`, wired to `darkModeEnabled` and `setDarkMode` from `useSettingsStore`
- [x] T006 [US1] Add `dark:` Tailwind variants to all existing non-toggle elements in `src/pages/StageSelectPage.tsx`: page wrapper (`dark:bg-gray-900`), header text (`dark:text-gray-100`), subtitle text (`dark:text-gray-400`), tab bar (`dark:bg-gray-800`), inactive tab text (`dark:text-gray-400 dark:hover:text-gray-200`), settings card (`dark:bg-gray-800 dark:border-gray-700 dark:divide-gray-700`), setting label text, description text, and footer hint
- [x] T007 [P] [US1] Add `dark:` Tailwind variants to `src/components/StageCard.tsx`: card wrapper (`dark:bg-gray-800 dark:border-gray-700`), stage name text (`dark:text-gray-200`), grid size text (`dark:text-gray-400`)
- [x] T008 [P] [US1] Add `dark:` Tailwind variants to `src/components/Timer.tsx`: timer text (`dark:text-gray-300`)

**Checkpoint**: US1 fully functional. Toggle in Settings switches Stage Select page theme instantly. Stage cards and timer adapt. Puzzle region color classes in `src/components/Board/Cell.tsx` are NOT modified — verify they still display correctly.

---

## Phase 4: User Story 2 — Dark Mode Persists Across Sessions (Priority: P2)

**Goal**: On first launch with no stored preference, the app reads the OS dark/light mode setting. After any toggle, the preference survives a full browser close/reopen.

**Independent Test**: Enable Dark Mode → close and reopen the browser tab → verify app launches in dark mode. Clear localStorage → reload with OS in dark mode → verify app opens dark without any toggle.

### Implementation for User Story 2

- [x] T009 [US2] In `src/stores/settings-store.ts`, initialise `darkModeEnabled` from `window.matchMedia('(prefers-color-scheme: dark)').matches` (computed once at module load, before the store is created) so that sessions with no stored preference default to the OS setting

**Checkpoint**: US2 fully functional. Persistence is provided automatically by Zustand `persist` middleware (already configured on `queems-settings`). Verify: toggle on → reload → still dark; clear localStorage → reload with OS dark preference → opens dark.

---

## Phase 5: User Story 3 — Dark Mode Applies to All Screens (Priority: P3)

**Goal**: Both the Puzzle page and the Completion Modal are fully themed. Navigating between Stage Select and Puzzle page with Dark Mode enabled shows consistent dark styling throughout.

**Independent Test**: Enable Dark Mode in Settings → navigate to a puzzle → verify page background, header buttons, hint text, and bottom controls are themed → solve the puzzle → verify Completion Modal card, text, and buttons are themed.

### Implementation for User Story 3

- [x] T010 [P] [US3] Add `dark:` Tailwind variants to `src/pages/PuzzlePage.tsx`: page wrapper (`dark:bg-gray-900`), "Menu" back-button text (`dark:text-gray-400 dark:hover:text-gray-200`), "Stage not found" error text (`dark:text-gray-400`), Undo/Reset button text and icons (`dark:text-gray-400 dark:hover:text-gray-200`), hint paragraph (`dark:text-gray-500`)
- [x] T011 [P] [US3] Add `dark:` Tailwind variants to `src/components/CompletionModal.tsx`: modal card (`dark:bg-gray-800`), "Puzzle Solved!" heading (`dark:text-gray-100`), time display (`dark:text-gray-200`), "Best:" text (`dark:text-gray-400`), "Play Again" button (`dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200`), "Menu" button (already `bg-gray-900` — verify it reads correctly in dark mode, adjust to `dark:bg-gray-700` if needed)

**Checkpoint**: All three user stories independently functional. Navigate freely between Stage Select and Puzzle page in both light and dark mode — both screens are consistently themed. Completion Modal appears fully themed.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation of intentional non-changes.

- [x] T012 Confirm `src/components/Board/Cell.tsx` has NO `dark:` variants on `bg-region-*` classes — region colors are intentionally preserved across themes (read the file and verify)
- [x] T013 [P] Confirm `src/components/Pagination.tsx` (if it uses color classes) has appropriate `dark:` variants; add them if missing
- [ ] T014 Run the manual QA checklist from `specs/009-dark-mode/quickstart.md` (Step 7) covering all 7 verification points

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (CSS variant must exist before `dark:` classes work)
- **User Story Phases (3–5)**: All depend on Phase 2 completion (store, types, App effect must exist)
  - US1 (Phase 3) has no dependency on US2 or US3
  - US2 (Phase 4) has no implementation dependency on US1, but the toggle must exist to test it manually → test after Phase 3
  - US3 (Phase 5) has no implementation dependency on US1/US2 (different files), but navigate + test requires the toggle
- **Polish (Phase 6)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on US2 or US3
- **US2 (P2)**: Can start after Phase 2 — T009 is a one-line store change, independent of US1 files
- **US3 (P3)**: Can start after Phase 2 — T010/T011 touch different files than US1

### Within Each User Story

- T005 before T006 (same file — add toggle row first, then theme the rest of the page)
- T007 and T008 are parallel with each other and independent of T005/T006 (different files)
- T010 and T011 are parallel with each other (different files)

---

## Parallel Example: User Story 1 (Phase 3)

```
Sequential:   T005 (toggle row) → T006 (page dark: variants)
Parallel:     T007 (StageCard.tsx)  ─┐
              T008 (Timer.tsx)      ─┴─ both can run concurrently with T005/T006
```

## Parallel Example: User Story 3 (Phase 5)

```
Parallel:     T010 (PuzzlePage.tsx)      ─┐
              T011 (CompletionModal.tsx)  ─┴─ different files, no shared state
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: CSS setup (T001)
2. Complete Phase 2: Foundation — types, store, App effect (T002–T004)
3. Complete Phase 3: US1 — toggle UI + StageSelectPage + StageCard + Timer (T005–T008)
4. **STOP and VALIDATE**: Toggle dark mode in Settings — entire Stage Select screen themes instantly
5. Ship MVP if ready — users can already toggle dark mode

### Incremental Delivery

1. Phase 1 + Phase 2 → Core wiring (invisible to users)
2. Phase 3 → MVP: Stage Select fully themed, toggle accessible
3. Phase 4 → Persistence + OS default (quality upgrade — no UI change)
4. Phase 5 → Full coverage: Puzzle page + Modal themed
5. Phase 6 → Polish + QA sign-off

---

## Notes

- [P] tasks = different files, no intra-phase dependencies
- No new files are created by any task — all changes are additions to existing files
- `src/components/Board/Cell.tsx` is explicitly excluded from all dark-mode styling (region colors are invariant)
- Commit after each phase checkpoint for clean rollback points
- Run `pnpm build` after each phase to catch TypeScript errors early
