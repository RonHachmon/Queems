import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import type { StageCardProps } from '@/types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function StageCard({ stage, bestTime, onSelect }: StageCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      onClick={() => onSelect(stage.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(stage.id)}
      aria-label={`${stage.id}, ${stage.size}×${stage.size} grid${bestTime !== undefined ? `, best time ${formatTime(bestTime)}` : ''}`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer px-5 py-4 flex items-center justify-between gap-4 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-bold text-gray-800 dark:text-gray-200 text-base">{stage.id}</span>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          {stage.size}&times;{stage.size} grid
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-amber-500 font-mono font-semibold text-sm shrink-0">
        <Trophy className="w-4 h-4" strokeWidth={2} />
        {bestTime !== undefined ? formatTime(bestTime) : '—'}
      </div>
    </motion.div>
  )
}
