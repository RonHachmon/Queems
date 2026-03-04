import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { PaginationProps } from '@/types'

export default function Pagination({ currentPage, totalPages, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
          currentPage === 1
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
        )}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Prev
      </button>

      <span
        aria-current="page"
        className="text-sm text-gray-500 dark:text-gray-400 font-medium tabular-nums"
      >
        {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-150',
          currentPage === totalPages
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700',
        )}
      >
        Next
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
