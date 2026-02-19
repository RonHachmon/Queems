# Implementation Plan: Settings Tab with Persisted Auto-Mark Toggle

**Branch**: `006-settings-automark` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-settings-automark/spec.md`

## Summary

Move the "Auto-mark invalid cells" toggle out of `PuzzlePage` into a new Settings tab on `StageSelectPage`. The preference defaults to ON, is persisted in `localStorage` via a new `settings-store` (Zustand persist), and is applied whenever a puzzle stage loads. The Settings tab uses the app's existing amber/gray design language and a custom styled toggle switch.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `any` forbidden)
**Primary Dependencies**: React 19, Vite 6, Tailwind CSS v4, Zustand 5 (with persist middleware), Framer Motion v11, Lucide React
**Storage**: `localStorage` — new key `queems-settings` (existing: `queems-best-times`)
**Testing**: Vitest 2 + @testing-library/react
**Target Platform**: SPA — all modern browsers
**Project Type**: Single-project web SPA (`src/`)
**Performance Goals**: Instant toggle response; no noticeable latency on settings read at stage load
**Constraints**: No new runtime dependencies; no network calls; offline-capable
**Scale/Scope**: Single boolean setting; two-tab UI on one page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Spec-First** | ✅ PASS | `spec.md` exists, reviewed, no NEEDS CLARIFICATION markers |
| **II. Puzzle Rule Integrity** | ✅ PASS | No game logic changes; `settings-store` is pure persistence; `autoMarkEnabled` initialization path change is mechanical |
| **III. Component-First** | ✅ PASS | Settings tab will be a focused UI section; no game logic in JSX; settings state lives in `settings-store` |
| **IV. Test-First for Logic** | ✅ PASS | `settings-store.test.ts` written RED before implementation; `game-store.test.ts` updated before store changes |
| **V. YAGNI** | ✅ PASS | One boolean added; `toggleAutoMark` removed (dead code); no speculative settings or abstractions |

**Post-design re-check**: All five gates pass. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/006-settings-automark/
├── plan.md              ← This file
├── research.md          ← Phase 0 — decisions and rationale
├── data-model.md        ← Phase 1 — entities, state transitions, store contracts
├── quickstart.md        ← Phase 1 — how to run and verify
├── checklists/
│   └── requirements.md  ← Spec quality checklist (all green)
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code Changes

```text
src/
├── types/
│   └── index.ts                   ← MODIFY: add AppSettings, SettingsState;
│                                             remove toggleAutoMark from GameStoreState
├── stores/
│   ├── settings-store.ts          ← NEW: Zustand persist store, key queems-settings
│   └── game-store.ts              ← MODIFY: loadStage reads settings store;
│                                             remove toggleAutoMark action
└── pages/
    ├── StageSelectPage.tsx        ← MODIFY: add tab nav + Settings tab with toggle
    └── PuzzlePage.tsx             ← MODIFY: remove Auto-mark toggle UI

tests/
└── logic/
    ├── settings-store.test.ts     ← NEW: TDD unit tests (RED → GREEN)
    └── game-store.test.ts         ← MODIFY: remove toggleAutoMark tests;
                                             update loadStage init expectations
```

**Structure Decision**: Single-project SPA (Option 1). No new directories needed; `settings-store.ts` fits in the existing `src/stores/` directory alongside `best-times-store.ts`.

## Phase 0: Research Summary

All findings consolidated in [research.md](./research.md). No NEEDS CLARIFICATION markers were present in the spec. Key decisions:

1. **Persistence**: Zustand `persist` middleware, key `queems-settings`, mirrors `best-times-store.ts` exactly.
2. **Cross-store read**: `loadStage` calls `useSettingsStore.getState().autoMarkEnabled` — synchronous, no subscription.
3. **Dead code removal**: `toggleAutoMark` action removed from `game-store` and `GameStoreState` interface.
4. **Tab design**: Pill-style tabs, active = `bg-amber-400 text-white`, inactive = `text-gray-500`.
5. **Toggle design**: Custom CSS-transition sliding switch using Tailwind v4 classes; no new motion libraries.

## Phase 1: Design & Contracts

### New Types (`src/types/index.ts`)

```typescript
// NEW — persistent app settings
export interface AppSettings {
  autoMarkEnabled: boolean
}

// NEW — settings store shape
export interface SettingsState extends AppSettings {
  setAutoMark: (value: boolean) => void
}
```

`GameStoreState` change: **remove** `toggleAutoMark: () => void` from the interface.

### New Store (`src/stores/settings-store.ts`)

```typescript
// Zustand persist store — key: queems-settings — default autoMarkEnabled: true
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoMarkEnabled: true,
      setAutoMark(value: boolean) { set({ autoMarkEnabled: value }) },
    }),
    { name: 'queems-settings' },
  ),
)
```

### Modified Store (`src/stores/game-store.ts`)

In `loadStage`:
```typescript
// BEFORE
autoMarkEnabled: false,

// AFTER
autoMarkEnabled: useSettingsStore.getState().autoMarkEnabled,
```

Remove entire `toggleAutoMark` action.

### Settings Tab Toggle Component (inline in `StageSelectPage.tsx`)

The toggle is a small inline presentational element — not complex enough to warrant its own file (YAGNI).

```tsx
// Accessible toggle switch — pure Tailwind v4 + CSS transition
<button
  role="switch"
  aria-checked={autoMarkEnabled}
  aria-label="Auto-mark invalid cells"
  onClick={() => setAutoMark(!autoMarkEnabled)}
  className={cn(
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
    autoMarkEnabled ? 'bg-amber-400' : 'bg-gray-300',
  )}
>
  <span
    className={cn(
      'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
      autoMarkEnabled ? 'translate-x-6' : 'translate-x-1',
    )}
  />
</button>
```

### Contracts

No HTTP API contracts — this is a purely client-side feature. The store interface in `data-model.md` serves as the contract between the Settings tab UI and the settings store.

### TDD Test Outline (`tests/logic/settings-store.test.ts`)

Tests to write RED before implementing the store:

```text
describe('useSettingsStore')
  it('defaults autoMarkEnabled to true')
  it('setAutoMark(false) sets autoMarkEnabled to false')
  it('setAutoMark(true) sets autoMarkEnabled to true after it was false')
  it('setAutoMark is idempotent — calling with same value is a no-op (state unchanged)')
```

`game-store.test.ts` changes:
- Remove any `toggleAutoMark` describe block
- Add test: `loadStage initializes autoMarkEnabled from settings store`
