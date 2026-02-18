# Research: Click-and-Drag X Marking

**Feature**: `003-drag-mark-x` | **Date**: 2026-02-18

## Decision 1: How to distinguish a drag from a click in React mouse events

**Decision**: Classify an interaction as a drag when the cursor enters at least one grid
cell **different** from the cell where `mousedown` fired, while the button is still held.
Track this with a mutable ref (`didDrag`) to avoid triggering re-renders on every
`mouseenter`.

**Rationale**: Using "entered a different cell" as the boundary condition is natural for a
discrete grid: there is no ambiguous pixel-distance threshold. It maps directly to the
spec's definition (FR-001) and is deterministic. A ref (not state) is correct because the
drag flag is used only at `mouseup`/`click` time — it does not need to drive rendering.

**Alternatives considered**:
- *Pixel-distance threshold* (e.g., 5 px): introduces platform variance and is unnecessary
  for a grid where the minimum drag distance is one cell width (~40 px at smallest size).
- *`pointermove` delta on same element*: would trigger false positives from tiny mouse
  movements without cell changes.

---

## Decision 2: Where to listen for `mouseup` to end the drag session

**Decision**: Attach a single `mouseup` listener to `window` inside a `useEffect` in the
`useDragMark` hook. Remove it on cleanup (hook unmount or `isSolved` change).

**Rationale**: If the cursor leaves the grid area while the button is held (spec FR-008),
a `mouseup` listener on the Board element alone would never fire, leaving the drag session
permanently open. Listening on `window` guarantees the session always ends when the button
is released, regardless of where the cursor is. This is the standard pattern for drag-and-
drop interactions in React.

**Alternatives considered**:
- *Board-level `onMouseLeave` to end the session*: contradicts FR-008, which requires the
  session to stay alive when the cursor leaves and re-enters the grid.
- *`pointerup` instead of `mouseup`*: preferred for future touch support, but touch is
  explicitly out of scope (spec Assumptions). `mouseup` is simpler and sufficient.

---

## Decision 3: How to prevent `onClick` from cycling the cell after a drag

**Decision**: The `onClick` event fires on an element only when both `mousedown` and
`mouseup` occurred on the **same** element. When the cursor moves to another cell during a
drag, `mousedown` and `mouseup` land on different elements — so `onClick` does **not** fire
on either, and no extra handling is needed for the common drag case.

The only edge case is a drag that starts on cell A, visits other cells, and returns to cell
A before release — `mouseup` lands back on A, triggering `onClick(A)`. To suppress this,
`useDragMark` exposes a `isDragGesture(): boolean` guard that `PuzzlePage` checks inside
its `onCellClick` callback: if a drag gesture occurred, skip `cycleCell`.

**Rationale**: Leveraging built-in `onClick` semantics covers 99% of cases for free.
The guard only needs to handle the return-to-origin edge case. This keeps the Cell and
Board components unchanged with respect to their `onClick` interface.

**Alternatives considered**:
- *Replace `onClick` with `onMouseDown` + `onMouseUp` everywhere*: would require refactoring
  Cell, Board, and PuzzlePage significantly and break Framer Motion's `whileTap` animation.
- *`preventDefault()` on `mouseup` during drag*: `preventDefault` on `mouseup` does not
  suppress `click` in all browsers consistently.

---

## Decision 4: How to handle the starting cell during a drag

**Decision**: The starting cell (where `mousedown` fired) is marked with X **at the moment
the cursor first enters a different cell**, if it is empty. The hook tracks `startCoord`
and a `startMarked` ref so it marks the starting cell exactly once.

**Rationale**: From the user's perspective, pressing on an empty cell and dragging should
mark that cell — it was "under the cursor" when the gesture began (spec FR-002). However,
we cannot call `addManualMark` on `mousedown` because we don't yet know whether this will
be a click (which should cycle via `cycleCell`) or a drag. Deferring until the first
`mouseenter` on a different cell resolves the ambiguity correctly:
- If the user never moves: `startMarked` stays false → `onClick` fires → `cycleCell` runs
  (normal click, same result for empty cells).
- If the user moves: starting cell is marked immediately → `cycleCell` is suppressed.

**Alternatives considered**:
- *Mark starting cell immediately on `mousedown`*: breaks the X→queen click cycle because
  `mousedown` on an X-marked cell would set `isDragging` but the subsequent `onClick`
  needs to cycle it; detecting "should we cycle or not" becomes ambiguous.
- *Never mark the starting cell during drag*: inconsistent with FR-002 and the user
  expectation that the cell under the cursor when the button is pressed is included.

---

## Decision 5: Idempotency for revisited cells

**Decision**: The `useDragMark` hook maintains a `visitedCells` ref (`Set<CellKey>`) that
tracks every cell marked or skipped during the current drag session. On `mouseenter`, if
the cell key is already in `visitedCells`, skip it entirely — no `addManualMark` call.

**Rationale**: The user may move back and forth across cells during one drag (spec FR-009).
Without this set, re-entering an already-marked cell would call `addManualMark` again
(harmless, since it's idempotent) but more importantly would mark cells that were initially
non-empty and have since changed — which cannot happen mid-drag since state is only updated
by the drag itself. Still, using `visitedCells` is clearer intent and avoids redundant
store dispatches on revisit.

**Alternatives considered**:
- *Rely on `addManualMark` idempotency alone*: correct for empty cells, but calling the
  store action multiple times per cell per drag is unnecessary overhead.

---

## Decision 6: New store action vs. reusing `cycleCell`

**Decision**: Add a new `addManualMark(coord: CellCoord)` action to `game-store.ts`.
It marks the cell with X only if the cell is currently empty (no queen, no manual mark,
no auto-mark). It does NOT cycle the cell through states.

**Rationale**: `cycleCell` implements the three-state cycle: empty→X, X→queen, queen→empty.
The drag feature must mark empty cells with X only — it must never advance an X cell to
queen or remove a queen. Reusing `cycleCell` for drag would produce incorrect behaviour
for non-empty cells. A dedicated action with a single responsibility is cleaner and safer.

**Alternatives considered**:
- *Reuse `cycleCell` with a guard at the call site*: the call site (hook) would need to
  query cell state from the store before deciding whether to call `cycleCell`. This leaks
  store-state awareness into the hook and adds coupling.
- *Pure helper function instead of store action*: the mark must be persisted in Zustand
  so all components receive the updated `manualMarks`. A pure helper cannot do this.

---

## Summary Table

| Topic | Decision |
|-------|----------|
| Drag detection | Cursor enters a different cell while button held |
| Drag state | Mutable refs in `useDragMark` hook (not Zustand) |
| `mouseup` listener | Attached to `window` via `useEffect` |
| `onClick` suppression | Built-in browser behaviour handles it; `isDragGesture()` guard for return-to-origin edge case |
| Starting cell | Marked retroactively when cursor first enters another cell |
| Revisited cells | Tracked in `visitedCells` Set ref; skipped on re-entry |
| Store action | New `addManualMark(coord)` — empty-only, no cycle |
