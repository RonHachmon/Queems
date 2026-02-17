# Feature Specification: Queems — LinkedIn Queens Puzzle Mock

**Feature Branch**: `001-queens-mock`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "build a mock of the linkedin queens puzzle game, where you can revisit all available stages and keeps track of your highest speed on each level"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Play a Puzzle Stage (Priority: P1)

A player opens the game, selects a stage from the level-selection screen, and attempts to solve
the Queens puzzle by placing exactly one queen in each colored region of the board, satisfying
all constraint rules. The board provides immediate visual feedback as pieces are placed. When
the puzzle is solved correctly, a completion screen appears showing the elapsed time and whether
a new personal best was achieved.

**Why this priority**: Solving a puzzle is the core interaction. Without a working game loop,
no other feature has meaning.

**Independent Test**: A player can open the game, choose any stage, solve the puzzle by placing
queens one by one, and reach the completion screen — without any persistence or navigation
features in place.

**Acceptance Scenarios**:

1. **Given** a player is on the stage-selection screen, **When** they select any available stage,
   **Then** the puzzle board for that stage loads with the correct grid and colored regions.

2. **Given** a player places a queen in a cell that conflicts with an existing queen (same row,
   column, adjacent diagonal, or same colored region), **When** the placement is made,
   **Then** the conflicting cells are visually highlighted and the placement is marked invalid.

3. **Given** all queens are placed correctly (one per region, no conflicts anywhere on the board),
   **When** the last valid queen is placed, **Then** the puzzle is automatically detected as
   solved and a completion screen is shown with the elapsed time.

4. **Given** a player is mid-puzzle, **When** they click a cell that already contains a queen,
   **Then** the queen is removed and the timer continues running.

---

### User Story 2 — Browse and Select Stages (Priority: P2)

A player lands on a stage-selection screen listing all available stages. Each stage card shows
the stage number, an indication of board size or difficulty, and the player's personal best time
(or a placeholder if never completed). The player can freely select any stage to play, including
stages they have already completed.

**Why this priority**: Stage selection enables the "revisit all available stages" requirement and
surfaces personal bests that motivate replay. It depends on the game loop (US1) functioning first.

**Independent Test**: The stage-selection screen can be rendered and navigated independently. A
player can see all stages listed, see which ones have no best time recorded, and tap into any stage
(even with a stub puzzle board).

**Acceptance Scenarios**:

1. **Given** a player opens the game, **When** the stage-selection screen loads,
   **Then** all available stages are listed with their stage number and completion status visible.

2. **Given** a player has previously completed stage 3 in 1 minute 24 seconds,
   **When** they view the stage-selection screen, **Then** stage 3's card displays "Best: 1:24".

3. **Given** a player has never played stage 5, **When** they view stage 5's card,
   **Then** the best-time area shows a placeholder (e.g., "—") rather than zero or blank.

4. **Given** a player selects a stage they previously completed, **When** the puzzle loads,
   **Then** the board is reset to its unsolved initial state with no queens pre-placed.

---

### User Story 3 — Personal Speed Records and Best-Time Persistence (Priority: P3)

After completing a stage, the game records the elapsed time. If the new time is faster than the
player's previous best for that stage, the best time is updated and the player is notified of the
new record. Best times persist across page reloads and sessions so progress is never lost.

**Why this priority**: Persistence and record-tracking are the motivational layer on top of the
core game. They enhance replay value but can only be added once the game loop and navigation work.

**Independent Test**: Best times can be tested by completing a stage twice — the second time
faster — and confirming the displayed best updates. Persistence is tested by completing a stage,
reloading the page, and confirming the best time is still shown on the stage-selection screen.

**Acceptance Scenarios**:

1. **Given** a player completes a stage for the first time, **When** the completion screen appears,
   **Then** the elapsed time is saved as the personal best for that stage.

2. **Given** a player's existing best for stage 2 is 2:10, **When** they complete stage 2
   in 1:55, **Then** the new best is saved as 1:55 and the completion screen shows "New Record!".

3. **Given** a player's existing best for stage 2 is 1:55, **When** they complete stage 2
   in 2:30, **Then** the best time remains 1:55 and no record notification is shown.

4. **Given** a player has recorded best times on multiple stages, **When** they reload or revisit
   the application, **Then** all previously recorded best times are still visible on each stage
   card in the stage-selection screen.

---

### Edge Cases

- What if a placement conflicts with multiple rules simultaneously (e.g., same row AND same
  region)? All violations MUST be highlighted at the same time.
- What if a player navigates back to stage selection while a puzzle is in progress? The timer
  stops; in-progress placements are not saved (no mid-game persistence required in this scope).
- What if a player has no recorded best time for a stage? The best-time field shows "—" rather
  than zero or blank.
- What if two completion times are identical? Either value is acceptable as the stored best.
- How are times over 60 seconds displayed? Format is MM:SS; a time under 60 seconds displays
  as 0:SS (e.g., 0:42).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a grid-based Queens puzzle board for each stage, with colored
  regions rendered visually distinct from one another.
- **FR-002**: System MUST enforce all Queens puzzle constraints: no two queens may share a row,
  a column, an immediately adjacent cell (including diagonals), or the same colored region.
- **FR-003**: System MUST highlight conflicting cells immediately when an invalid queen
  placement is made, without requiring any additional player action.
- **FR-004**: System MUST automatically detect puzzle completion when all queens satisfy every
  constraint and display a completion screen.
- **FR-005**: System MUST run a visible timer that starts on the player's first move and stops
  upon puzzle completion.
- **FR-006**: System MUST record the fastest completion time per stage and persist it across
  page reloads using browser-local storage.
- **FR-007**: System MUST display each stage's personal best time on the stage-selection screen.
- **FR-008**: System MUST allow users to select any available stage from the stage-selection
  screen, regardless of prior completion status.
- **FR-009**: System MUST allow users to restart the current stage at any time, resetting all
  queen placements and the timer to the initial state.
- **FR-010**: System MUST notify the user on the completion screen when they have beaten their
  previous personal best time for a stage.
- **FR-011**: System MUST include at least 5 pre-defined stages with distinct board configurations.
- **FR-012**: System MUST allow queen removal by interacting with a cell that already contains
  a queen (toggle behaviour).

### Key Entities

- **Stage**: A pre-defined puzzle configuration, identified by a number. Contains board dimensions
  (NxN) and the colored-region layout defining which cells belong to which region.
- **Board**: The NxN grid of cells for a given stage. Each cell belongs to exactly one colored
  region. N equals the number of regions.
- **Queen**: A game piece placed on a single board cell. A solved board has exactly N queens,
  one per region.
- **BestTimeRecord**: A per-stage record pairing a stage identifier with the fastest verified
  completion time (in whole seconds). Stored in browser-local storage.
- **GameSession**: The transient state of an active puzzle attempt, including current queen
  placements, elapsed time, and the stage being played.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can open the game, select any stage, solve the puzzle correctly, and
  reach the completion screen without any incorrect rule-enforcement behavior occurring.
- **SC-002**: Personal best times are retained after a page reload on the same device and browser,
  with no data loss under normal browser conditions.
- **SC-003**: All available stages are accessible from the stage-selection screen in a single
  interaction (one tap or click per stage).
- **SC-004**: Visual conflict feedback appears within 100 ms of an invalid queen placement.
- **SC-005**: Puzzle completion is detected and the completion screen appears within 500 ms of
  the final correct placement being made.
- **SC-006**: A player who completes a stage with a faster time can confirm the new best is
  recorded and displayed without reloading the page.

## Assumptions

- Stages are statically pre-defined (no dynamic puzzle generation in this iteration).
- Each stage has exactly N colored regions on an NxN board, so the number of regions equals
  the board dimension.
- The adjacency constraint matches LinkedIn's Queens rule: queens cannot occupy any of the
  8 immediately surrounding cells (orthogonal and diagonal neighbors).
- "Highest speed" means the fastest (lowest) completion time, consistent with speed-run norms.
- No user accounts or server-side storage; best times are stored in browser-local storage only.
- Timer display format is MM:SS; times under 60 seconds show as 0:SS (e.g., 0:42).
- No mid-game state persistence; navigating away from a puzzle in progress loses all placements.
