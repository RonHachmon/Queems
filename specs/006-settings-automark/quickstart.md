# Quickstart: Settings Tab with Persisted Auto-Mark Toggle

**Feature**: 006-settings-automark
**Branch**: `006-settings-automark`
**Date**: 2026-02-19

---

## Prerequisites

- Node.js 20+ and pnpm installed
- Repo cloned, dependencies installed (`pnpm install`)
- Branch `006-settings-automark` checked out

```bash
git checkout 006-settings-automark
pnpm install   # if not already done
```

---

## Run Dev Server

```bash
pnpm dev
# → http://localhost:5173
```

Navigate to `/` to see the Stage Select page with the new "Stages" / "Settings" tabs.

---

## Run Tests

```bash
pnpm vitest                      # run all tests once
pnpm vitest --watch              # watch mode during development
pnpm vitest tests/logic/settings-store.test.ts  # run only settings-store tests
```

**TDD order** (per Constitution IV):
1. Write `tests/logic/settings-store.test.ts` → confirm RED
2. Implement `src/stores/settings-store.ts` → confirm GREEN
3. Update `tests/logic/game-store.test.ts` → confirm RED for changed behavior
4. Update `src/stores/game-store.ts` → confirm GREEN

---

## Implementation Order (dependency-safe)

```
1. src/types/index.ts              ← Add AppSettings, SettingsState; remove toggleAutoMark
2. tests/logic/settings-store.test.ts  ← Write RED tests (TDD)
3. src/stores/settings-store.ts    ← Implement (make tests GREEN)
4. src/stores/game-store.ts        ← Update loadStage to read settings; remove toggleAutoMark
5. tests/logic/game-store.test.ts  ← Update for removed toggleAutoMark
6. src/pages/PuzzlePage.tsx        ← Remove toggle UI and toggleAutoMark destructuring
7. src/pages/StageSelectPage.tsx   ← Add tabs + Settings tab with styled toggle
```

---

## Key Files

| File | Role |
|------|------|
| `src/stores/settings-store.ts` | NEW — persisted settings store |
| `src/types/index.ts` | MODIFIED — new `AppSettings` / `SettingsState` types; `GameStoreState` loses `toggleAutoMark` |
| `src/stores/game-store.ts` | MODIFIED — `loadStage` reads settings store; `toggleAutoMark` removed |
| `src/pages/StageSelectPage.tsx` | MODIFIED — tab navigation + Settings tab |
| `src/pages/PuzzlePage.tsx` | MODIFIED — remove Auto-mark toggle |
| `tests/logic/settings-store.test.ts` | NEW — TDD unit tests |
| `tests/logic/game-store.test.ts` | MODIFIED — remove `toggleAutoMark` tests |

---

## Verify the Feature

1. Open `http://localhost:5173`
2. Confirm two tabs are visible: **Stages** and **Settings**
3. Click **Settings** — confirm the "Auto-mark invalid cells" toggle is ON by default
4. Toggle it OFF — confirm the toggle animates and the label updates
5. Hard-refresh the page — confirm Settings tab still shows the toggle as OFF
6. Click **Stages**, start a puzzle, place a queen — confirm NO cells are auto-marked
7. Go back, open Settings, toggle ON
8. Start a puzzle, place a queen — confirm invalid cells ARE auto-marked
9. Open browser DevTools → Application → localStorage — confirm `queems-settings` key exists with `{"state":{"autoMarkEnabled":false},"version":0}` (or `true`)
10. Confirm the Auto-mark toggle is ABSENT from the puzzle page

---

## Design Reference

The Settings tab uses the app's existing design tokens:
- Background: `bg-gray-50` (matches page background)
- Active tab: `bg-amber-400 text-white` (matches Crown icon color)
- Inactive tab: `text-gray-500 hover:text-gray-700`
- Toggle track ON: `bg-amber-400`
- Toggle track OFF: `bg-gray-300`
- Toggle thumb: `bg-white` with `shadow-sm`
- Typography: same `text-sm` / `text-gray-600` as existing labels
