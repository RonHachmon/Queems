# Research: Settings Tab with Persisted Auto-Mark Toggle

**Feature**: 006-settings-automark
**Date**: 2026-02-19
**Status**: Complete — no NEEDS CLARIFICATION markers in spec

---

## Decision 1: Settings Persistence Pattern

**Decision**: Use Zustand `persist` middleware with `localStorage`, key `queems-settings` — mirroring the existing `best-times-store.ts` pattern exactly.

**Rationale**: The project already uses this pattern for `best-times-store`. Consistency avoids a second persistence mechanism, keeps the codebase idiomatic, and requires zero new dependencies.

**Alternatives considered**:
- Raw `localStorage` API calls — rejected: doesn't integrate with Zustand reactivity; violates Component-First principle (logic in components)
- `sessionStorage` — rejected: doesn't survive browser close (spec requires persistence)
- Separate cookie — rejected: overkill for a simple boolean flag

---

## Decision 2: Cross-Store Dependency in `loadStage`

**Decision**: `game-store.ts` `loadStage` reads `useSettingsStore.getState().autoMarkEnabled` at call time to initialize the game session's `autoMarkEnabled` field.

**Rationale**: Zustand's `getState()` is a synchronous read with no subscription cost. This is the idiomatic Zustand pattern for one-time cross-store reads. It avoids subscribing the game store to settings store updates (which would add unnecessary complexity per YAGNI).

**Alternatives considered**:
- Subscribe `game-store` to `settings-store` changes — rejected: over-engineering for a setting that only matters at stage load time
- Pass `autoMarkEnabled` as a parameter to `loadStage` — rejected: callers would need to import settings store, spreading the concern unnecessarily
- Single store combining both — rejected: violates single-responsibility; best-times and settings are unrelated domains

---

## Decision 3: Remove `toggleAutoMark` from Game Store

**Decision**: Remove the `toggleAutoMark` action from `game-store.ts` and from the `GameStoreState` interface. The Settings store's `setAutoMark` action replaces it.

**Rationale**: `toggleAutoMark` was only called from `PuzzlePage.tsx`. Once the toggle moves to `StageSelectPage`, the in-game toggle action becomes dead code. Per YAGNI (Constitution V), dead code must not be retained.

**Alternatives considered**:
- Keep `toggleAutoMark` as a no-op fallback — rejected: YAGNI forbids dead code
- Rename to `_toggleAutoMark` — rejected: unused private methods are still dead code

**Impact**: `GameStoreState` interface loses one action; existing test coverage for `toggleAutoMark` is deleted.

---

## Decision 4: Tab UI Pattern

**Decision**: Pill-style tab bar with two tabs ("Stages" / "Settings"). Active tab: `bg-amber-400 text-white` (matching the Crown icon). Inactive tab: `text-gray-500 hover:text-gray-700`. Tab state is local React `useState` — ephemeral, not persisted.

**Rationale**: Amber-400 is already the app's primary accent color (Crown icon, future stage markers). Using it as the active-tab indicator creates visual consistency with zero new design tokens. A pill style is lighter-weight than a full underline or bordered tab, fitting the app's minimal aesthetic.

**Alternatives considered**:
- Underline tabs — rejected: requires more DOM structure; feels heavier for a two-item tab bar
- Separate route `/settings` — rejected: overkill; settings is a lightweight panel, not a full page

---

## Decision 5: Toggle Switch Design

**Decision**: A custom-styled toggle switch (sliding pill) using pure Tailwind v4 classes and a CSS `transition`. Track color: `bg-amber-400` (ON) / `bg-gray-200` (OFF). Thumb: white circle. No Framer Motion dependency for the thumb (CSS transition suffices and avoids library overhead for a simple boolean).

**Rationale**: The existing UI uses plain Tailwind transitions elsewhere (e.g., hover states on buttons). A CSS transition on the thumb translate is sufficient and consistent. Using `framer-motion` for a simple toggle would be over-engineering (Constitution V).

**Alternatives considered**:
- Plain `<input type="checkbox">` — rejected: spec requires enhanced visuals cohesive with the app
- Framer Motion `AnimatePresence` — rejected: overkill; simple CSS `transition` covers this use case

---

## Summary of Files Affected

| File | Change Type | Reason |
|------|-------------|--------|
| `src/stores/settings-store.ts` | **NEW** | Persisted settings with `autoMarkEnabled: true` default |
| `src/types/index.ts` | **MODIFY** | Add `AppSettings`, `SettingsState`; remove `toggleAutoMark` from `GameStoreState` |
| `src/stores/game-store.ts` | **MODIFY** | `loadStage` reads from settings store; remove `toggleAutoMark` action |
| `src/pages/StageSelectPage.tsx` | **MODIFY** | Add tab navigation + Settings tab with styled toggle |
| `src/pages/PuzzlePage.tsx` | **MODIFY** | Remove Auto-mark toggle UI and `toggleAutoMark` import |
| `tests/logic/settings-store.test.ts` | **NEW** | TDD tests (written RED before implementation) |
| `tests/logic/game-store.test.ts` | **MODIFY** | Remove `toggleAutoMark` tests; update `loadStage` init test |
