import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy, RotateCcw, ChevronLeft } from 'lucide-react'
import type { CompletionModalProps } from '@/types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function CompletionModal({
  isVisible,
  elapsedSeconds,
  isNewRecord,
  previousBest,
  onPlayAgain,
  onBackToMenu,
}: CompletionModalProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null)

  // Move focus into the modal when it opens
  useEffect(() => {
    if (isVisible) {
      // Small delay lets the animation start before focusing
      const id = setTimeout(() => playAgainRef.current?.focus(), 120)
      return () => clearTimeout(id)
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="completion-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Puzzle solved"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            key="completion-card"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center gap-5 max-w-xs w-full mx-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-12 h-12 text-amber-400" strokeWidth={1.5} aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Puzzle Solved!</h2>
            </div>

            <div className="text-center">
              <p className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-200">
                {formatTime(elapsedSeconds)}
              </p>
              {previousBest !== undefined && !isNewRecord && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Best: {formatTime(previousBest)}
                </p>
              )}
            </div>

            {isNewRecord && (
              <motion.div
                role="status"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="bg-amber-400 text-white text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                New Record!
              </motion.div>
            )}

            <div className="flex gap-3 w-full mt-2">
              <button
                ref={playAgainRef}
                type="button"
                onClick={onPlayAgain}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                Play Again
              </button>
              <button
                type="button"
                onClick={onBackToMenu}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                Menu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
