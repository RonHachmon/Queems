# Contract: localStorage Schema (queems-settings)

**Type**: Client-side storage contract (no network API)
**Storage Key**: `queems-settings`
**Format**: JSON (Zustand persist middleware)

---

## Schema

```json
{
  "state": {
    "autoMarkEnabled": true,
    "darkModeEnabled": false
  },
  "version": 0
}
```

## Field Definitions

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `state.autoMarkEnabled` | boolean | yes | `true` | Existing field — unchanged |
| `state.darkModeEnabled` | boolean | yes | OS preference | New field added by this feature |
| `version` | number | yes | `0` | Zustand version marker — unchanged |

## Compatibility

- **Existing sessions** (no `darkModeEnabled` in storage): Zustand's `merge` strategy fills missing keys with store defaults. The default is evaluated from `window.matchMedia('(prefers-color-scheme: dark)').matches` at store creation time.
- **New sessions**: Full schema written on first toggle.
- **No migration needed**: Adding a new field to the persisted store is backwards-compatible.

## CSS Side-Effect Contract

When `darkModeEnabled` changes:

1. `document.documentElement.classList.toggle('dark', darkModeEnabled)` is called.
2. Tailwind's `dark:` variant classes activate for all elements matching `:where(.dark, .dark *)`.
3. Region color tokens (`--color-region-*`) are **not** affected.
