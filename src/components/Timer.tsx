import { Timer as TimerIcon } from 'lucide-react'
import type { TimerProps } from '@/types'
import { cn } from '@/lib/cn'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Timer({ elapsedSeconds, isRunning }: TimerProps) {
  return (
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-mono text-xl font-bold">
      <TimerIcon
        className={cn('w-8 h-8', isRunning && 'text-green-600 animate-pulse')}
        strokeWidth={2}
      />
      <span>{formatTime(elapsedSeconds)}</span>
    </div>
  )
}
