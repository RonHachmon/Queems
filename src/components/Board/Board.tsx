import type { BoardProps } from '@/types'
import Cell from './Cell'

export default function Board({ stage, queens, conflicts, onCellClick, disabled }: BoardProps) {
  return (
    <div
      className="w-full max-w-[min(90vw,24rem)] mx-auto border-4 border-gray-900  overflow-hidden shadow-xl"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${stage.size}, 1fr)` }}
    >
      {stage.grid.map((row, rowIdx) =>
        row.map((regionId, colIdx) => {
          const key = `${rowIdx}:${colIdx}`
          const hasQueen = queens.some((q) => q.row === rowIdx && q.col === colIdx)
          const isConflict = conflicts.has(key)

          const thickRight =
            colIdx < stage.size - 1 && stage.grid[rowIdx][colIdx + 1] !== regionId

          const thickBottom =
            rowIdx < stage.size - 1 && stage.grid[rowIdx + 1][colIdx] !== regionId

          return (
            <Cell
              key={key}
              coord={{ row: rowIdx, col: colIdx }}
              regionId={regionId}
              hasQueen={hasQueen}
              isConflict={isConflict}
              onClick={() => onCellClick({ row: rowIdx, col: colIdx })}
              disabled={disabled}
              borders={{ right: thickRight, bottom: thickBottom }}
            />
          )
        }),
      )}
    </div>
  )
}
