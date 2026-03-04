# Feature Specification: Stage Select Pagination

**Feature Branch**: `008-stage-select-pagination`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "add pagination to the board Stage select page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Stages One Page at a Time (Priority: P1)

A user opens the Stage Select page and sees a manageable subset of stages instead of a long scrolling list. They can navigate forward and backward through pages to find a stage to play.

**Why this priority**: Core value — the feature does nothing without basic page navigation. This is the MVP slice that delivers the entire benefit.

**Independent Test**: Can be fully tested by loading the Stage Select page, verifying only a fixed number of stage cards are visible, then clicking "Next" and confirming a different set of cards appears.

**Acceptance Scenarios**:

1. **Given** the Stage Select page is open, **When** the Stages tab is active, **Then** only the first page of stage cards is displayed (not all stages at once).
2. **Given** the user is on the first page, **When** they click "Next", **Then** the next page of stage cards replaces the current view and the page indicator updates.
3. **Given** the user is on the last page, **When** they try to go forward, **Then** the "Next" button is disabled or absent.
4. **Given** the user is on the first page, **When** they try to go backward, **Then** the "Previous" button is disabled or absent.

---

### User Story 2 - Know Position Within All Stages (Priority: P2)

A user can see at a glance which page they are on and how many pages exist in total, so they can navigate purposefully to a specific area.

**Why this priority**: Orientation context improves navigation efficiency but the feature still works without it.

**Independent Test**: Load the Stages tab and verify a page indicator (e.g., "Page 2 of 4") is visible and updates correctly when navigating.

**Acceptance Scenarios**:

1. **Given** there are multiple pages, **When** the Stages tab is visible, **Then** a page indicator showing current page and total pages is displayed.
2. **Given** the user navigates to a new page, **When** the page changes, **Then** the page indicator reflects the new current page number.

---

### User Story 3 - Return to First Page When Re-entering Stages Tab (Priority: P3)

A user who switches to the Settings tab and back returns to page 1 of the stages list, providing a consistent and predictable experience.

**Why this priority**: Nice-to-have consistency behavior. Existing sessions are short so reset-on-tab-switch is sensible.

**Independent Test**: Navigate to page 2, switch to Settings tab, switch back to Stages tab, and verify page 1 is shown.

**Acceptance Scenarios**:

1. **Given** a user is on page 3 of stages, **When** they switch to the Settings tab and then back to the Stages tab, **Then** the stages grid resets to page 1.

---

### Edge Cases

- What happens when the total number of stages is not evenly divisible by the page size? The last page shows fewer cards than a full page.
- What happens if there is only one page of stages? Pagination controls are hidden entirely.
- What happens when new stages are added and the page count grows? The total page count updates automatically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Stages tab MUST display a fixed number of stage cards per page (default: 12 cards per page).
- **FR-002**: The Stages tab MUST show Previous and Next navigation buttons that move between pages.
- **FR-003**: The Previous button MUST be disabled (or hidden) when the user is on the first page.
- **FR-004**: The Next button MUST be disabled (or hidden) when the user is on the last page.
- **FR-005**: A page indicator MUST display the current page number and total page count (e.g., "2 / 4").
- **FR-006**: If the total number of stages fits on one page, pagination controls MUST NOT be shown.
- **FR-007**: The current page MUST reset to page 1 when the user switches away from and back to the Stages tab.
- **FR-008**: The last page MAY display fewer than the maximum number of cards when stages do not divide evenly.

### Key Entities

- **Page**: A bounded view of stage cards; defined by a page number (1-based) and a page size.
- **Stage Card**: A single selectable item representing one puzzle stage, displaying its best time and completion status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Stages tab never displays more than 12 stage cards simultaneously.
- **SC-002**: A user can reach any stage card within 3 page-navigation actions from page 1 (assuming ≤ 48 total stages).
- **SC-003**: Pagination controls are absent when all stages fit on a single page.
- **SC-004**: The page indicator is always in sync with the currently displayed set of stage cards (zero desync occurrences during navigation).

## Assumptions

- Page size is fixed at 12 cards per page. This fits the existing 3-column grid layout (4 rows × 3 columns) and is appropriate for the current ~42 stage count.
- Pagination state is ephemeral (not persisted to localStorage); page resets to 1 on every page load and on tab switch.
- No animated transition between pages is required; a simple replacement of the visible cards is sufficient.
- The Settings tab and its layout are unaffected by this feature.
