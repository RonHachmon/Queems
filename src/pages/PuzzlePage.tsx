import { useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RotateCcw, ChevronLeft } from 'lucide-react'
import { useGameStore } from '@/stores/game-store'
import { useBestTimesStore } from '@/stores/best-times-store'
import { useDragMark } from '@/hooks/useDragMark'
import { STAGES } from '@/lib/stages'
import { deriveConflicts } from '@/lib/rule-validator'
import Board from '@/components/Board/Board'
import Timer from '@/components/Timer'
import CompletionModal from '@/components/CompletionModal'
import type { CellKey } from '@/types'

export default function PuzzlePage() {
  const { stageId = '' } = useParams<{ stageId: string }>()
  const navigate = useNavigate()
  const liveRegionRef = useRef<HTMLParagraphElement>(null)

  const {
    stageId: loadedStageId,
    queens,
    elapsedSeconds,
    isSolved,
    isNewRecord,
    manualMarks,
    autoMarksByQueen,
    loadStage,
    cycleCell,
    addManualMark,
    restart,
    tick,
    markSolved,
  } = useGameStore()

  const { dragHandlers, isDragGesture } = useDragMark({ onMarkCell: addManualMark, disabled: isSolved })

  const isStageReady = loadedStageId === stageId

  const { saveBestTime, getBestTime } = useBestTimesStore()

  const stage = STAGES[stageId]

  // Load stage on mount / stageId change
  useEffect(() => {
    loadStage(stageId)
  }, [stageId, loadStage])

  // Timer interval — increments every second while not solved
  useEffect(() => {
    if (isSolved) return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [isSolved, tick, isStageReady])

  // Detect solve: save best time and determine if it's a new record
  useEffect(() => {
    if (!isSolved) return
    if (!isStageReady) return  // guard: don't re-trigger on stale solved state from a previous puzzle
    const prevBest = getBestTime(stageId)
    const isNew = prevBest === undefined || elapsedSeconds < prevBest
    saveBestTime(stageId, elapsedSeconds)
    markSolved(elapsedSeconds, isNew)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSolved])

  // Derive full set of marked cells: union of manual marks and all auto-marks
  // Must be before early return to satisfy rules-of-hooks
  const markedCells = useMemo(() => {
    const set = new Set<CellKey>(manualMarks)
    for (const cells of Object.values(autoMarksByQueen)) {
      for (const key of cells) set.add(key)
    }
    return set
  }, [manualMarks, autoMarksByQueen])

  if (!stage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">Stage not found: {stageId}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-blue-600 underline"
        >
          Back to menu
        </button>
      </div>
    )
  }

  const conflicts = deriveConflicts(queens, stage)
  const conflictCount = conflicts.size / 2 // each pair adds two entries
  const timerRunning = !isSolved
  const previousBest = getBestTime(stageId)

  // Build aria-live message
  const liveMessage = isSolved
    ? 'Puzzle solved!'
    : conflictCount > 0
      ? `${Math.ceil(conflictCount)} conflict${Math.ceil(conflictCount) !== 1 ? 's' : ''} detected`
      : queens.length > 0
        ? `${queens.length} of ${stage.size} queens placed, no conflicts`
        : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8 gap-6"
    >
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Back to menu"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-medium">Menu</span>
        </button>

        <h1 className="text-lg font-bold text-gray-800">{stage.id}</h1>

        <button
          type="button"
          onClick={() => restart(false)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Restart puzzle"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-sm font-medium">Reset</span>
        </button>
      </div>

      {/* Timer */}
      <Timer elapsedSeconds={elapsedSeconds} isRunning={timerRunning} />

      {/* Board */}
      <Board
        stage={stage}
        queens={isStageReady ? queens : []}
        conflicts={isStageReady ? conflicts : new Map()}
        markedCells={isStageReady ? markedCells : new Set()}
        onCellClick={(coord) => { if (isDragGesture()) return; cycleCell(coord) }}
        onCellMouseDown={dragHandlers.onCellMouseDown}
        onCellMouseEnter={dragHandlers.onCellMouseEnter}
        disabled={isSolved}
      />

      {/* Hint */}
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Place one queen per region. No two queens may share a row, column, or touch each other.
      </p>

      {/* Aria-live region for screen-reader conflict feedback */}
      <p
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </p>

      {/* Completion modal */}
      <CompletionModal
        isVisible={isSolved && isStageReady}
        elapsedSeconds={elapsedSeconds}
        isNewRecord={isNewRecord}
        previousBest={previousBest}
        onPlayAgain={() => restart(true)}
        onBackToMenu={() => navigate('/')}
      />
    </motion.div>
  )
}
