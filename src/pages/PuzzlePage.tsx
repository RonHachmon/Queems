import { useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RotateCcw, ChevronLeft, Undo2 } from 'lucide-react'
import { cn } from '@/lib/cn'
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
    actionHistory,
    loadStage,
    cycleCell,
    addManualMark,
    undo,
    startMarkBatch,
    commitMarkBatch,
    restart,
    tick,
    markSolved,
  } = useGameStore()

  const { dragHandlers, isDragGesture } = useDragMark({
    onMarkCell: addManualMark,
    onBatchStart: startMarkBatch,
    onBatchCommit: commitMarkBatch,
    disabled: isSolved,
  })

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
        <p className="text-gray-600 dark:text-gray-400">Stage not found: {stageId}</p>
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
      className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 gap-6"
    >
      {/* Header */}
      <div className="w-full max-w-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          aria-label="Back to menu"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-sm font-medium">Menu</span>
        </button>

        <Timer elapsedSeconds={elapsedSeconds} isRunning={timerRunning} />

        {/* <h1 className="text-lg font-bold text-gray-800">{stage.id}</h1> */}

        {/* Spacer to keep title centered */}
        <div className="w-14" />
      </div>

      {/* Timer */}
      

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

      {/* Bottom controls: Undo + Reset */}
      <div className="flex gap-6 w-full max-w-sm justify-center">
        <button
          type="button"
          onClick={undo}
          disabled={actionHistory.length === 0 || isSolved}
          aria-label="Undo last action"
          className={cn(
            'flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors',
            (actionHistory.length === 0 || isSolved) && 'opacity-40 cursor-not-allowed pointer-events-none',
          )}
        >
          <Undo2 className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-sm font-medium">Undo</span>
        </button>

        <button
          type="button"
          onClick={() => restart(false)}
          disabled={isSolved}
          aria-label="Restart puzzle"
          className={cn(
            'flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors',
            isSolved && 'opacity-40 cursor-not-allowed pointer-events-none',
          )}
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-sm font-medium">Reset</span>
        </button>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-xs">
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
