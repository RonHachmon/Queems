# Feature Specification: Cell X-Marking with Auto-Mark Assistance

**Feature Branch**: `002-mark-cells`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "implement a new feature to my that add option to mark cells where there cant be Queen with an X, first click mark the cell, second click put a queen there, make a check button that when check when placing a queen the game will automaticcly mark all he spots with X"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Three-State Cell Click Cycle (Priority: P1)

A player clicks through cells using a three-state cycle: an empty cell becomes X-marked on the
first click, the X-marked cell becomes a queen on the second click, and clicking a queen removes
it and returns the cell to empty. X marks act as personal reminders that the player believes a
queen cannot go in that cell.

**Why this priority**: This is the core interaction change. The three-state cycle replaces the
existing two-state toggle and enables players to annotate the board before committing to queen
placements. All other marking behavior depends on this cycle existing first.

**Independent Test**: A player can click any cell three times in sequence and observe it cycle
through Empty → X → Queen → Empty. This can be tested on a blank board without any auto-mark
feature or game-logic validation in place.

**Acceptance Scenarios**:

1. **Given** a cell is empty, **When** the player clicks it once, **Then** the cell displays an
   X mark and is visually distinct from both empty cells and cells containing a queen.

2. **Given** a cell displays an X mark, **When** the player clicks it, **Then** the cell displays
   a queen and the X mark is removed.

3. **Given** a cell contains a queen, **When** the player clicks it, **Then** the queen is removed
   and the cell returns to an empty state (not X-marked).

4. **Given** a player has X-marked several cells, **When** they click the board's restart/reset
   action, **Then** all X marks and queens are cleared and every cell returns to empty.

---

### User Story 2 — Auto-Mark Toggle for Invalid Cells (Priority: P2)

A player enables an "Auto-Mark" toggle button visible on the puzzle screen. With the toggle on,
every time the player places a queen, the game automatically applies X marks to every cell that
is now invalid due to the newly placed queen — specifically all cells sharing the same row,
the same column, any of the eight adjacent cells, and all cells in the same colored region.
When the toggle is off, no automatic marking occurs and the board behaves as it does in the
base three-state cycle.

**Why this priority**: Auto-marking is an assistance layer on top of the basic marking cycle
(US1). It provides the most user-visible value — reducing manual effort in identifying invalid
cells — but requires US1 to be functional first.

**Independent Test**: With the toggle switched on, a player places a single queen and confirms
that every visually distinct invalid cell (same row, column, adjacent, or region) now shows an
X mark, without the player having to click them individually.

**Acceptance Scenarios**:

1. **Given** the Auto-Mark toggle is off, **When** the player places a queen, **Then** no cells
   are automatically marked with X; only the queen cell changes state.

2. **Given** the Auto-Mark toggle is on, **When** the player places a queen in any cell,
   **Then** every other cell invalidated by that queen (same row, same column, all eight
   adjacent cells, same colored region) is automatically marked with X.

3. **Given** the Auto-Mark toggle is on and the player has just placed a queen, **When** the
   player removes that queen (clicks it to cycle back to empty), **Then** only the X marks
   that were automatically applied by that specific queen placement are removed; manually
   placed X marks on those same cells are preserved.

4. **Given** the Auto-Mark toggle is on, **When** the player places multiple queens in
   sequence, **Then** auto-marks accumulate correctly — a cell auto-marked by more than one
   queen retains its X mark until all queens that invalidate it have been removed.

5. **Given** a cell already has a manual X mark, **When** the Auto-Mark toggle is on and a
   queen is placed that would also invalidate that cell, **Then** the cell remains X-marked
   and the manual mark is not overwritten or lost.

6. **Given** the Auto-Mark toggle is switched from on to off mid-puzzle, **When** the player
   next places a queen, **Then** no further auto-marks are applied, and existing X marks
   (manual and previously auto-applied) remain on the board unchanged.

---

### User Story 3 — Auto-Marks Do Not Block Queen Placement (Priority: P3)

A player has auto-marked cells covering much of the board. They want to override an auto-mark
and place a queen in a marked cell anyway. The click cycle still works on auto-marked cells in
the same way as manually marked cells: clicking an X-marked cell (whether marked manually or
automatically) advances it to the queen state.

**Why this priority**: Usability safeguard. Auto-marks are visual hints, not restrictions. The
player must always retain full control over where they place queens, ensuring the feature helps
without being obstructive.

**Independent Test**: With auto-mark on and a queen placed, click any auto-marked X cell once
and confirm it becomes a queen rather than staying X-marked.

**Acceptance Scenarios**:

1. **Given** a cell has been auto-marked with X, **When** the player clicks it, **Then** it
   advances to the queen state exactly as a manually placed X would.

2. **Given** the player places a queen in a cell that was auto-marked (overriding the mark),
   **When** the game validates the board, **Then** conflict highlighting still applies normally
   based on queen-constraint rules (auto-marking does not suppress or alter validation).

---

### Edge Cases

- What happens if the player enables Auto-Mark when queens are already on the board? Auto-marks
  for currently placed queens are applied immediately upon enabling the toggle.
- What if a cell is simultaneously invalidated by two queens (auto-marked twice)? The X mark
  persists until both queens are removed; removing one queen does not clear it.
- What if the board is fully solved and all queens are correctly placed? Auto-marks on remaining
  cells have no effect on the win-detection logic; completion is detected using queen-constraint
  validation only.
- What if every non-queen cell is auto-marked as X? The board appears to leave no free cells,
  but this is purely visual. The player can still click any X cell to try placing a queen.
- What if the player disables Auto-Mark, removes all queens, then re-enables it? No auto-marks
  are applied until the next queen placement.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The cell click cycle MUST follow the sequence: Empty → X-marked → Queen → Empty,
  cycling indefinitely on each cell.
- **FR-002**: X-marked cells MUST be visually distinguishable from empty cells and queen-bearing
  cells at all times.
- **FR-003**: The game MUST provide a persistent Auto-Mark toggle control on the puzzle screen
  that the player can switch on or off at any time during a puzzle session.
- **FR-004**: When the Auto-Mark toggle is on and a queen is placed, the game MUST immediately
  apply X marks to all cells invalidated by that queen: same row, same column, all eight
  adjacent cells (orthogonal and diagonal), and all cells sharing the same colored region.
- **FR-005**: The game MUST NOT auto-mark the cell occupied by the queen itself.
- **FR-006**: When a queen is removed while the Auto-Mark toggle is on, the game MUST remove
  all X marks that were automatically applied solely because of that queen's placement.
- **FR-007**: Manually placed X marks MUST survive queen removal — only auto-applied marks
  generated by that queen are removed.
- **FR-008**: When the Auto-Mark toggle is enabled while queens are already on the board, the
  game MUST retroactively apply auto-marks for all currently placed queens.
- **FR-009**: Clicking an X-marked cell (whether manually or auto-marked) MUST advance the
  cell to the queen state, consistent with the three-state cycle.
- **FR-010**: X marks (manual or auto) MUST NOT affect the game's constraint-violation
  detection or win-detection logic; those continue to operate solely on queen placements.
- **FR-011**: The board reset action MUST clear all X marks (manual and auto) in addition to
  removing all queens.
- **FR-012**: The Auto-Mark toggle state MUST persist within the current puzzle session and
  reset to the default off state when the player starts a new stage.

### Key Entities

- **CellState**: The three possible states of a single cell — `empty`, `marked` (X), or
  `queen`. Each cell holds exactly one state at any moment.
- **MarkSource**: The origin of an X mark on a cell — either `manual` (player-placed) or
  `auto` (system-applied due to a queen placement). A cell may have both sources
  simultaneously; the mark disappears only when both sources are removed.
- **AutoMarkToggle**: A boolean preference scoped to the active puzzle session that controls
  whether queen placements trigger automatic invalidation marking.
- **InvalidationSet**: The derived set of cells that become invalid when a specific queen is
  placed (same row, column, adjacent cells, same region). Used to apply and retract auto-marks
  per queen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can click any empty cell exactly once and see an X mark appear within
  100 ms of the click.
- **SC-002**: A player can click an X-marked cell and see a queen appear, then click the queen
  to return to empty — completing the full three-state cycle — without any intermediate error
  or incorrect state.
- **SC-003**: With Auto-Mark enabled, placing a queen marks all invalidated cells with X within
  100 ms of the placement, with no cells missed (every invalid cell is marked).
- **SC-004**: Removing a queen with Auto-Mark on clears exactly the auto-applied marks from
  that queen — no more, no fewer — leaving manual marks intact.
- **SC-005**: The Auto-Mark toggle is visible and operable in a single interaction (one click
  or tap) at all times during a puzzle session.
- **SC-006**: All existing game rule-enforcement and win-detection behavior is unaffected by
  the presence of X marks on the board.

## Assumptions

- X marks are purely cosmetic annotations for the player; they carry no semantic meaning for
  the game's constraint checker or win detector.
- The default state of the Auto-Mark toggle is off, so new players see the three-state cycle
  but must opt in to automatic marking.
- Auto-mark invalidation follows the same rules as the existing queen-conflict detection:
  same row, same column, all eight orthogonal/diagonal neighbors, same colored region.
- Auto-Mark toggle state resets to off when navigating to a new stage or restarting the
  current stage.
- No visual distinction is required between a manually placed X and an auto-placed X from the
  player's perspective; the distinction is tracked internally only (to support correct removal
  behavior).
- Touch and mouse interactions are treated identically — a "click" refers to any primary tap
  or pointer-down event on a cell.
