# Feature Specification: Dark Mode

**Feature Branch**: `009-dark-mode`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "add a dark mode to the app, keep the puzzle colors the same but the rest change focus on efficiency and UI/UX, eventually add it to the setting tab"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Dark Mode from Settings (Priority: P1)

A user opens the Settings tab on the Stage Select screen and toggles a "Dark Mode" switch. The entire app immediately shifts to a dark color scheme — backgrounds become dark, text becomes light, buttons and cards adapt — while the colored puzzle region tiles remain visually unchanged.

**Why this priority**: Dark mode is the core deliverable. The settings tab is already the designated home for app-level preferences (Auto-mark lives there), making this the natural, expected placement.

**Independent Test**: Open the Stage Select page, navigate to Settings, toggle Dark Mode on. Verify the page background, text, cards, header, and timer all switch to a dark palette. Toggle off and verify they return to light. Puzzle region colors must look identical in both modes.

**Acceptance Scenarios**:

1. **Given** the app is in light mode, **When** the user enables Dark Mode in Settings, **Then** all non-puzzle UI surfaces immediately switch to a dark color scheme without a page reload.
2. **Given** Dark Mode is enabled, **When** the user views a puzzle board, **Then** region colors are visually identical to the light-mode versions.
3. **Given** Dark Mode is enabled, **When** the user disables it in Settings, **Then** the UI immediately returns to the light color scheme.

---

### User Story 2 - Dark Mode Persists Across Sessions (Priority: P2)

A user enables Dark Mode, closes the browser, and returns to the app later. The app remembers their preference and opens in dark mode without them needing to toggle it again.

**Why this priority**: Persistence is essential for a quality UX — a preference that resets on every visit is not a preference at all. Builds on P1 but independently verifiable.

**Independent Test**: Enable Dark Mode, close and reopen the browser tab, verify the app loads in dark mode. Independently testable as a storage/persistence concern.

**Acceptance Scenarios**:

1. **Given** the user has enabled Dark Mode, **When** they close and reopen the app, **Then** the app launches in dark mode.
2. **Given** the user has disabled Dark Mode, **When** they close and reopen the app, **Then** the app launches in light mode.

---

### User Story 3 - Dark Mode Applies to All Screens (Priority: P3)

Both the Stage Select page and the Puzzle page reflect the active dark/light mode consistently. Switching mode on one screen does not cause the other to appear in the wrong theme when navigated to.

**Why this priority**: Full-app consistency is a quality-of-life improvement on top of the already-working toggle. Depends on P1 and P2.

**Independent Test**: Enable Dark Mode in Settings, then navigate to a puzzle and back. Verify both pages are consistently dark. Navigate between them multiple times.

**Acceptance Scenarios**:

1. **Given** Dark Mode is enabled, **When** the user navigates from Stage Select to a Puzzle and back, **Then** both pages display the dark color scheme.
2. **Given** Dark Mode is enabled, **When** the Completion Modal appears, **Then** the modal also uses the dark color scheme.

---

### Edge Cases

- What happens when the user's system preference is dark mode but the app default is light — does the app respect the system preference on first launch? **Assumption**: On first launch (no saved preference), the app defaults to the user's OS dark-mode preference.
- How does the dark mode toggle interact with the puzzle's colored region cells? The region colors must not change between themes.
- What happens when a new puzzle with new region colors is added — do the colors remain unaffected by the active mode?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST provide a Dark Mode toggle in the Settings tab on the Stage Select page.
- **FR-002**: When Dark Mode is active, all non-puzzle UI surfaces (backgrounds, cards, header, navigation, modals, timer, buttons, text) MUST use a dark color palette.
- **FR-003**: Puzzle region colors (the colored tile backgrounds that define board regions) MUST remain visually unchanged regardless of the active mode.
- **FR-004**: The Dark Mode preference MUST be persisted in local storage so it survives browser restarts.
- **FR-005**: On first launch with no saved preference, the app MUST respect the user's operating system dark/light mode setting as the initial default.
- **FR-006**: The Dark Mode toggle MUST apply the theme change immediately (no page reload required).
- **FR-007**: The active theme MUST apply consistently to all pages and UI components: Stage Select, Puzzle page, and Completion Modal.
- **FR-008**: The Dark Mode toggle MUST be placed alongside the existing Auto-mark toggle in the Settings tab.

### Key Entities

- **Theme Preference**: A stored user preference with two values — `light` or `dark`. Persisted across sessions. Defaults to OS preference on first use.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can enable or disable Dark Mode in under 3 taps/clicks from any screen.
- **SC-002**: Theme switching is instant — users perceive no delay or flash when toggling Dark Mode.
- **SC-003**: 100% of non-puzzle UI elements adapt to the active theme; 0% of puzzle region colors change between themes.
- **SC-004**: The user's Dark Mode preference is restored correctly on 100% of return visits (no regression to default).
- **SC-005**: On first launch, the app matches the user's OS dark/light mode preference without requiring manual configuration.

## Assumptions

- The existing `settings-store.ts` (Zustand + persist) will be extended to store the theme preference alongside the Auto-mark setting, following the same localStorage persistence pattern.
- "Puzzle colors" refers exclusively to the colored region tile backgrounds defined in `index.css` and `lib/region-colors.ts`; these are not modified.
- The dark theme palette will be defined as CSS custom properties, ensuring the toggle requires only a class or attribute change at the root element rather than JavaScript style manipulation.
- The OS preference detection is only used as a one-time default on first launch; after that, the stored preference governs.
