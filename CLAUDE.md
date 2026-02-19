# Queems Development Guidelines

Auto-generated from feature plan. Last updated: 2026-02-18

## Active Technologies

- TypeScript 5 (strict) + React 19 (001-queens-mock)
- Vite 6 SPA + Tailwind CSS v4 (001-queens-mock)
- Zustand 5 + React Router v7 (001-queens-mock)
- Framer Motion v11 + Lucide React (001-queens-mock)
- clsx + tailwind-merge (001-queens-mock)
- Vitest 2 + @testing-library/react (001-queens-mock)

## Project Structure

```text
src/
├── main.tsx                   ← entry point
├── App.tsx                    ← router (/ and /stage/:stageId)
├── types/index.ts             ← shared interfaces
├── lib/
│   ├── cn.ts                  ← cn() helper
│   ├── rule-validator.ts      ← pure constraint checker (TDD)
│   ├── board-state.ts         ← pure board helpers (TDD)
│   └── stages/                ← static stage definitions
├── hooks/
│   └── useDragMark.ts         ← drag session management (003-drag-mark-x)
├── stores/
│   ├── game-store.ts          ← Zustand ephemeral session
│   └── best-times-store.ts    ← Zustand + persist → localStorage
├── components/
│   ├── Board/Board.tsx        ← NxN grid
│   ├── Board/Cell.tsx         ← single tile
│   ├── StageCard.tsx
│   ├── Timer.tsx
│   └── CompletionModal.tsx
├── pages/
│   ├── StageSelectPage.tsx    ← "/"
│   └── PuzzlePage.tsx         ← "/stage/:stageId"
└── assets/index.css           ← Tailwind v4 + @theme region colors

tests/
└── logic/
    ├── rule-validator.test.ts
    ├── board-state.test.ts
    ├── best-times-store.test.ts
    └── game-store.test.ts     ← TDD for addManualMark (003-drag-mark-x)
```

## Commands

```bash
pnpm dev          # start dev server (http://localhost:5173)
pnpm build        # production build → dist/
pnpm preview      # preview production build
pnpm vitest       # run all tests
pnpm vitest --watch  # watch mode
pnpm eslint src --ext .ts,.tsx
pnpm prettier --write src
```

## Code Style

**TypeScript**: strict mode — `any` is forbidden. Use explicit interfaces.
**React**: functional components + hooks only. No class components.
**Imports**: use `@/` alias for `src/` (configured in vite.config.ts + tsconfig.json).
**Class names**: always use `cn()` from `src/lib/cn.ts` for conditional Tailwind classes.
**Game logic**: `rule-validator.ts` and `board-state.ts` MUST be pure functions — no React,
no Zustand, no side effects. They are testable in isolation.
**TDD rule (Constitution IV)**: Tests for ALL game-logic modules MUST be written and
confirmed RED before the corresponding implementation is written.

## Constitution Principles (v1.0.0)

1. **Spec-First**: No code without an approved spec.md
2. **Puzzle Rule Integrity**: Logic MUST be isolated from UI, fully tested
3. **Component-First**: Small focused components; no game logic in JSX files
4. **Test-First for Logic**: TDD mandatory for lib/ and stores/
5. **YAGNI**: No speculative features or premature abstractions

## Key Architectural Rules

- `ConflictMap` is ALWAYS derived (never stored in state)
- Navigation uses React Router v7 (`useNavigate`, `useParams`)
- Best times stored ONLY in `best-times-store` (Zustand persist → localStorage key: `queems-best-times`)
- Timer interval lives in `PuzzlePage` useEffect; cleanup clears interval on unmount
- Region colors are CSS custom properties in `index.css`; mapped to classes in `lib/region-colors.ts`

## Recent Changes

- 006-settings-automark: Settings tab on Stage Select — Auto-mark toggle moved from PuzzlePage, persisted via `queems-settings` (localStorage), new `settings-store.ts`, default ON
- 003-drag-mark-x: Click-and-drag X marking — `useDragMark` hook, `addManualMark` store action, Cell/Board drag props
- 002-mark-cells: Three-state cell cycle (empty → X → queen), Auto-Mark toggle, `computeInvalidationSet` pure fn
- 001-queens-mock: Initial project — full Vite SPA + React 19 + TypeScript 5 stack

<!-- MANUAL ADDITIONS START -->
## GitHub CLI (gh) — Useful Commands

> **Note**: The GitHub MCP server is authenticated with a different account.
> Always use `gh` CLI for GitHub operations — it is authenticated as `RonHachmon`.

```bash
# Auth
gh auth status                          # confirm logged-in account

# Issues
gh issue create --title "..." --body "..."          # create issue
gh issue list                                        # list open issues
gh issue view <number>                               # view issue detail
gh issue close <number>                              # close issue

# Pull Requests
gh pr create --title "..." --base main --body "..."  # create PR (on current branch)
gh pr list                                           # list open PRs
gh pr view <number>                                  # view PR detail
gh pr merge <number> --squash                        # merge PR

# Linking PR to issue: include "Closes #<N>" in the PR body
# Example PR body opener: "Closes #5\n\n## Summary\n..."

# Branches
gh pr checkout <number>                              # check out a PR branch locally
```
<!-- MANUAL ADDITIONS END -->
