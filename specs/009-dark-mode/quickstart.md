# Quickstart: Implementing Dark Mode (009-dark-mode)

## Prerequisites

- Node.js + pnpm installed
- Branch `009-dark-mode` checked out (already done by `/speckit.specify`)
- Dev server: `pnpm dev` (http://localhost:5173)
- Tests: `pnpm vitest --watch`

---

## Implementation Order

Follow this order to minimise merge conflicts and keep the app in a working state at every step:

### Step 1 — CSS: Activate dark variant (5 min)

Edit `src/assets/index.css`. Add the `@variant dark` directive immediately after the `@import`:

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

@theme {
  /* region colors — unchanged */
  ...
}
```

**Verify**: `pnpm build` passes. No visual change yet.

---

### Step 2 — Types: Extend AppSettings (5 min)

Edit `src/types/index.ts`. Add `darkModeEnabled` to `AppSettings` and `setDarkMode` to `SettingsState`:

```ts
export interface AppSettings {
  autoMarkEnabled: boolean
  darkModeEnabled: boolean         // NEW
}

export interface SettingsState extends AppSettings {
  setAutoMark: (value: boolean) => void
  setDarkMode: (value: boolean) => void  // NEW
}
```

**Verify**: TypeScript errors appear in `settings-store.ts` (expected — fix in Step 3).

---

### Step 3 — Store: Add darkModeEnabled (10 min)

Edit `src/stores/settings-store.ts`:

```ts
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoMarkEnabled: true,
      darkModeEnabled: prefersDark,   // NEW — OS default on first launch

      setAutoMark(value: boolean) {
        set({ autoMarkEnabled: value })
      },
      setDarkMode(value: boolean) {   // NEW
        set({ darkModeEnabled: value })
      },
    }),
    { name: 'queems-settings' },
  ),
)
```

**Verify**: TypeScript errors clear. `pnpm vitest` passes.

---

### Step 4 — App: Apply dark class to `<html>` (5 min)

Edit `src/App.tsx`. Subscribe to `darkModeEnabled` and apply the class:

```tsx
import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'
// ...existing imports...

export default function App() {
  const darkModeEnabled = useSettingsStore((s) => s.darkModeEnabled)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkModeEnabled)
  }, [darkModeEnabled])

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
```

**Verify**: Manually add `class="dark"` to `<html>` in DevTools — no visual change yet (no dark classes on components). Remove it.

---

### Step 5 — Components: Add dark: variants (30 min)

Apply `dark:` Tailwind variants to each component. The pattern is:

- `bg-white` → `bg-white dark:bg-gray-800`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- `bg-gray-100` → `bg-gray-100 dark:bg-gray-700`
- `text-gray-900` → `text-gray-900 dark:text-gray-100`
- `text-gray-800` → `text-gray-800 dark:text-gray-200`
- `text-gray-700` → `text-gray-700 dark:text-gray-300`
- `text-gray-500` → `text-gray-500 dark:text-gray-400`
- `text-gray-400` → `text-gray-400 dark:text-gray-500`
- `border-gray-100` → `border-gray-100 dark:border-gray-700`
- `divide-gray-100` → `divide-gray-100 dark:divide-gray-700`
- `bg-gray-200` (toggle off-state) → `bg-gray-200 dark:bg-gray-600`

**Files to update** (in suggested order):
1. `src/components/Timer.tsx`
2. `src/components/StageCard.tsx`
3. `src/components/CompletionModal.tsx`
4. `src/pages/PuzzlePage.tsx`
5. `src/pages/StageSelectPage.tsx`

**Do NOT modify**: `src/components/Board/Cell.tsx` region color classes (`bg-region-*`).

**Verify**: After each file, toggle `dark` class in DevTools and check visually.

---

### Step 6 — Settings UI: Dark Mode toggle (15 min)

Edit `src/pages/StageSelectPage.tsx`. Add a second setting row for Dark Mode directly below the Auto-mark row:

```tsx
const { autoMarkEnabled, setAutoMark, darkModeEnabled, setDarkMode } = useSettingsStore()

// Inside the settings panel, after the Auto-mark row:
<div className="flex items-center justify-between gap-4 px-5 py-4 min-h-[64px]">
  <div className="flex flex-col gap-0.5">
    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Dark mode</span>
    <span className="text-xs text-gray-400 dark:text-gray-500 leading-snug">
      Switch to a darker color scheme
    </span>
  </div>
  <button
    type="button"
    role="switch"
    aria-checked={darkModeEnabled}
    aria-label="Dark mode"
    onClick={() => setDarkMode(!darkModeEnabled)}
    className={cn(
      'relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400',
      darkModeEnabled ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-600',
    )}
  >
    <span
      className={cn(
        'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        darkModeEnabled ? 'translate-x-6' : 'translate-x-1',
      )}
    />
  </button>
</div>
```

**Verify**: Toggle appears in Settings tab. Clicking it switches the full app theme instantly.

---

### Step 7 — Manual QA checklist

- [ ] Toggle Dark Mode in Settings → entire app (both pages) switches immediately
- [ ] Puzzle region colors (blue, green, red, etc.) look identical in light and dark mode
- [ ] Refresh page in dark mode → app reloads in dark mode
- [ ] Refresh page after disabling dark mode → app reloads in light mode
- [ ] Completion modal is fully themed (no white flash)
- [ ] Timer, Undo, Reset buttons are readable in dark mode
- [ ] First visit with OS dark preference → app opens in dark mode automatically

---

## Running Tests

```bash
pnpm vitest          # all tests
pnpm vitest --watch  # watch mode during development
```

No new test files are required for this feature (no game logic added). The existing store tests cover persistence. A smoke test for the settings toggle is optional per Constitution IV.
