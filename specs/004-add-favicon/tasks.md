# Tasks: App Favicon

**Input**: Design documents from `/specs/004-add-favicon/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Not requested — visual browser verification is sufficient for a static asset.

**Organization**: Tasks are grouped by user story. US2 (bookmark visibility) requires no additional implementation beyond US1 — the same SVG satisfies both; it is covered in the Polish phase as a verification step.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup

**Purpose**: Create the Vite static-asset directory so the favicon file can be placed at the correct path.

- [x] T001 Create `public/` directory at the repository root

---

## Phase 2: User Story 1 — Favicon shown in browser tab (Priority: P1) 🎯 MVP

**Goal**: An amber crown SVG appears in the browser tab whenever the app is opened.

**Independent Test**: Run `pnpm dev`, open `http://localhost:5173` — the amber crown icon appears in the browser tab without any user action.

### Implementation for User Story 1

- [x] T002 [US1] Create `public/crown.svg` — amber crown silhouette SVG (`viewBox="0 0 32 32"`, fill `#f59e0b`, transparent background, no strokes or text, readable at 16×16)

**Checkpoint**: After T002, open the dev server in Chrome and Firefox. The amber crown icon MUST appear in the browser tab. US1 is fully complete.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Cross-browser verification and bookmark test (US2).

- [ ] T003 [P] Verify favicon in Chrome — open `http://localhost:5173`, confirm amber crown in tab and bookmarks bar (covers US2)
- [ ] T004 [P] Verify favicon in Firefox — confirm icon is sharp on standard and high-DPI displays
- [ ] T005 [P] Verify favicon in Edge — confirm icon appears in tab and bookmarks bar
- [ ] T006 Run quickstart.md verification checklist end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on T001 (directory must exist before file can be created)
- **Phase 3 (Polish)**: Depends on T002 — all verification tasks can run in parallel

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 1. Independently testable.
- **US2 (P2)**: No additional implementation. Verified by T003–T005 in Polish phase.

### Parallel Opportunities

```bash
# After T002 completes, all verification tasks run in parallel:
Task: T003 — verify Chrome
Task: T004 — verify Firefox
Task: T005 — verify Edge
```

---

## Implementation Strategy

### MVP (US1 only — 2 tasks)

1. T001 — create `public/` directory
2. T002 — create `public/crown.svg`
3. **Validate**: open dev server, confirm icon in browser tab
4. Both user stories are satisfied — no further implementation needed

### Incremental Delivery

This feature has a single deliverable. There is no meaningful incremental split beyond MVP — completing US1 automatically satisfies US2.

---

## Notes

- The `index.html` `<link rel="icon" type="image/svg+xml" href="/crown.svg">` tag is **already present** — do not modify `index.html`.
- Total tasks: **6** (1 setup + 1 implementation + 4 polish/verification)
- Implementation tasks: **2** (T001, T002)
- Parallel opportunities: T003, T004, T005 (verification)
- Suggested MVP scope: T001 + T002 only
