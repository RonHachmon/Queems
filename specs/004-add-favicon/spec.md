# Feature Specification: App Favicon

**Feature Branch**: `004-add-favicon`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "add a favicon fitting for the app"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Favicon shown in browser tab (Priority: P1)

A user opens the Queems app in their browser. The browser tab displays a small recognisable icon instead of the generic blank-page placeholder, helping the user identify the tab at a glance when multiple tabs are open.

**Why this priority**: This is the core deliverable — without it the feature does not exist.

**Independent Test**: Open the app URL and observe the browser tab. A custom icon must appear.

**Acceptance Scenarios**:

1. **Given** a user navigates to the app, **When** the page loads, **Then** the browser tab shows the Queems favicon instead of a blank or default icon.
2. **Given** the user has multiple tabs open, **When** they look at the Queems tab, **Then** the favicon is distinct and recognisable among other tabs.

---

### User Story 2 - Favicon visible when bookmarked (Priority: P2)

A user bookmarks the Queems app. The bookmark entry shows the custom favicon, making the app easy to find in the bookmarks bar or menu.

**Why this priority**: Bookmarks are a common second touchpoint; a correct favicon here reinforces the app's identity.

**Independent Test**: Bookmark the app and verify the custom icon appears in the bookmarks bar.

**Acceptance Scenarios**:

1. **Given** the user bookmarks the app, **When** they view their bookmarks bar, **Then** the Queems favicon appears next to the bookmark title.

---

### Edge Cases

- What happens when the browser does not support a particular icon size? The browser falls back to the next available size.
- How does the favicon appear on a high-DPI / Retina display? A high-resolution variant must be provided so the icon is sharp.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display a custom favicon in the browser tab on all major browsers (Chrome, Firefox, Safari, Edge).
- **FR-002**: The favicon design MUST visually relate to the Queems brand (crown / queen chess piece and/or the letter Q motif, using the app's amber colour palette).
- **FR-003**: The favicon MUST be provided at a minimum of two sizes (16×16 and 32×32 pixels) to support standard and high-DPI displays.
- **FR-004**: The favicon MUST be declared in the HTML `<head>` so browsers discover it automatically without relying on the default `/favicon.ico` convention.
- **FR-005**: The favicon MUST remain visible and recognisable at 16×16 pixels (the smallest common browser-tab size).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Queems favicon is displayed in the browser tab on Chrome, Firefox, Safari, and Edge without any additional user action.
- **SC-002**: The favicon is visually sharp and not blurry on both standard and high-DPI screens.
- **SC-003**: The icon is recognisable as distinct from a generic placeholder at 16×16 pixels.
- **SC-004**: Bookmarking the app in any supported browser shows the custom favicon next to the bookmark title.

## Assumptions

- The favicon will be an SVG or PNG asset; an `.ico` fallback may be included for older browsers but is not strictly required.
- The design uses the existing amber accent colour (`#f59e0b` / Tailwind `amber-400`) consistent with the app's current colour scheme.
- No animated or dynamic favicons are in scope for this feature.
