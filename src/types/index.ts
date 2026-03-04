// ─── Primitives ──────────────────────────────────────────────────────────────

export type RegionId =
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'yellow'
  | 'orange'
  | 'grey'
  | 'brown'
  | 'pink'

export interface CellCoord {
  row: number
  col: number
}

export type Queen = CellCoord

/** String key used as ConflictMap key: "row:col" */
export type CellKey = `${number}:${number}`

/**
 * Set of cell keys involved in at least one violation.
 * Derived on every render — never stored in state.
 */
export type ConflictMap = Map<string, true>

// ─── Stage (static data) ─────────────────────────────────────────────────────

export interface Stage {
  id: string
  /** N: board is NxN, N regions, N queens required */
  size: number
  /** [row][col] → RegionId */
  grid: RegionId[][]
}

// ─── Undo History ─────────────────────────────────────────────────────────────

export type UndoAction =
  | { type: 'mark-batch'; keys: CellKey[] }
  | { type: 'queen-placed'; queen: Queen; queenKey: CellKey; autoMarks: CellKey[]; priorMark: CellKey | null }
  | { type: 'queen-removed'; queen: Queen; queenKey: CellKey; autoMarks: CellKey[] }

// ─── Game Session (ephemeral Zustand store) ───────────────────────────────────

export interface GameSession {
  stageId: string
  queens: Queen[]
  timerStartedAt: number | null
  elapsedSeconds: number
  isSolved: boolean
  isNewRecord: boolean
  /** Cells manually marked with X by the player */
  manualMarks: CellKey[]
  /** Maps each placed queen's CellKey to the cells it auto-marked */
  autoMarksByQueen: Record<string, CellKey[]>
  /** Whether the Auto-Mark toggle is on */
  autoMarkEnabled: boolean
  /** Stack of reversible user actions; last element is the most recent */
  actionHistory: UndoAction[]
  /** True while a drag gesture is in progress (for batching marks) */
  isBatching: boolean
  /** Accumulates mark keys during an active drag batch */
  batchBuffer: CellKey[]
}

export interface GameStoreState extends GameSession {
  loadStage: (stageId: string) => void
  placeOrRemoveQueen: (coord: CellCoord) => void
  /** Three-state click cycle: empty → X-marked → queen → empty */
  cycleCell: (coord: CellCoord) => void
  /**
   * Mark a cell with X only if it is currently empty (no queen, no manual mark,
   * no auto-mark). Calling on a non-empty cell is a no-op. Used by drag marking.
   */
  addManualMark: (coord: CellCoord) => void
  /** Reverses the most recent action in actionHistory; no-op if empty or solved */
  undo: () => void
  /** Called on drag mousedown — marks start of a batch session */
  startMarkBatch: () => void
  /** Called on drag mouseup — commits accumulated batch as a single history entry */
  commitMarkBatch: () => void
  restart: (hardReset: boolean) => void
  tick: () => void
  markSolved: (elapsedSeconds: number, isNewRecord: boolean) => void
}

// ─── Best Times (persisted Zustand store) ────────────────────────────────────

export interface BestTimesState {
  bestTimes: Record<string, number>
  saveBestTime: (stageId: string, seconds: number) => void
  getBestTime: (stageId: string) => number | undefined
}

// ─── App Settings (persisted Zustand store) ──────────────────────────────────

export interface AppSettings {
  autoMarkEnabled: boolean
}

export interface SettingsState extends AppSettings {
  setAutoMark: (value: boolean) => void
}

// ─── Pure function type aliases ───────────────────────────────────────────────

export type WouldConflictFn = (
  candidate: CellCoord,
  existingQueens: Queen[],
  stage: Stage,
) => boolean

export type DeriveConflictsFn = (queens: Queen[], stage: Stage) => ConflictMap

export type ToggleQueenFn = (queens: Queen[], coord: CellCoord) => Queen[]

export type IsSolvedFn = (queens: Queen[], stage: Stage) => boolean

// ─── Component props ─────────────────────────────────────────────────────────

export interface BoardProps {
  stage: Stage
  queens: Queen[]
  conflicts: ConflictMap
  /** Derived set of all cells currently displaying an X mark */
  markedCells: Set<CellKey>
  onCellClick: (coord: CellCoord) => void
  disabled: boolean
  /** Called with the coord of the cell where the primary mouse button was pressed (drag support). */
  onCellMouseDown?: (coord: CellCoord) => void
  /** Called with the coord of the cell the cursor entered while the button is held (drag support). */
  onCellMouseEnter?: (coord: CellCoord) => void
}

export interface CellBorders {
  /** true = thick border (neighbour is a different region), false = thin default border */
  right: boolean
  /** true = thick border (neighbour is a different region), false = thin default border */
  bottom: boolean
}

export interface CellProps {
  coord: CellCoord
  regionId: RegionId
  hasQueen: boolean
  isConflict: boolean
  /** True when this cell displays an X mark (manual or auto) */
  isMarked: boolean
  onClick: () => void
  disabled: boolean
  borders: CellBorders
  /** Called when the primary mouse button is pressed on this cell (drag support). */
  onMouseDown?: () => void
  /** Called when the cursor enters this cell while the mouse button is held (drag support). */
  onMouseEnter?: () => void
}

export interface StageCardProps {
  stage: Stage
  bestTime: number | undefined
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

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}
