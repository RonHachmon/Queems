# Quickstart: Queems Queens Puzzle Mock

**Branch**: `001-queens-mock` | **Date**: 2026-02-17

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 LTS | https://nodejs.org |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Git | any | https://git-scm.com |

---

## 1. Bootstrap the Project

```bash
# Scaffold Vite + React + TypeScript
pnpm create vite@latest queems --template react-ts
cd queems

# Install all dependencies (see full list in research.md)
pnpm install react-router-dom zustand framer-motion lucide-react clsx tailwind-merge

pnpm install -D \
  tailwindcss@^4 \
  @tailwindcss/vite@^4 \
  vitest @vitest/ui jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-react-hooks \
  prettier
```

---

## 2. Configure Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

---

## 3. Configure TypeScript

```json
// tsconfig.json (key options)
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "noEmit": true
  },
  "include": ["src", "tests"]
}
```

---

## 4. Configure Tailwind CSS v4

```css
/* src/assets/index.css */
@import "tailwindcss";

@theme {
  /* Board region colors — add one per stage region */
  --color-region-red:    oklch(70% 0.18 25);
  --color-region-blue:   oklch(70% 0.18 250);
  --color-region-amber:  oklch(80% 0.15 80);
  --color-region-green:  oklch(70% 0.18 145);
  --color-region-purple: oklch(65% 0.18 300);
  --color-region-teal:   oklch(70% 0.15 190);
}
```

```tsx
// src/main.tsx
import './assets/index.css'
```

---

## 5. Configure Vitest

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom'
```

---

## 6. Source Directory Structure

```text
src/
├── main.tsx                       ← entry point
├── App.tsx                        ← BrowserRouter + Routes
├── types/
│   └── index.ts                   ← shared TypeScript interfaces (from contracts/)
├── lib/
│   ├── cn.ts                      ← clsx + tailwind-merge helper
│   ├── rule-validator.ts          ← pure constraint checker (TDD first)
│   ├── board-state.ts             ← toggleQueen, deriveConflicts, isSolved (TDD first)
│   └── stages/
│       ├── index.ts               ← stages index + ordered ID list
│       ├── stage-01.ts            ← Stage 1 definition
│       ├── stage-02.ts
│       ├── stage-03.ts
│       ├── stage-04.ts
│       └── stage-05.ts
├── stores/
│   ├── game-store.ts              ← ephemeral game session (Zustand)
│   └── best-times-store.ts        ← persisted best times (Zustand + persist)
├── components/
│   ├── Board/
│   │   ├── Board.tsx              ← NxN grid wrapper
│   │   └── Cell.tsx               ← individual cell
│   ├── StageCard.tsx              ← stage-select card
│   ├── Timer.tsx                  ← MM:SS display
│   └── CompletionModal.tsx        ← win screen overlay
├── pages/
│   ├── StageSelectPage.tsx        ← "/" route
│   └── PuzzlePage.tsx             ← "/stage/:stageId" route
└── assets/
    └── index.css                  ← Tailwind v4 import + theme tokens

tests/
├── setup.ts
└── logic/
    ├── rule-validator.test.ts
    ├── board-state.test.ts
    └── best-times-store.test.ts
```

---

## 7. Run in Development

```bash
pnpm dev
# → http://localhost:5173
```

---

## 8. Run Tests (TDD workflow — write tests first)

```bash
# Run all tests
pnpm vitest

# Watch mode during development
pnpm vitest --watch

# UI mode
pnpm vitest --ui
```

**TDD order for game logic** (Constitution IV — tests MUST fail before implementing):

1. Write `tests/logic/rule-validator.test.ts` → run → confirm all RED
2. Implement `src/lib/rule-validator.ts` → run → confirm all GREEN
3. Write `tests/logic/board-state.test.ts` → run → confirm all RED
4. Implement `src/lib/board-state.ts` → run → confirm all GREEN
5. Write `tests/logic/best-times-store.test.ts` → run → confirm all RED
6. Implement `src/stores/best-times-store.ts` → run → confirm all GREEN

---

## 9. Lint & Format

```bash
pnpm eslint src --ext .ts,.tsx
pnpm prettier --write src
```

---

## 10. Build for Production

```bash
pnpm build
# Output: dist/ (static files — deploy to Vercel, Netlify, GitHub Pages)

pnpm preview
# → preview the production build locally
```

---

## 11. Validation Checklist

After each user story is implemented, verify independently:

### US1 — Play a Puzzle Stage
- [x] Open app → stage-select screen loads
- [x] Click any stage → puzzle board renders with correct grid and region colors
- [x] Click a cell → queen appears; invalid placement highlights conflicting cells in red
- [x] Click a queen cell → queen removed
- [x] Place all N queens correctly → completion screen appears with elapsed time

### US2 — Browse and Select Stages
- [x] All 5+ stages listed on stage-select screen
- [x] Stage with no record shows "—"
- [x] Stage with a record shows "Best: M:SS"
- [x] Clicking a completed stage loads it in reset state (no pre-placed queens)

### US3 — Personal Speed Records
- [x] Complete a stage → best time appears on stage card (no reload required)
- [x] Complete a stage faster → completion screen shows "New Record!" → card updates
- [x] Complete a stage slower → best time unchanged
- [x] Reload page → all best times still displayed
