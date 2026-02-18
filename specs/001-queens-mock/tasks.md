---
description: "Task list for Queems Queens Puzzle Mock"
---

# Tasks: Queems Queens Puzzle Mock

**Input**: Design documents from `/specs/001-queens-mock/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Game-logic modules (rule-validator, board-state, best-times-store) use mandatory TDD
per Constitution IV. UI components are NOT tested (user decision during planning).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks include exact file paths

## Path Conventions

- Single Vite SPA at repository root
- Source: `src/` — `lib/` (pure logic), `stores/` (Zustand), `components/`, `pages/`, `types/`, `assets/`
- Tests: `tests/logic/` (game-logic TDD only)

---

## Phase 1: Setup (Project Scaffolding)

**Purpose**: Bootstrap the Vite project and configure all tooling. No story-specific code.

- [x] T001 Scaffold Vite + React + TypeScript project at repo root: `pnpm create vite@latest . --template react-ts` (overwrites only generated files, keep .specify/ and .claude/ intact)
- [x] T002 Install production dependencies: `pnpm add react-router-dom zustand framer-motion lucide-react clsx tailwind-merge` (run after T001)
- [x] T003 Install dev dependencies: `pnpm add -D tailwindcss@^4 @tailwindcss/vite vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks prettier` (run after T001)
- [x] T004 [P] Configure src/vite.config.ts: add `@vitejs/plugin-react` + `@tailwindcss/vite` plugins, add `resolve.alias: { '@': '/src' }` (depends on T003)
- [x] T005 [P] Configure tsconfig.json: set `"strict": true`, `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`, `"paths": { "@/*": ["src/*"] }`, `"target": "ES2022"` (depends on T003)
- [x] T006 [P] Replace src/App.css and src/index.css: delete both, create src/assets/index.css with `@import "tailwindcss";` and `@theme {}` block (placeholder — region colors added in Polish phase) (depends on T003)
- [x] T007 [P] Create vitest.config.ts at repo root: `environment: 'jsdom'`, `globals: true`, `setupFiles: ['./tests/setup.ts']` (depends on T003)
- [x] T008 [P] Create tests/setup.ts: single line `import '@testing-library/jest-dom'` (depends on T003)
- [x] T009 [P] Create eslint.config.js: typescript-eslint flat config with `@typescript-eslint/no-explicit-any: error`, react-hooks plugin rules (depends on T003)
- [x] T010 [P] Create .prettierrc: `{ "semi": false, "singleQuote": true, "trailingComma": "all", "printWidth": 100 }` (depends on T003)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, utility functions, stage data, and app shell that ALL user stories depend on.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T011 Create src/types/index.ts: define all shared TypeScript interfaces exactly as specified in `specs/001-queens-mock/contracts/typescript-interfaces.ts` — CellCoord, RegionId, Queen, CellKey, ConflictMap, Stage, GameSession, GameStoreState, BestTimesState; also export helper type aliases WouldConflictFn, DeriveConflictsFn, ToggleQueenFn, IsSolvedFn
- [x] T012 [P] Create src/lib/cn.ts: `import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge'; export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }`
- [x] T013 [P] Create src/lib/region-colors.ts: export `REGION_COLORS: Record<string, string>` mapping RegionId strings ('red','blue','amber','green','purple','teal','orange','pink','indigo','lime') to Tailwind background-color class names (e.g. `'bg-red-200'`); these class names must be safe-listed by Tailwind v4
- [x] T014 [P] Create src/lib/stages/stage-01.ts: export `stage01: Stage` — 5×5 board, 5 colored regions (red, blue, amber, green, purple); design a valid Queens puzzle where exactly one solution exists; include grid: RegionId[][]
- [x] T015 [P] Create src/lib/stages/stage-02.ts: export `stage02: Stage` — 6×6 board, 6 colored regions; unique solution
- [x] T016 [P] Create src/lib/stages/stage-03.ts: export `stage03: Stage` — 7×7 board, 7 colored regions; unique solution
- [x] T017 [P] Create src/lib/stages/stage-04.ts: export `stage04: Stage` — 8×8 board, 8 colored regions; unique solution
- [x] T018 [P] Create src/lib/stages/stage-05.ts: export `stage05: Stage` — 8×8 board, 8 colored regions, different region layout from stage-04; unique solution
- [x] T019 Create src/lib/stages/index.ts: export `STAGES: Record<string, Stage>` and `STAGE_IDS: string[]` in display order ['stage-01','stage-02','stage-03','stage-04','stage-05'] (depends on T014–T018)
- [x] T020 [P] Create src/main.tsx: `ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`, import `'./assets/index.css'`
- [x] T021 [P] Create src/App.tsx: `BrowserRouter` wrapping `Routes` with `<Route path="/" element={<StageSelectPage />} />` and `<Route path="/stage/:stageId" element={<PuzzlePage />} />`; import both page components (they may be stubs at this point)

**Checkpoint**: Foundation ready — all shared code in place. User story implementation can begin.

---

## Phase 3: User Story 1 — Play a Puzzle Stage (Priority: P1) 🎯 MVP

**Goal**: A player can select any stage, place/remove queens on the board, see conflict highlights in real time, and reach the completion screen when all queens are correctly placed.

**Independent Test**: Navigate directly to `/stage/stage-01` (no StageSelectPage needed). Place queens one by one. Confirm conflict highlighting works. Place all 5 queens correctly. Confirm completion modal appears with elapsed time.

### TDD: Game Logic Tests for User Story 1 ⚠️

> **MANDATORY (Constitution IV)**: Write these tests FIRST. Run `pnpm vitest` and confirm ALL are RED before writing any implementation in T024–T025.

- [x] T022 Write tests/logic/rule-validator.test.ts with test cases for: same-row conflict, same-column conflict, all 8-direction adjacency conflicts, same-region conflict, valid placement (no conflict), multiple queens triggering multiple rules simultaneously; do NOT create src/lib/rule-validator.ts yet — tests must fail with "module not found"
- [x] T023 [P] Write tests/logic/board-state.test.ts with test cases for: toggleQueen adds queen to empty coord, toggleQueen removes queen from occupied coord, isSolved returns true with N queens and no conflicts, isSolved returns false when queens.length < stage.size, isSolved returns false when conflicts exist; do NOT create src/lib/board-state.ts yet — tests must fail

### Implementation for User Story 1

- [x] T024 Implement src/lib/rule-validator.ts: export `wouldConflict(candidate: CellCoord, existingQueens: Queen[], stage: Stage): boolean` checking all 4 rules; export `deriveConflicts(queens: Queen[], stage: Stage): ConflictMap` returning Map of all conflicting cell keys; run `pnpm vitest` and confirm T022 tests turn GREEN
- [x] T025 Implement src/lib/board-state.ts: export `toggleQueen(queens: Queen[], coord: CellCoord): Queen[]` (pure — no mutation); export `isSolved(queens: Queen[], stage: Stage): boolean` (queens.length === stage.size && deriveConflicts returns empty map); run `pnpm vitest` and confirm T023 tests turn GREEN
- [x] T026 Create src/stores/game-store.ts: Zustand store implementing `GameStoreState` from types/index.ts — fields: stageId, queens, timerStartedAt, elapsedSeconds, isSolved, isNewRecord; actions: `loadStage(stageId)` resets all fields, `placeOrRemoveQueen(coord)` calls toggleQueen then checks isSolved, `restart()` resets queens+timer, `tick()` increments elapsedSeconds, `markSolved(elapsed, isNewRecord)` sets isSolved=true; game-store does NOT import best-times-store (wired later in US3)
- [x] T027 [P] Create src/components/Board/Cell.tsx: props = CellProps (from types/index.ts); renders a `<button>` with background color from REGION_COLORS[regionId] via cn(); shows `<Crown />` Lucide icon when hasQueen=true; applies red conflict ring class when isConflict=true; calls onClick when clicked; disabled prop disables interaction; uses Framer Motion `motion.button` with scale spring on queen placement
- [x] T028 Create src/components/Board/Board.tsx: props = BoardProps; renders CSS grid (`style={{ gridTemplateColumns: \`repeat(${stage.size}, 1fr)\` }}`); maps over stage.grid rows and cols to render Cell components; derives hasQueen from queens array, isConflict from conflicts ConflictMap using `"${row}:${col}"` key; passes disabled prop through
- [x] T029 [P] Create src/components/Timer.tsx: props = TimerProps (elapsedSeconds: number, isRunning: boolean); formats to MM:SS (Math.floor(s/60) + ':' + String(s%60).padStart(2,'0')); renders with `<Timer />` Lucide icon; no internal state — purely presentational
- [x] T030 Create src/components/CompletionModal.tsx: uses Framer Motion AnimatePresence + motion.div for overlay; props = CompletionModalProps; displays elapsed time formatted MM:SS, shows "New Record!" badge with `<Trophy />` Lucide icon when isNewRecord=true, shows previous best if available; two buttons: "Play Again" (calls onPlayAgain) and "Back to Menu" (calls onBackToMenu); backdrop click does NOT dismiss (force explicit choice)
- [x] T031 Create src/pages/PuzzlePage.tsx: reads `:stageId` from `useParams()`; calls `game-store.loadStage(stageId)` in useEffect on mount; sets up setInterval calling `game-store.tick()` every 1000ms when `!isSolved`, clears interval in cleanup; derives `conflicts = deriveConflicts(queens, stage)` on each render; handles `placeOrRemoveQueen` by calling store action; handles restart button; renders `<Board>`, `<Timer>`, restart `<button>` with `<RotateCcw />` icon, back `<button>` with `<ChevronLeft />` navigating to "/", and `<CompletionModal>`; on solve: calls `game-store.markSolved(elapsedSeconds, false)` (isNewRecord wired in US3)
- [x] T032 Create src/pages/StageSelectPage.tsx (STUB for US1 testing): renders a simple list of STAGE_IDS as anchor links (`<Link to={\`/stage/${id}\`}>{id}</Link>`); no styling, no best times — just enables navigation to puzzle; will be fully replaced in US2

**Checkpoint**: User Story 1 complete and independently testable. Run `pnpm dev`, navigate to `/`, click any stage link, play the puzzle, verify constraint highlighting, solve it, see completion modal.

---

## Phase 4: User Story 2 — Browse and Select Stages (Priority: P2)

**Goal**: A polished stage-selection screen listing all 5 stages with their number, board size label, and personal best time (or "—"). Players navigate to any stage by clicking its card.

**Independent Test**: Open `/`. Confirm all 5 stage cards are rendered. Cards with no best time show "—". Clicking a card navigates to `/stage/:id`. Navigating back resets the board (no pre-placed queens).

### Implementation for User Story 2

- [x] T033 [US2] Create src/components/StageCard.tsx: props = StageCardProps (stage, bestTime: number | undefined, onSelect); renders a `motion.div` with hover scale effect; displays stage.label, `${stage.size}×${stage.size}` size indicator, `<Trophy />` icon; renders best time as "Best: M:SS" when bestTime is defined, or "—" when undefined; onClick calls onSelect(stage.id)
- [x] T034 [US2] Replace stub src/pages/StageSelectPage.tsx with full implementation: import STAGES + STAGE_IDS from lib/stages/index; import best-times-store (reads bestTimes); render page header with `<Crown />` Lucide icon and "Queems" title; render responsive grid of StageCard components, passing `bestTime={bestTimes[stageId]}` to each; clicking a card navigates to `/stage/${stageId}` via useNavigate

**Checkpoint**: User Story 2 complete. All 5 stage cards visible, correct size labels, best times shown (all "—" until US3), click navigates correctly, revisiting a completed stage loads fresh board.

---

## Phase 5: User Story 3 — Personal Speed Records (Priority: P3)

**Goal**: Best times persist across sessions. Completing a stage saves the time. Beating the previous best shows "New Record!" on the completion modal and immediately updates the stage card.

**Independent Test**: Complete stage-01 → see best time on card. Reload → time still shown. Complete stage-01 again faster → "New Record!" modal + card updates. Complete slower → no change.

### TDD: Game Logic Tests for User Story 3 ⚠️

> **MANDATORY (Constitution IV)**: Write test FIRST. Confirm RED before implementing T036.

- [x] T035 [US3] Write tests/logic/best-times-store.test.ts: test saveBestTime records first completion, test saveBestTime updates when new time is faster, test saveBestTime does NOT update when new time is slower or equal, test getBestTime returns undefined for unplayed stages, test localStorage key is 'queems-best-times'; mock localStorage using vitest's `vi.stubGlobal`; confirm tests are RED before T036

### Implementation for User Story 3

- [x] T036 [US3] Implement src/stores/best-times-store.ts: Zustand store wrapped with `persist` middleware (from `zustand/middleware`), localStorage key `'queems-best-times'`; implements BestTimesState interface: `bestTimes: Record<string, number>`, `saveBestTime(stageId, seconds)` — only saves if no existing record OR new time < existing, `getBestTime(stageId)` — returns bestTimes[stageId] or undefined; run `pnpm vitest` and confirm T035 tests turn GREEN
- [x] T037 [US3] Wire best-times-store into src/pages/PuzzlePage.tsx: import useBestTimesStore; on solve, call `saveBestTime(stageId, elapsedSeconds)` and compare with `getBestTime(stageId)` before saving to determine `isNewRecord`; pass `isNewRecord` and `previousBest={getBestTime(stageId)}` to CompletionModal
- [x] T038 [US3] Wire best-times-store into src/pages/StageSelectPage.tsx: import useBestTimesStore and pass `bestTimes[stageId]` as bestTime prop to each StageCard; Zustand reactivity ensures cards update immediately after solving a stage without page reload

**Checkpoint**: User Story 3 complete. All acceptance scenarios from spec.md verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinement, accessibility, and production validation.

- [x] T039 [P] Define all region color CSS custom properties in src/assets/index.css inside `@theme {}`: one variable per distinct RegionId used across all 5 stages (red, blue, amber, green, purple, teal, orange, pink, indigo, lime); map each to an `oklch()` color value; update REGION_COLORS lookup in src/lib/region-colors.ts to use `bg-[var(--color-region-*)]` class syntax if needed for Tailwind v4 compatibility
- [x] T040 [P] Add Framer Motion page transition in src/App.tsx: wrap routes in AnimatePresence; add `motion.div` wrapper in each page with `initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0 }}` transition
- [x] T041 [P] Add responsive Tailwind layout to StageSelectPage: stage-card grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; PuzzlePage board scales to viewport width on mobile (max-w-sm on small screens)
- [x] T042 [P] Add accessibility: aria-label on each Cell button (`aria-label={\`Row ${row+1}, Column ${col+1}, ${regionId} region${hasQueen ? ', queen placed' : ''}${isConflict ? ', conflict' : ''}\``); aria-live region for conflict count; focus management when CompletionModal opens
- [x] T043 Run `pnpm eslint src --ext .ts,.tsx` and fix ALL errors (no warnings allowed per constitution); fix any `any` usages with proper types
- [x] T044 Run `pnpm build` and confirm dist/ output has no TypeScript or build errors; run `pnpm preview` and manually verify all 3 user stories work in the built output
- [x] T045 Validate against specs/001-queens-mock/quickstart.md validation checklist: check all items in US1, US2, and US3 sections; mark quickstart.md checklist items complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — MVP deliverable
- **US2 (Phase 4)**: Depends on Phase 3 (uses game-store, stage data, routing set up in US1)
- **US3 (Phase 5)**: Depends on Phase 3 (wires into PuzzlePage) + Phase 4 (wires into StageSelectPage)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2 — depends on types, stages, board components
- **US2 (P2)**: Start after US1 — StageSelectPage is upgraded from US1 stub
- **US3 (P3)**: Start after US1 (PuzzlePage wiring) — can be done before or after US2

### Within Each Phase

- **TDD rule** (Constitution IV): T022, T023 (logic tests) MUST be RED before T024, T025 (implementation)
- **TDD rule** (Constitution IV): T035 (persistence test) MUST be RED before T036 (implementation)
- Models/types before services: T011 (types) → T026 (game-store) → T031 (PuzzlePage)
- Pure functions before stores: T024 (rule-validator) → T025 (board-state) → T026 (game-store)
- Components before pages: T027–T030 (components) → T031 (PuzzlePage)
- Within foundational: T014–T018 (stage files) → T019 (stages/index.ts)

### Parallel Opportunities

**Phase 1** (after T003 completes):
T004, T005, T006, T007, T008, T009, T010 — all independent config files

**Phase 2** (after Phase 1 completes):
T012, T013 — independent utilities
T014, T015, T016, T017, T018 — all stage files are independent
T020, T021 — main.tsx + App.tsx are independent

**Phase 3** (after Phase 2):
T022, T023 — two test files, independent
T027, T029 — Cell.tsx + Timer.tsx (no deps on each other)

**Phase 6** (after all stories):
T039, T040, T041, T042 — all cross-cutting, independent files

---

## Parallel Execution Examples

### Bootstrap (Phase 1, after T003)

```bash
# All in parallel:
Task: "Configure vite.config.ts"                     → T004
Task: "Configure tsconfig.json"                      → T005
Task: "Create src/assets/index.css with Tailwind"    → T006
Task: "Create vitest.config.ts"                      → T007
Task: "Create tests/setup.ts"                        → T008
Task: "Configure ESLint"                             → T009
Task: "Create .prettierrc"                           → T010
```

### Foundational Stage Data (Phase 2)

```bash
# All stage files in parallel:
Task: "Create stage-01.ts"   → T014
Task: "Create stage-02.ts"   → T015
Task: "Create stage-03.ts"   → T016
Task: "Create stage-04.ts"   → T017
Task: "Create stage-05.ts"   → T018
# Then sequentially:
Task: "Create stages/index.ts"   → T019 (after T014–T018)
```

### US1 Game Logic (Phase 3, TDD)

```bash
# Write tests in parallel:
Task: "Write rule-validator.test.ts"   → T022
Task: "Write board-state.test.ts"      → T023

# Confirm both RED, then implement:
Task: "Implement rule-validator.ts"    → T024
Task: "Implement board-state.ts"       → T025

# Then component pair in parallel:
Task: "Create Cell.tsx"     → T027
Task: "Create Timer.tsx"    → T029
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (T022–T032)
4. **STOP and VALIDATE**: Test US1 end-to-end (navigate to `/stage/stage-01`, solve puzzle)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → project runs, blank screens
2. **US1** → game fully playable, all rules enforced, completion modal works
3. **US2** → stage selection polished, navigation complete
4. **US3** → best times persist, records tracked across sessions
5. **Polish** → production-ready, accessible, responsive

### TDD Execution Pattern

For every logic module, strictly follow this cycle:

```
1. Write test file (T022/T023/T035)
2. Run: pnpm vitest — confirm RED ❌
3. Implement module (T024/T025/T036)
4. Run: pnpm vitest — confirm GREEN ✅
5. Refactor if needed
6. Run: pnpm vitest — confirm still GREEN ✅
```

---

## Notes

- [P] tasks = different files, no inter-dependencies
- [Story] label maps task to specific user story for traceability
- TDD tests use `pnpm vitest` with watch mode for fast feedback
- Stage data (T014–T018) must define valid Queens puzzles: each NxN board needs N distinct regions with exactly one solution
- The `cn()` helper from T012 MUST be used for ALL conditional Tailwind class merging in components
- Inline styles are permitted ONLY for dynamically computed values (e.g., CSS grid template columns based on stage.size)
- After T024/T025 turn GREEN, do NOT modify the test files — add new tests for edge cases if bugs surface
