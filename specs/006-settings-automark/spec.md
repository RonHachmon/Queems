# Feature Specification: Settings Tab with Persisted Auto-Mark Toggle

**Feature Branch**: `006-settings-automark`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "Move the 'Auto-mark invalid cells' toggle from PuzzlePage to StageSelectPage, put it in a settings tab, default on, persist in localStorage, enhanced visuals"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access and Toggle Auto-Mark from Settings (Priority: P1)

A player visits the Stage Select screen and wants to control whether invalid cells are automatically highlighted when they place a queen. They find a "Settings" tab on the Stage Select page, toggle Auto-mark on or off, and this preference is remembered the next time they open the app.

**Why this priority**: This is the core of the feature — relocating the setting to the right place and making it persistent. Without this, there is no feature.

**Independent Test**: Navigate to the Stage Select page, open the Settings tab, toggle the Auto-mark control, close the browser, reopen, and confirm the setting was retained.

**Acceptance Scenarios**:

1. **Given** the user is on the Stage Select page, **When** they open the Settings tab, **Then** they see an "Auto-mark invalid cells" toggle that reflects the currently saved preference.
2. **Given** Auto-mark is OFF, **When** the user enables it in Settings, **Then** the preference is saved immediately to persistent storage.
3. **Given** Auto-mark is ON, **When** the user disables it in Settings, **Then** the preference is saved immediately to persistent storage.
4. **Given** a first-time user (no saved preference), **When** they open Settings, **Then** Auto-mark defaults to ON.
5. **Given** the user saved a preference and closed the app, **When** they reopen and visit Settings, **Then** their saved preference is shown and applied.

---

### User Story 2 - Auto-Mark Setting Applies in Puzzle (Priority: P2)

After the user sets their Auto-mark preference in Settings, they start a puzzle. The behavior during gameplay reflects whatever was chosen in Settings — no toggle is shown in the puzzle UI.

**Why this priority**: The setting must actually affect gameplay. Without this story the UI change is cosmetic only.

**Independent Test**: Set Auto-mark ON in Settings, start any puzzle, place a queen, verify invalid cells are marked automatically. Then set it OFF, restart the puzzle, and verify no auto-marks appear.

**Acceptance Scenarios**:

1. **Given** Auto-mark is ON in Settings, **When** the user starts a puzzle and places a queen, **Then** invalid cells are automatically marked with X.
2. **Given** Auto-mark is OFF in Settings, **When** the user starts a puzzle and places a queen, **Then** no cells are auto-marked.
3. **Given** a puzzle was in progress, **When** the user navigates back and changes Auto-mark in Settings, **Then** starting a new puzzle respects the updated setting.

---

### User Story 3 - Visually Cohesive Settings Tab (Priority: P3)

The Settings tab on the Stage Select page looks and feels like a natural part of the app — matching the existing design language (color palette, typography, spacing, component style) rather than feeling like an afterthought.

**Why this priority**: Visual polish improves user trust but does not block functionality.

**Independent Test**: A person unfamiliar with the codebase can view the Settings tab screenshot and reasonably conclude it belongs to the same design system as the rest of the app.

**Acceptance Scenarios**:

1. **Given** the Stage Select page, **When** the Settings tab is active, **Then** the toggle control uses the app's established color scheme (amber/gray tones) and typography.
2. **Given** the Settings tab is visible, **When** the toggle is switched, **Then** there is a smooth visual transition consistent with the rest of the UI.
3. **Given** both the "Stages" tab and the "Settings" tab are present, **When** the user switches between them, **Then** the active tab is clearly distinguished from the inactive one.

---

### Edge Cases

- What happens when localStorage is unavailable or throws an error? The feature must degrade gracefully, defaulting to Auto-mark ON without crashing.
- What if the user navigates directly to a puzzle URL without visiting Stage Select? The puzzle must still read the persisted preference (or use the default ON).
- What happens if a puzzle is currently in progress when the setting changes (via browser back + Settings tab)? The updated setting applies to the next queen placement or new puzzle load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Stage Select page MUST display tab navigation with at least two tabs: "Stages" (existing stage grid) and "Settings".
- **FR-002**: The Settings tab MUST contain an "Auto-mark invalid cells" toggle control with a label and descriptive supporting text.
- **FR-003**: The Auto-mark toggle MUST default to ON for first-time users (no stored preference).
- **FR-004**: The Auto-mark toggle state MUST be persisted to localStorage immediately when changed, using the storage key `queems-settings`.
- **FR-005**: The persisted Auto-mark setting MUST be read and applied to gameplay before any puzzle begins.
- **FR-006**: The Auto-mark toggle MUST be removed from PuzzlePage — it must no longer appear during active gameplay.
- **FR-007**: The game session initialization MUST read Auto-mark preference from the persisted settings store, not use a hard-coded default.
- **FR-008**: The Settings tab UI MUST use the app's established visual language (colors, fonts, spacing, motion) to feel cohesive.
- **FR-009**: Tab switching between "Stages" and "Settings" MUST have a clear active/inactive visual state.
- **FR-010**: Toggle and tab controls MUST be keyboard-navigable and have appropriate accessible labels.

### Key Entities

- **AppSettings**: Global user preferences, persisted in localStorage. Key attribute: `autoMarkEnabled` (boolean, default `true`).
- **SettingsStore**: A new persistent store that owns `AppSettings` and exposes a `setAutoMark(value: boolean)` action. Analogous to the existing best-times store.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Auto-mark preference survives a full browser close and reopen — verified in 100% of automated test cases.
- **SC-002**: The Auto-mark toggle is absent from PuzzlePage across all puzzle stages — verified by inspection of rendered output.
- **SC-003**: The Settings tab is reachable within one interaction (one click/tap) from the Stage Select page.
- **SC-004**: First-time users (cleared localStorage) see Auto-mark enabled by default — verified across all supported browsers.
- **SC-005**: The Settings tab visual design passes a side-by-side comparison with existing UI components and is judged consistent by a reviewer unfamiliar with the code.

## Assumptions

- The `queems-settings` localStorage key is new and does not conflict with the existing `queems-best-times` key.
- The "Stages" tab represents the existing stage grid content that currently fills the entire Stage Select page.
- Tab selection state (which tab is active) is ephemeral — it resets to "Stages" on page reload and is not persisted.
- Only one setting exists in this iteration; the Settings tab structure should accommodate future additions without a redesign (but no speculative settings are added now).
- The existing `autoMarkEnabled` field in the game store remains but is initialized from the settings store rather than being hard-coded.
