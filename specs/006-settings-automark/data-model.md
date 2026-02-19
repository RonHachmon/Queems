# Data Model: Settings Tab with Persisted Auto-Mark Toggle

**Feature**: 006-settings-automark
**Date**: 2026-02-19

---

## New Entity: AppSettings

Represents global user preferences that survive between sessions.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `autoMarkEnabled` | `boolean` | `true` | Whether invalid cells are automatically marked with X when a queen is placed |

**Validation rules**:
- Must be a strict boolean (no `undefined`, no string coercion)
- Default is `true` — new users get the feature enabled

**Persistence**:
- Stored in `localStorage` under key `queems-settings`
- Written immediately on every toggle change
- Read synchronously at app startup and at stage load

---

## New Store: SettingsState

Zustand persistent store that owns `AppSettings`.

| Member | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `autoMarkEnabled` | state field | `boolean` | Current value of the setting |
| `setAutoMark` | action | `(value: boolean) => void` | Overwrite the setting with a new value and persist |

**localStorage key**: `queems-settings`
**Migration**: None required — first read with an empty store returns the default value `true`.

---

## Modified Entity: GameSession (existing)

The `autoMarkEnabled` field already exists in `GameSession`. The only change is how it is initialized.

| Field | Previous default | New initialization |
|-------|-----------------|-------------------|
| `autoMarkEnabled` | Hard-coded `false` in `loadStage` | Read from `useSettingsStore.getState().autoMarkEnabled` in `loadStage` |

---

## Removed Action: `toggleAutoMark` (from GameStoreState)

This action is removed because:
- It was the in-game toggle handler, only called from `PuzzlePage`
- The toggle moves to `StageSelectPage` (Settings tab), which writes directly to `SettingsStore`
- During a puzzle session, `autoMarkEnabled` is fixed at stage-load time (not toggled mid-game)

**Replacement**: `useSettingsStore.setAutoMark(value)` called from the Settings tab component.

---

## State Transitions

```
First visit (no localStorage):
  SettingsStore initializes → autoMarkEnabled = true (default)

User toggles OFF in Settings tab:
  setAutoMark(false) → autoMarkEnabled = false → persisted to localStorage

User starts puzzle:
  loadStage(stageId) → reads useSettingsStore.getState().autoMarkEnabled
                     → GameSession.autoMarkEnabled = false (reflects saved pref)

User toggles ON in Settings tab (after navigating back):
  setAutoMark(true) → autoMarkEnabled = true → persisted to localStorage

User starts next puzzle:
  loadStage(stageId) → reads useSettingsStore.getState().autoMarkEnabled
                     → GameSession.autoMarkEnabled = true
```

---

## UI State (ephemeral, not persisted)

| Component | State | Type | Description |
|-----------|-------|------|-------------|
| `StageSelectPage` | `activeTab` | `'stages' \| 'settings'` | Which tab is currently visible; resets to `'stages'` on page reload |
