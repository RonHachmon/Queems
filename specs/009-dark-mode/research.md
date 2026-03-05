# Research: Dark Mode (009-dark-mode)

## 1. Tailwind v4 Dark Mode Strategy

**Decision**: Class-based dark mode using `@variant dark` directive in CSS + `dark` class on `<html>`.

**Rationale**: Tailwind v4 ships without a `darkMode` config option (that was v3). Instead, arbitrary variants are declared via `@variant`. A `@variant dark (&:where(.dark, .dark *));` block in `index.css` teaches Tailwind to honour the `dark:` prefix whenever any ancestor carries the `.dark` class. This is idiomatic v4 and requires zero build config changes.

**Alternatives considered**:
- **`prefers-color-scheme` media query via CSS only** — Cannot be overridden by user toggle; rejected because the spec requires an explicit user-controlled setting.
- **CSS custom property swapping** — Defining two sets of `--color-*` tokens and overriding them under `.dark` works, but means replacing every hardcoded Tailwind color class in JSX with a semantic token class. More migration work for no additional benefit given how Tailwind v4's `dark:` variant already provides this cleanly.
- **Third-party theme library** — Overkill for a bounded-scope app (Constitution V: YAGNI).

---

## 2. OS Preference Detection on First Launch

**Decision**: Read `window.matchMedia('(prefers-color-scheme: dark)').matches` once during store hydration to set the initial `darkModeEnabled` value when no stored preference exists.

**Rationale**: `prefers-color-scheme` is universally supported in all modern browsers. Reading it at store initialisation time (before any render) avoids a flash-of-wrong-theme. The stored value then takes over on every subsequent visit.

**Alternatives considered**:
- **Reading inside a React `useEffect`** — Runs after first render, causing a visible flash. Rejected.
- **Server-side rendering hints** — Not applicable; this is a Vite SPA with no SSR.

---

## 3. Where to Apply the `dark` Class

**Decision**: Apply `dark` class to `document.documentElement` (`<html>`) via a `useEffect` in `App.tsx`, subscribed to the `darkModeEnabled` value from `settings-store`.

**Rationale**: Applying to `<html>` means all CSS within the document (including any future scrollbar or meta-theme-color styling) inherits the mode. A single `useEffect` in `App.tsx` is the narrowest, cleanest place — it runs once on mount and on every toggle, with no side effects on unmount (the class will remain, which is correct).

**Alternatives considered**:
- **A dedicated `ThemeProvider` component** — Adds an abstraction layer for one use case; Constitution V (YAGNI) says no.
- **Applying to `<body>` instead** — `<html>` is preferred to cover `<head>` content like scrollbar styles; minor difference but no downside to `<html>`.

---

## 4. Store Extension

**Decision**: Extend `settings-store.ts` (Zustand + persist) by adding `darkModeEnabled: boolean` and `setDarkMode(value: boolean)` to the existing store. The same `queems-settings` localStorage key is used, so both settings persist together.

**Rationale**: The settings-store already uses Zustand's `persist` middleware with the `queems-settings` key. Adding a field to the same store is idiomatic and avoids a second localStorage entry. Zustand's persist middleware merges stored partial state with defaults, so existing sessions without `darkModeEnabled` will receive the OS-preference default on first load.

**Alternatives considered**:
- **New `theme-store.ts`** — A separate store for one boolean field is unnecessary complexity (Constitution V).
- **`localStorage` read directly in components** — Bypasses the store contract; breaks single-source-of-truth.

---

## 5. Which UI Surfaces Need Dark Variants

**Scope of changes** (all use hardcoded Tailwind gray/white classes today):

| File | Key classes to darken |
|------|-----------------------|
| `StageSelectPage.tsx` | `bg-gray-50`, `text-gray-900`, `text-gray-500`, `bg-gray-100`, `bg-white`, tab bar, settings panel |
| `PuzzlePage.tsx` | `bg-gray-50`, `text-gray-500`, `text-gray-600`, button colors |
| `StageCard.tsx` | `bg-white`, `text-gray-800`, `text-gray-400`, `border-gray-100` |
| `CompletionModal.tsx` | `bg-white`, `text-gray-900`, `text-gray-800`, `bg-gray-100`, `bg-gray-900` |
| `Timer.tsx` | `text-gray-700` |

**Puzzle region colors (NOT changed)**: All `bg-region-*` classes in `Cell.tsx` are derived from CSS tokens in `@theme` and are intentionally excluded from dark-mode overrides.

---

## 6. Flash-of-Wrong-Theme (FOIT) Mitigation

**Decision**: Initialise `darkModeEnabled` in the Zustand store using a custom `onRehydrateStorage` callback — not relying on `useEffect` timing — so the class is applied before React paints.

**Rationale**: Standard Zustand persist rehydrates synchronously from localStorage on the first read when `storage: localStorage` is used (not async). Applying `document.documentElement.classList` in an `App.tsx` `useEffect` subscribed to the hydrated store value will run before the browser has a chance to paint (React 19 batches effects before first commit). This is sufficient for an SPA with no SSR.

For extra safety, a `<script>` tag can be injected into `index.html` to pre-apply the class before React loads — but this is an optimisation not required by the spec.

---

## 7. No API Contracts Required

This feature is entirely client-side. There are no network requests, no new REST endpoints, and no inter-service communication. The only "contract" is the localStorage schema (see `data-model.md`).
