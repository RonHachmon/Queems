# Tasks: SEO & Meta Tags

**Input**: Design documents from `/specs/005-seo-meta-tags/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: No test tasks generated — plan.md explicitly states "No tests required — feature contains no game logic; changes are limited to `index.html` and a static image asset."

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every description

---

## Phase 1: Setup (Audit Existing Structure)

**Purpose**: Understand the current `index.html` `<head>` before making any modifications

- [x] T001 Audit `index.html` current `<head>` section to identify existing tags (charset, viewport, favicon) and locate correct insertion point for new meta tags

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Create the static preview image asset — required by US1 (og:image, twitter:image) and US3 (JSON-LD image field) before those tags can reference it

**⚠️ CRITICAL**: US1 and US3 cannot be completed without this asset in place

- [x] T002 [P] Create `public/og-image.png` — 1200×630 px PNG, dark background, crown icon (sourced from `public/crown.svg`), "Queems" wordmark, "Queens Puzzle Game" subtitle; keep critical content within safe margins (100 px from edges)

**Checkpoint**: `public/og-image.png` exists at correct dimensions — US1 and US3 can now proceed

---

## Phase 3: User Story 1 — Social Media Sharing with Rich Preview (Priority: P1) 🎯 MVP

**Goal**: Shared Queems URLs display rich preview cards (title, description, image) on WhatsApp, Twitter/X, Facebook, and LinkedIn instead of bare links.

**Independent Test**: Paste the deployed URL into [opengraph.xyz](https://opengraph.xyz) and confirm a card with title, description, and image appears. Alternatively, run `pnpm build && pnpm preview`, inspect page source (`Ctrl+U`), and verify `og:title`, `og:image`, and `twitter:card` tags are present and non-empty.

### Implementation for User Story 1

- [x] T003 [US1] Add Open Graph meta tags to `index.html` `<head>`: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:image:width` (1200), `og:image:height` (630), `og:image:type` (image/png), `og:image:alt`, `og:site_name`, `og:locale` — all absolute URLs use placeholder `https://queems.app`
- [x] T004 [US1] Add Twitter Card meta tags to `index.html` `<head>`: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt` — image URL uses same placeholder `https://queems.app/og-image.png`

**Checkpoint**: US1 fully functional — social sharing preview cards work independently of SEO or structured data tags

---

## Phase 4: User Story 2 — Search Engine Discovery (Priority: P2)

**Goal**: Search engines display Queems with a clear title and description snippet; a canonical URL consolidates ranking signals.

**Independent Test**: Inspect `index.html` (or built `dist/index.html`) and confirm `<title>`, `<meta name="description">` (≤160 chars), `<meta name="robots">`, and `<link rel="canonical">` are all present and non-empty.

### Implementation for User Story 2

- [x] T005 [US2] Add SEO fundamental tags to `index.html` `<head>`: `<title>Queems — Queens Puzzle Game</title>`, `<meta name="description" content="…">` (120–160 chars describing the N-Queens placement puzzle), `<meta name="robots" content="index, follow">`, and `<link rel="canonical" href="https://queems.app">` (placeholder domain)

**Checkpoint**: US2 fully functional — search engines can discover, title, and describe Queems independently of social or structured-data tags

---

## Phase 5: User Story 3 — Structured Data for Rich Results (Priority: P3)

**Goal**: Google can parse a machine-readable game description, making Queems eligible for rich search result features (game card, enhanced snippet).

**Independent Test**: Run `pnpm build && pnpm preview`, then pass the local URL through [Google's Rich Results Test](https://search.google.com/test/rich-results) or copy the `<script type="application/ld+json">` block into the [Schema.org validator](https://validator.schema.org) and confirm zero critical errors and `WebApplication` type is recognized.

### Implementation for User Story 3

- [x] T006 [US3] Add JSON-LD structured data block to `index.html` `<head>`: `<script type="application/ld+json">` containing `@type: WebApplication`, `name`, `description`, `url`, `applicationCategory: GameApplication`, `image`, `creator` (Person: Ron Hachmon), `inLanguage: en-US`, `isAccessibleForFree: true`, `datePublished` — all URLs use placeholder `https://queems.app`

**Checkpoint**: All three user stories complete — social sharing, SEO discovery, and structured data each independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Developer-experience improvements and final validation pass across all stories

- [x] T007 Add an HTML comment block in `index.html` above the first `https://queems.app` placeholder occurrence directing developers to update all 5 domain occurrences before production deploy (per quickstart.md Step 1)
- [x] T008 [P] Run `pnpm build && pnpm preview` and verify the complete quickstart.md checklist: `<title>` contains "Queems", `<meta name="description">` is non-empty, `<meta property="og:image">` contains an absolute URL, `<script type="application/ld+json">` block is present and valid JSON

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 audit — **BLOCKS US1 and US3** (both reference `og-image.png`)
- **US1 (Phase 3)**: Depends on Phase 2 (needs `og-image.png` to exist) — independent of US2 and US3
- **US2 (Phase 4)**: Depends on Phase 1 only — can start immediately after audit, does not need `og-image.png`
- **US3 (Phase 5)**: Depends on Phase 2 (references image URL in JSON-LD) — independent of US1 and US2
- **Polish (Phase 6)**: Depends on all stories complete

### User Story Dependencies

- **US1 (P1)**: Requires T002 (og-image.png) — no dependency on US2 or US3
- **US2 (P2)**: No dependency on T002 or other stories — can run after T001
- **US3 (P3)**: Requires T002 (og-image.png URL in JSON-LD) — no dependency on US1 or US2

> **Note**: US2 (T005) can begin in parallel with T002 since it does not reference the image asset.

### Within Each User Story

- T003 and T004 (US1) are both edits to `index.html` — execute sequentially to avoid file conflicts
- US2 is a single task (T005); US3 is a single task (T006) — each completes the story in one edit

### Parallel Opportunities

- T002 and T005 can run in parallel (different files: `public/og-image.png` vs `index.html` SEO tags)
- T008 (build verification) is independent of T007 (comment addition) and can run after either

---

## Parallel Example: User Story 1 + User Story 2

```bash
# After Phase 1 (audit) completes, these can run simultaneously:

# Thread A — Foundational + US1
Task: "Create public/og-image.png (T002)"
  → Task: "Add Open Graph meta tags to index.html (T003)"
  → Task: "Add Twitter Card meta tags to index.html (T004)"

# Thread B — US2 (no image dependency)
Task: "Add SEO fundamental tags to index.html (T005)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Audit `index.html`
2. Complete Phase 2: Create `public/og-image.png` (required by US1)
3. Complete Phase 3: Add OG + Twitter Card tags (T003, T004)
4. **STOP and VALIDATE**: Paste URL into opengraph.xyz — confirm rich preview card appears
5. Deploy/share if preview is satisfactory

### Incremental Delivery

1. **Phase 1 + 2** → Foundation ready (image asset exists)
2. **Phase 3 (US1)** → Social sharing works → Validate with opengraph.xyz → Deploy (MVP!)
3. **Phase 4 (US2)** → Search engine title + description → Validate `<head>` inspection → Deploy
4. **Phase 5 (US3)** → Rich Results eligibility → Validate with Rich Results Test → Deploy
5. **Phase 6** → Polish + build verification → Final deploy

### Single-Developer Strategy

Work sequentially in priority order (P1 → P2 → P3). Each phase produces a complete, independently verifiable increment.

---

## Notes

- [P] tasks use different files — safe to run in parallel
- All `https://queems.app` occurrences are placeholders; update to real domain before first production deploy (5 occurrences in `index.html` per quickstart.md)
- No new npm dependencies introduced by this feature
- No game logic touched — Constitution IV TDD requirement does not apply
- `public/og-image.png` must be committed to the repository so Vite copies it to `dist/` on build
- Avoid absolute paths in HTML that include `/dist/` — Vite serves `public/` at root; reference as `/og-image.png` in `<head>` and as `https://queems.app/og-image.png` for absolute OG/Twitter URLs
