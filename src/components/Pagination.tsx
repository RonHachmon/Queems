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
            ? 'text-text-faint cursor-not-allowed'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-raised',
        )}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
        Prev
      </button>

      <span
        aria-current="page"
        className="text-sm text-text-muted font-medium tabular-nums"
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
            ? 'text-text-faint cursor-not-allowed'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-raised',
        )}
      >
        Next
        <ChevronRight className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  )
}
