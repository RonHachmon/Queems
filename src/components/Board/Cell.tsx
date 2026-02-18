import { motion } from 'framer-motion'
import { Crown, X } from 'lucide-react'
import type { CellProps } from '@/types'
import { cn } from '@/lib/cn'
import { getRegionClass } from '@/lib/region-colors'

export default function Cell({
  coord,
  regionId,
  hasQueen,
  isConflict,
  isMarked,
  onClick,
  disabled,
  borders,
  onMouseDown,
  onMouseEnter,
}: CellProps) {
  const ariaLabel = [
    `Row ${coord.row + 1}, Column ${coord.col + 1}, ${regionId} region`,
    isMarked && !hasQueen && 'X marked',
    hasQueen && 'queen placed',
    isConflict && 'conflict',
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      animate={hasQueen ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'aspect-square w-full flex items-center justify-center',
        'border-solid border-black transition-colors duration-150',
        borders.right ? 'border-r-[2.5px]' : 'border-r',
        borders.bottom ? 'border-b-[2.5px]' : 'border-b',
        getRegionClass(regionId),
        isConflict && 'ring-2 ring-inset ring-red-500',
        disabled ? 'cursor-default' : 'cursor-pointer hover:brightness-110',
      )}
    >
      {hasQueen && (
        <Crown
          className={cn(
            'w-1/2 h-1/2',
            isConflict ? 'text-red-600' : 'text-gray-800',
          )}
          strokeWidth={2.5}
        />
      )}
      
      {isMarked && !hasQueen && (
        <X className="w-1/3 h-1/3 text-gray-600" strokeWidth={2.5} />
      )}
    </motion.button>
  )
}
