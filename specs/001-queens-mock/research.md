# Research: Queems Queens Puzzle Mock

**Branch**: `001-queens-mock` | **Date**: 2026-02-17
**Purpose**: Document all technology decisions and rationale for Phase 0

---

## Decision 1: Build Tool — Vite (SPA)

**Decision**: Vite 6, pure client-side SPA (no SSR).

**Rationale**:
- No server-side rendering requirements exist (puzzle logic is fully client-side).
- Vite's near-instant HMR is ideal for iterative UI work on puzzle boards.
- Static output deploys to any CDN (Vercel, Netlify, GitHub Pages) with zero config.
- Simpler mental model: no server components, no hydration complexity.

**Alternatives considered**:
- **Next.js App Router**: Eliminated. Adds SSR/SSG complexity with no benefit for a
  purely interactive puzzle game. No API routes needed (storage is localStorage).

---

## Decision 2: Language — TypeScript 5 (strict)

**Decision**: TypeScript 5 with `"strict": true` enforced via `tsconfig.json`.

**Rationale**: Mandated by the project constitution. TypeScript provides compile-time
safety for game-state shapes (board arrays, region maps, queen positions), which
prevents entire categories of runtime bugs in constraint logic.

**Key config**:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}
```

---

## Decision 3: UI Framework — React 19 (functional components + hooks)

**Decision**: React 19 with functional components exclusively. No class components.

**Rationale**: Mandated by the project constitution (Principle III). Hooks enable clean
separation of game logic (custom hooks, Zustand) from rendering (JSX). React 19's
compiler optimizations reduce need for manual `useMemo`/`useCallback`.

---

## Decision 4: Styling — Tailwind CSS v4

**Decision**: Tailwind CSS v4 with CSS-native configuration (no `tailwind.config.js`).

**Rationale**:
- v4's `@theme` block in CSS enables board-cell color tokens to live alongside styles,
  making the region-color system explicit and co-located.
- Faster build times via the new Rust-based engine.
- Utility classes make conflict-state styling (`data-[conflict]`, `data-[queen]`)
  readable and co-located with JSX markup.

**Trade-off**: Fewer community examples for v4 vs v3. Mitigated by the project's
bounded scope — only ~10 utility patterns are needed.

**Vite integration**: Use `@tailwindcss/vite` plugin (v4 replaces PostCSS plugin).

---

## Decision 5: State Management — Zustand 5

**Decision**: Zustand 5 with two stores:
1. `game-store.ts` — ephemeral game session (queen placements, timer state, active stage)
2. `best-times-store.ts` — persisted best times via `zustand/middleware/persist`

**Rationale**:
- Zustand's minimal API (no actions/reducers boilerplate) matches the project's YAGNI
  principle (Constitution V).
- The two-store split cleanly separates ephemeral session state from durable records,
  making each independently testable.
- The `persist` middleware eliminates a custom localStorage serialization layer.

**Alternatives considered**:
- **React Context + useReducer**: Eliminated. Context re-renders the full tree on every
  action; unsuitable for tight timer loops (timer ticks every second).
- **Jotai**: Valid alternative, but Zustand's store model is simpler for game-session
  state where many fields update together atomically.
- **Redux Toolkit**: Eliminated. Massive overkill for 2 stores with ~5 actions total.

---

## Decision 6: Routing — React Router v7

**Decision**: React Router v7 (`react-router-dom` SPA mode).

**Routes**:
- `/` → `StageSelectPage`
- `/stage/:stageId` → `PuzzlePage`

**Rationale**:
- Two routes only. React Router v7 is the mature industry standard; excellent
  TypeScript support via `useParams<{ stageId: string }>()`.
- URL-based routing means the puzzle page is directly linkable (sharable URL).

**Alternatives considered**:
- **TanStack Router**: Type-safe route params are compelling but the extra setup is
  unjustified for 2 routes (Constitution V — YAGNI).
- **useState navigation**: Eliminates URLs; the puzzle page is not directly linkable.
  Rejected because URL-based navigation is a free quality improvement with no extra cost.

---

## Decision 7: Animation — Framer Motion v11

**Decision**: Framer Motion v11 for page transitions, queen placement animations,
and the completion modal entrance.

**Rationale**:
- Spring-physics animations for queen placement (`scale: 0 → 1`) provide responsive,
  game-feel feedback.
- `AnimatePresence` enables clean completion-modal mount/unmount.
- Conflict-highlight animations (color pulse) complement the <100ms feedback requirement.

**Usage boundaries** (YAGNI — Constitution V):
- Queen placement: scale spring animation
- Conflict cells: brief color pulse
- Completion modal: fade + scale entrance
- Page transition (stage select ↔ puzzle): slide or fade

**Not used for**: timer ticking, static UI chrome.

---

## Decision 8: Icons — Lucide React

**Decision**: Lucide React (tree-shakeable, TypeScript-native icon library).

**Icons planned**:
- `Crown` — queen piece indicator / branding
- `RotateCcw` — restart button
- `ChevronLeft` — back to stage select
- `Timer` — timer display label
- `Trophy` — new record indicator

**Rationale**: Tree-shaking ensures only used icons are bundled. Zero config needed
with Vite. Consistent stroke-based design matches a clean puzzle game aesthetic.

---

## Decision 9: Class Utilities — clsx + tailwind-merge

**Decision**: `clsx` + `tailwind-merge`, exposed via a single `cn()` helper in `src/lib/cn.ts`.

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Rationale**: Cell components receive multiple conditional class variants
(base style, conflict state, queen state, hover state, region color). Without
`tailwind-merge`, conflicting Tailwind classes (e.g., `bg-amber-100 bg-red-300`)
produce unpredictable CSS specificity. The `cn()` pattern is the community standard.

---

## Decision 10: Persistence Strategy — Zustand persist middleware

**Decision**: `best-times-store.ts` wraps its state in `persist()` from `zustand/middleware`.

```ts
// Key: 'queems-best-times' in localStorage
// Shape: { bestTimes: Record<string, number> }  (stageId → seconds)
```

**Rationale**:
- Zero boilerplate: Zustand handles JSON serialization, hydration on mount, and
  writes on every state change.
- The store is independently testable by mocking `localStorage` in Vitest.

**Alternatives considered**:
- **Manual localStorage module**: Valid (and easier to unit-test in isolation), but
  adds a separate abstraction layer not justified for one data structure (Constitution V).

---

## Decision 11: Testing — Vitest + @testing-library/react (game logic TDD only)

**Decision**: Vitest as test runner + @testing-library/react for component utilities.
Tests are written ONLY for game-logic modules (Constitution IV mandates TDD for logic).

**Tested modules**:
- `src/lib/rule-validator.ts` — constraint checking (mandatory TDD)
- `src/lib/board-state.ts` — conflict derivation (mandatory TDD)
- `src/stores/best-times-store.ts` — localStorage persistence (mandatory TDD)

**UI component tests**: None (user explicitly chose "Logic only (mandatory TDD)").

**Vitest config**:
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
```

---

## Decision 12: Linting & Formatting — ESLint + Prettier

**Decision**: ESLint with `@typescript-eslint/eslint-plugin` + Prettier.
Mandated by the project constitution.

**Key rules**:
- `@typescript-eslint/no-explicit-any: error` (constitution: `any` forbidden)
- `react-hooks/rules-of-hooks: error`
- `react-hooks/exhaustive-deps: warn`

---

## Complete Dependency Manifest

### Production dependencies
```
react@^19
react-dom@^19
react-router-dom@^7
zustand@^5
framer-motion@^11
lucide-react
clsx
tailwind-merge
```

### Development dependencies
```
vite@^6
@vitejs/plugin-react@^4
@tailwindcss/vite@^4          ← Tailwind v4 Vite plugin
tailwindcss@^4
typescript@^5
@types/react@^19
@types/react-dom@^19
vitest@^2
@vitest/ui
jsdom
@testing-library/react@^16
@testing-library/user-event@^14
@testing-library/jest-dom@^6
eslint@^9
@typescript-eslint/eslint-plugin@^8
@typescript-eslint/parser@^8
eslint-plugin-react-hooks@^5
prettier@^3
```

### Package manager
- **pnpm** — strict dependency isolation, fast installs, disk-efficient.
