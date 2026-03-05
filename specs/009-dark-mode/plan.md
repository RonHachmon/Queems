# Implementation Plan: Dark Mode

**Branch**: `009-dark-mode` | **Date**: 2026-03-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-dark-mode/spec.md`

## Summary

Add a user-controlled dark mode toggle to the Queems app. The toggle lives in the existing Settings tab on the Stage Select page and persists the preference in localStorage. When enabled, all non-puzzle UI surfaces switch to a dark palette immediately; puzzle region colors remain unchanged. On first launch with no stored preference, the app defaults to the OS `prefers-color-scheme` setting.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` forbidden)
**Primary Dependencies**: React 19, Tailwind CSS v4, Zustand 5 (persist middleware)
**Storage**: `localStorage` key `queems-settings` — extended with `darkModeEnabled: boolean`
**Testing**: Vitest 2 + React Testing Library (no new logic tests required; no game logic added)
**Target Platform**: Browser SPA (Vite 6, Chrome/Firefox/Safari modern)
**Project Type**: Single web application (frontend-only)
**Performance Goals**: Theme switch must be perceptually instant (< 16 ms — one frame)
**Constraints**: Region color tokens in `@theme` MUST NOT be modified; FOIT (flash of incorrect theme) MUST be avoided
**Scale/Scope**: ~7 files modified, no new files created (except CSS `@variant` line)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Specification-First** | PASS | `spec.md` fully written and validated before this plan |
| **II. Puzzle Rule Integrity** | PASS | No game logic modified; region colors explicitly preserved |
| **III. Component-First Design** | PASS | Theme state lives in `settings-store`; components receive it via hook, not prop-drilling |
| **IV. Test-First for Game Logic** | PASS | No game logic added; store extension (boolean + setter) is trivial; no TDD mandate triggered |
| **V. Simplicity / YAGNI** | PASS | No new abstractions; existing store extended; Tailwind `dark:` variants used directly |

**Post-Phase 1 re-check**: All gates still pass. No CSS-in-JS, no ThemeProvider wrapper, no new store — the implementation stays as flat as possible.

## Project Structure

### Documentation (this feature)

```text
specs/009-dark-mode/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── localStorage-schema.md
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code Changes

```text
src/
├── assets/
│   └── index.css                   ← add @variant dark directive (1 line)
├── types/
│   └── index.ts                    ← extend AppSettings + SettingsState
├── stores/
│   └── settings-store.ts           ← add darkModeEnabled + setDarkMode
├── App.tsx                         ← apply/remove 'dark' class on <html>
├── components/
│   ├── Timer.tsx                   ← add dark: color variants
│   ├── StageCard.tsx               ← add dark: color variants
│   └── CompletionModal.tsx         ← add dark: color variants
└── pages/
    ├── StageSelectPage.tsx         ← add dark: variants + Dark Mode toggle row
    └── PuzzlePage.tsx              ← add dark: color variants
```

**No new files created. No files deleted.**
**`src/components/Board/Cell.tsx` is NOT modified** — region color classes are intentionally excluded.

**Structure Decision**: Single web application (Option 1). All changes are within the existing `src/` tree. The feature is purely additive CSS + minimal store state.

## Complexity Tracking

*No Constitution violations — table omitted per instructions.*
