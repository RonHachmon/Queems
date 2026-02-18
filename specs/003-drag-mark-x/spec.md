# Feature Specification: Click-and-Drag X Marking

**Feature Branch**: `003-drag-mark-x`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "i want to create a new feature focusing on user experience, currently the only way to mark with an X a spot is by actively clicking, i want it to also mark 'x' without clicking, meaning i can keep my mouse click trigger down and all the grid location i hover on that are currently empty will be mark, you cannot mark Queens like that only 'X' and if the user hover on an already marked cell it wont effect it. this whole mark is like one mark"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Drag to Mark Multiple Empty Cells (Priority: P1)

A player wants to quickly eliminate several cells by marking them with X without clicking each one
individually. They press and hold the mouse button, then move the cursor across the grid. Each
empty cell the cursor passes through is immediately marked with an X. Releasing the mouse button
ends the gesture and no further cells are marked.

**Why this priority**: This is the core of the feature. Dragging to mark multiple cells at once
directly reduces repetitive clicking and makes the puzzle experience faster and more fluid. All
other behaviour in this feature depends on this fundamental drag gesture existing first.

**Independent Test**: Can be fully tested by pressing and holding the mouse button on an empty
cell, moving the cursor across at least three additional empty cells, then releasing. All visited
empty cells must display X marks; no further cells must change after release.

**Acceptance Scenarios**:

1. **Given** a grid with multiple empty cells, **When** the player presses and holds the mouse
   button on one empty cell and moves the cursor across several other empty cells, **Then** each
   empty cell the cursor enters is immediately marked with X before the button is released.

2. **Given** the player is holding the mouse button and the cursor exits the grid boundary,
   **When** no further cells are under the cursor, **Then** no cells outside the grid are marked
   and the drag session remains active.

3. **Given** the player re-enters the grid while still holding the mouse button after leaving the
   grid boundary, **When** the cursor passes over empty cells again, **Then** those cells are
   marked with X (the session did not end on exit).

4. **Given** the player completes a drag gesture, **When** the mouse button is released,
   **Then** no further cells are affected by cursor movement and no additional action fires.

---

### User Story 2 — Existing Marks and Queens Are Unaffected During Drag (Priority: P2)

A player is mid-puzzle with several X marks and queens already on the board. They use the drag
gesture across a mixed row. Empty cells in the row receive X marks; cells already carrying an X
or a queen are completely unchanged. This lets the player drag freely across the board without
fear of accidentally modifying their existing work.

**Why this priority**: Preserving existing marks and queens during a drag is essential for player
trust. If drag-marking inadvertently altered non-empty cells, the feature would be dangerous
rather than helpful, forcing players to avoid using it around placed pieces.

**Independent Test**: Place one queen and at least one manual X mark on the board, then drag
across the entire row containing those cells. Verify that the queen and existing X remain exactly
as they were, while any other empty cells in that row are now marked with X.

**Acceptance Scenarios**:

1. **Given** a cell is already marked with X, **When** the player's cursor passes over that cell
   during a drag gesture, **Then** the cell remains marked with X and does not change state.

2. **Given** a cell contains a queen, **When** the player's cursor passes over that cell during
   a drag gesture, **Then** the queen remains in place and the cell does not change state.

3. **Given** a row contains a mix of empty cells, X-marked cells, and a queen cell, **When** the
   player drags across the entire row, **Then** only the empty cells receive X marks; X-marked and
   queen cells are untouched.

---

### User Story 3 — Click Cycle Is Preserved and Distinct From Drag (Priority: P3)

A player presses and releases a mouse button on a single cell without moving the cursor to any
other cell. This single-cell, no-movement interaction is a click and must continue to produce
exactly the same three-state cycle as before: empty → X → queen → empty. The drag feature must
not break or alter the established click behaviour in any way.

**Why this priority**: Backward compatibility with the click cycle is non-negotiable. Players
have already learned the existing interaction model. If a drag starting on one cell and
immediately releasing now behaves differently from a normal click, the feature introduces
confusion rather than efficiency.

**Independent Test**: On a fresh board, click a single empty cell without moving the cursor; it
must cycle to X. Click the same X cell without moving; it must cycle to queen. Click the queen
without moving; it must return to empty. All three transitions must work identically to the
pre-drag behaviour.

**Acceptance Scenarios**:

1. **Given** the cursor does not travel to any other cell between mousedown and mouseup,
   **When** the player clicks an empty cell, **Then** the cell cycles to X exactly as before.

2. **Given** the cursor does not travel to any other cell between mousedown and mouseup,
   **When** the player clicks an X-marked cell, **Then** the cell cycles to a queen exactly
   as before.

3. **Given** the cursor does not travel to any other cell between mousedown and mouseup,
   **When** the player clicks a queen cell, **Then** the cell cycles back to empty exactly
   as before.

4. **Given** the player completes a drag gesture (cursor visited at least one additional cell),
   **When** the mouse button is released, **Then** the three-state click cycle does NOT fire on
   any cell — the only board changes are the X marks applied during the drag.

---

### Edge Cases

- What happens when the drag begins on an empty cell and the cursor does not leave that cell
  before release? The starting cell is treated as a single-cell gesture — the normal click cycle
  applies; the cell cycles from empty to X (same result as a click, so no difference in outcome).
- What happens when the drag begins on an X-marked cell and moves over empty cells? Empty cells
  the cursor enters are marked with X; the starting X-marked cell remains unchanged; on release,
  no click cycle fires for any cell.
- What happens when the drag begins on a queen cell? The queen is unchanged; empty cells the
  cursor subsequently enters are marked with X; no click cycle fires on release.
- What happens if the cursor moves back over a cell already visited in the same drag gesture?
  A cell visited more than once during a single drag is only marked once; revisiting an
  already-marked cell during the gesture has no additional effect.
- What happens if all hovered cells are already marked? The drag session completes without
  marking any cell; this is a valid no-op interaction.
- What happens if the browser window loses focus (alt-tab) while the button is held? The drag
  session ends silently; no cells are marked beyond those already marked before focus was lost.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The interaction MUST be classified as a drag gesture when the cursor travels to at
  least one cell that is different from the cell where the mouse button was first pressed, while
  the mouse button remains held down.

- **FR-002**: During a drag gesture, the game MUST immediately mark each empty cell the cursor
  enters with an X, including the cell where the mouse button was originally pressed if it is
  empty and the cursor subsequently moves to another cell.

- **FR-003**: During a drag gesture, the game MUST NOT mark any cell that already carries an X
  mark, regardless of whether that mark was placed manually or by the auto-mark system.

- **FR-004**: During a drag gesture, the game MUST NOT modify any cell that contains a queen.

- **FR-005**: When the mouse button is released, the drag session MUST end and no further cells
  MUST be marked by cursor movement alone.

- **FR-006**: When a drag gesture has occurred (cursor moved to at least one additional cell),
  releasing the mouse button MUST NOT trigger the three-state click cycle on any cell.

- **FR-007**: When the mouse button is pressed and released on the same cell without the cursor
  entering any other cell, the game MUST apply the existing three-state click cycle (empty → X →
  queen → empty) to that cell, unchanged from current behaviour.

- **FR-008**: If the cursor exits the grid area while the mouse button is held, the drag session
  MUST remain active; upon re-entering the grid, empty cells the cursor passes over MUST continue
  to be marked with X.

- **FR-009**: A cell visited more than once during a single drag gesture MUST be marked only
  once; revisiting an already-marked cell during the same drag MUST have no further effect.

- **FR-010**: The entire drag gesture — from mouse-button press to release — MUST be treated as
  one atomic interaction; it MUST NOT be split into multiple independent marking events.

### Key Entities

- **DragSession**: A continuous interaction that begins when the mouse button is pressed on the
  grid and ends when the button is released. Has two modes: *click* (cursor stayed on the
  starting cell) and *drag* (cursor entered at least one additional cell). In drag mode it holds
  the set of cells visited and marked during the gesture.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can drag across 8 empty cells in a single gesture and all 8 cells display
  X marks before the mouse button is released, with no cells missed.

- **SC-002**: Dragging across a row that contains a queen and two X-marked cells results in those
  three non-empty cells remaining completely unchanged, while every other empty cell in the row
  receives an X mark.

- **SC-003**: After completing a drag gesture, clicking any cell that was X-marked by that drag
  causes the cell to cycle to the queen state, confirming that the normal click cycle remains
  fully functional post-drag.

- **SC-004**: A single press-and-release interaction on an empty, X-marked, or queen cell
  produces an outcome identical to the pre-drag-feature behaviour, with no regressions to the
  existing three-state cycle.

- **SC-005**: X marks appear on hovered cells with no perceptible delay during a drag — the mark
  is visible by the time the cursor has fully entered the cell.

- **SC-006**: A player who has never used the drag feature and relies exclusively on single
  clicks experiences zero change to their existing workflow or cell outcomes.

## Assumptions

- Only the primary mouse button (typically the left button) initiates drag marking; secondary
  buttons and keyboard modifiers have no special drag behaviour.
- Touch-based drag interactions on mobile or tablet devices are out of scope for this feature;
  only pointer/mouse input is addressed.
- There is no visual indicator (e.g., highlight trail) showing which cells have been visited
  during the current drag; the X marks appearing in real time are the only feedback.
- Drag-placed X marks are indistinguishable from click-placed X marks; they participate in the
  same three-state click cycle and are removed by the same board-reset action.
- The drag feature interacts with the Auto-Mark system (002-mark-cells) only insofar as
  drag-placed X marks behave like manual marks: they are preserved when auto-marks are removed
  and they do not interfere with auto-mark application or retraction.
- The distinction between a click and a drag is determined by whether the cursor enters at least
  one grid cell different from the starting cell, not by pixel distance travelled.
