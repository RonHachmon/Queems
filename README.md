# 👑 Queems

🌐 **Live site: [queems.netlify.app](https://queems.netlify.app/)**

A browser-based mock of the LinkedIn Queens puzzle game. Place exactly one queen in each colored region of an NxN board, obeying all placement constraints. The game tracks your personal best completion time per stage and persists records across sessions.

## 🎮 Gameplay Rules

Each stage is an NxN grid divided into N colored regions. You must place exactly N queens — one per region — such that no two queens share:

- The same **row**
- The same **column**
- The same **colored region**
- Any **adjacent cell** (including diagonals — the 8 surrounding cells)

Conflicting queens are highlighted instantly. The puzzle is solved when all queens are placed without any violations.

### 🖱️ Cell Interaction

Clicking a cell cycles through three states:

```
empty → X (manual mark) → queen → empty
```

You can also **click and drag** across empty cells to mark them all with X in one gesture.

An **Auto-Mark** toggle can automatically place X marks on cells that are ruled out by a newly placed queen.

## ✨ Features

- 🗺️ Multiple pre-defined stages with distinct board layouts
- ⏱️ Live timer that starts on your first move and stops on completion
- 🔴 Instant conflict highlighting (same row, column, adjacent cell, or same region)
- 3️⃣ Three-state cell cycle: empty / X-mark / queen
- 🖱️ Click-and-drag X marking across multiple cells
- 🤖 Auto-Mark toggle to fill ruled-out cells automatically
- 🏆 Personal best time tracked per stage, persisted in `localStorage`
- 🎉 "New Record!" notification when you beat your previous best
- 📋 Stage select screen showing all stages and their best times

## 🛠️ Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5 (strict) |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 |
| State management | Zustand 5 |
| Routing | React Router v7 |
| Animation | Framer Motion v11 |
| Icons | Lucide React |
| Class utilities | clsx + tailwind-merge |
| Testing | Vitest 2 + @testing-library/react |
| Package manager | pnpm |

## 📁 Project Structure

```
src/
├── main.tsx                   ← entry point
├── App.tsx                    ← router (/ and /stage/:stageId)
├── types/index.ts             ← shared TypeScript interfaces
├── lib/
│   ├── cn.ts                  ← cn() Tailwind class helper
│   ├── rule-validator.ts      ← pure constraint checker (TDD)
│   ├── board-state.ts         ← pure board helpers (TDD)
│   └── stages/                ← static stage definitions
├── hooks/
│   └── useDragMark.ts         ← drag session management
├── stores/
│   ├── game-store.ts          ← Zustand ephemeral session state
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
└── assets/index.css           ← Tailwind v4 + CSS custom properties for region colors

tests/
└── logic/
    ├── rule-validator.test.ts
    ├── board-state.test.ts
    ├── best-times-store.test.ts
    └── game-store.test.ts
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v8+ (`npm install -g pnpm`)

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser and start puzzling! 🧩

### Build for production

```bash
pnpm build
```

Output is written to `dist/`. Preview the production build locally:

```bash
pnpm preview
```

## 🧪 Testing

Run all tests once:

```bash
pnpm test
```

Watch mode (re-runs on file change):

```bash
pnpm vitest --watch
```

Interactive UI (browser-based test runner):

```bash
pnpm test:ui
```

Game logic (`rule-validator.ts`, `board-state.ts`, stores) is covered by unit tests written TDD-first — tests are confirmed failing before any implementation is written.

## 🧹 Code Quality

```bash
pnpm lint      # ESLint on src/
pnpm format    # Prettier on src/
```

## 🏗️ Architecture Notes

- 🧠 **Game logic is pure**: `rule-validator.ts` and `board-state.ts` contain no React or Zustand code — they are plain TypeScript functions testable in isolation.
- 🔄 **`ConflictMap` is always derived**: conflicts are never stored in state; they are recomputed from `queens[]` on every render.
- 💾 **Best times are persisted** via Zustand's `persist` middleware under the localStorage key `queems-best-times`.
- 🎨 **Region colors** are CSS custom properties defined in `src/assets/index.css` and mapped to Tailwind classes via `src/lib/region-colors.ts`.
- 📦 **`@/` import alias** maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
