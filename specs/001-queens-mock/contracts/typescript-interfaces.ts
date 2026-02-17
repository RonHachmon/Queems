/**
 * Queems — TypeScript Interface Contracts
 * Branch: 001-queens-mock | Date: 2026-02-17
 *
 * These interfaces define the data contracts between all modules.
 * Source of truth for: lib/, stores/, components/, types/index.ts
 *
 * NOTE: This file is a design artifact (specs/), not source code.
 * The actual types live in src/types/index.ts.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type RegionId = string

export interface CellCoord {
  row: number  // 0-based
  col: number  // 0-based
}

export type Queen = CellCoord

/** "row:col" string key used in ConflictMap */
export type CellKey = `${number}:${number}`

export type ConflictMap = Map<CellKey, true>

// ---------------------------------------------------------------------------
// Stage (static data — defined in src/lib/stages/)
// ---------------------------------------------------------------------------

export interface Stage {
  id: string           // e.g. 'stage-01'
  number: number       // 1-based display number
  label: string        // e.g. 'Stage 1'
  size: number         // N: board is NxN, N regions, N queens
  grid: RegionId[][]   // [row][col] → RegionId; length = size × size
}

// ---------------------------------------------------------------------------
// Game Session (ephemeral Zustand store — game-store.ts)
// ---------------------------------------------------------------------------

export interface GameSession {
  stageId: string
  queens: Queen[]
  timerStartedAt: number | null  // Date.now() on first move; null = not started
  elapsedSeconds: number
  isSolved: boolean
  isNewRecord: boolean
}

export interface GameStoreState extends GameSession {
  // Actions
  loadStage: (stageId: string) => void
  placeOrRemoveQueen: (coord: CellCoord) => void
  restart: () => void
  tick: () => void          // called by setInterval every second
  markSolved: (elapsedSeconds: number, isNewRecord: boolean) => void
}

// ---------------------------------------------------------------------------
// Best Times (persisted Zustand store — best-times-store.ts)
// ---------------------------------------------------------------------------

export interface BestTimesState {
  bestTimes: Record<string, number>  // stageId → seconds (absent if no record)
  saveBestTime: (stageId: string, seconds: number) => void
  getBestTime: (stageId: string) => number | undefined
}

// ---------------------------------------------------------------------------
// Rule Validator (src/lib/rule-validator.ts)
// ---------------------------------------------------------------------------

/**
 * Returns true if placing a queen at `candidate` would violate any rule
 * given `existingQueens` on the board defined by `stage`.
 *
 * Rules:
 *   1. No two queens share the same row.
 *   2. No two queens share the same column.
 *   3. No two queens are in immediately adjacent cells (8 directions).
 *   4. No two queens share the same RegionId.
 */
export type WouldConflictFn = (
  candidate: CellCoord,
  existingQueens: Queen[],
  stage: Stage
) => boolean

/**
 * Given all current queen placements, returns a ConflictMap where every cell
 * involved in at least one violation is keyed. Returns an empty Map when the
 * board is conflict-free.
 */
export type DeriveConflictsFn = (queens: Queen[], stage: Stage) => ConflictMap

// ---------------------------------------------------------------------------
// Board State (src/lib/board-state.ts)
// ---------------------------------------------------------------------------

/** True when queens.length === stage.size and ConflictMap.size === 0 */
export type IsSolvedFn = (queens: Queen[], stage: Stage) => boolean

/**
 * Toggle a queen at `coord`:
 * - If coord already has a queen → remove it.
 * - Otherwise → add it.
 * Returns the updated queen array (pure, no mutation).
 */
export type ToggleQueenFn = (queens: Queen[], coord: CellCoord) => Queen[]

// ---------------------------------------------------------------------------
// Stages Index (src/lib/stages/index.ts)
// ---------------------------------------------------------------------------

export type StagesIndex = Record<string, Stage>  // stageId → Stage

/**
 * Ordered list of all stage IDs in display order.
 * Used by StageSelectPage to render the stage list.
 */
export type StageIdList = string[]

// ---------------------------------------------------------------------------
// Component Props (documentation only — actual props live in component files)
// ---------------------------------------------------------------------------

export interface BoardProps {
  stage: Stage
  queens: Queen[]
  conflicts: ConflictMap
  onCellClick: (coord: CellCoord) => void
  disabled: boolean  // true when puzzle is solved (prevent further interaction)
}

export interface CellProps {
  coord: CellCoord
  regionId: RegionId
  hasQueen: boolean
  isConflict: boolean
  onClick: () => void
  disabled: boolean
}

export interface StageCardProps {
  stage: Stage
  bestTime: number | undefined  // undefined = no record
  onSelect: (stageId: string) => void
}

export interface TimerProps {
  elapsedSeconds: number
  isRunning: boolean
}

export interface CompletionModalProps {
  isVisible: boolean
  elapsedSeconds: number
  isNewRecord: boolean
  previousBest: number | undefined
  onPlayAgain: () => void
  onBackToMenu: () => void
}
