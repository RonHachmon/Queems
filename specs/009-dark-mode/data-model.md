# Data Model: Dark Mode (009-dark-mode)

## Entity: Theme Preference

**Storage**: `localStorage` key `queems-settings` (Zustand persist — merged with existing Auto-mark setting)

### Shape (merged into existing `queems-settings` JSON)

```json
{
  "state": {
    "autoMarkEnabled": true,
    "darkModeEnabled": false
  },
  "version": 0
}
```

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `darkModeEnabled` | `boolean` | OS `prefers-color-scheme: dark` value | Whether dark mode is active. Defaults to system preference on first launch; persisted on every toggle. |

### Validation Rules

- Must be a boolean. Any non-boolean stored value (e.g., from a corrupted store) is treated as `false`.
- The default is computed once at store initialisation from `window.matchMedia('(prefers-color-scheme: dark)').matches`. After that, only the stored value governs.

### State Transitions

```
[No stored value]
      ↓ (first launch)
OS preference read → darkModeEnabled = true | false
      ↓ (persisted)
[Stored in queems-settings]
      ↓ (user toggles)
darkModeEnabled flips → class applied to <html> → persisted
```

---

## TypeScript Type Changes

### `src/types/index.ts` — `AppSettings` and `SettingsState`

**Before:**
```ts
export interface AppSettings {
  autoMarkEnabled: boolean
}

export interface SettingsState extends AppSettings {
  setAutoMark: (value: boolean) => void
}
```

**After:**
```ts
export interface AppSettings {
  autoMarkEnabled: boolean
  darkModeEnabled: boolean
}

export interface SettingsState extends AppSettings {
  setAutoMark: (value: boolean) => void
  setDarkMode: (value: boolean) => void
}
```

---

## CSS Theme Tokens

The `@variant dark` directive added to `src/assets/index.css` defines when Tailwind's `dark:` prefix activates:

```css
@variant dark (&:where(.dark, .dark *));
```

No new CSS custom properties are introduced. All dark-mode styling is expressed via `dark:` Tailwind utility classes directly in JSX.

The existing region color tokens in `@theme` are intentionally **not** overridden under `.dark`:

```css
/* These are UNCHANGED — region colors persist across themes */
--color-region-blue:   #8bb6ff;
--color-region-green:  #aada94;
/* ... etc. */
```
