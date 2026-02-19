# Implementation Plan: App Favicon

**Branch**: `004-add-favicon` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-add-favicon/spec.md`

## Summary

Create `public/crown.svg` — an amber crown silhouette SVG — so the browser tab and bookmark bar display the Queems brand icon. The `index.html` `<link rel="icon">` tag already references `/crown.svg`; only the missing asset needs to be created.

## Technical Context

**Language/Version**: TypeScript 5 (strict) + React 19
**Primary Dependencies**: Vite 6 (static asset serving via `public/`)
**Storage**: N/A
**Testing**: Visual verification in browser (no automated test needed — pure static asset)
**Target Platform**: Web browser (Chrome 80+, Firefox 41+, Edge 80+, Safari 17+)
**Project Type**: Single Vite SPA
**Performance Goals**: SVG loads instantly as part of page `<head>`; no measurable performance impact
**Constraints**: Icon must be recognisable at 16×16 pixels; no strokes/text/gradients
**Scale/Scope**: Single file addition

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | `spec.md` complete and approved |
| II. Puzzle Rule Integrity | ✅ N/A | No game logic touched |
| III. Component-First Design | ✅ N/A | No React component added; pure static asset |
| IV. Test-First for Game Logic | ✅ N/A | No game logic; visual verification sufficient |
| V. Simplicity / YAGNI | ✅ PASS | Single file. No abstraction, no new dependency |

**Post-design re-check**: All gates still pass. No complexity added beyond the single SVG file.

## Project Structure

### Documentation (this feature)

```text
specs/004-add-favicon/
├── plan.md          ← this file
├── research.md      ← Phase 0 output
├── quickstart.md    ← Phase 1 output
└── tasks.md         ← Phase 2 output (/speckit.tasks)
```

*No `data-model.md` or `contracts/` — feature involves no data entities or API endpoints.*

### Source Code (repository root)

```text
public/              ← new directory (Vite static root)
└── crown.svg        ← new file: amber crown favicon

index.html           ← unchanged (link tag already present)
```

**Structure Decision**: Single Vite SPA. Static assets go in `public/` and are served at the site root. No source-tree changes beyond the new directory and file.
