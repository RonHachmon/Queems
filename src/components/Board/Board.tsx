import type React from 'react'
import type { BoardProps, CellKey } from '@/types'
import Cell from './Cell'

function coordFromTouch(touch: React.Touch): { row: number; col: number } | null {
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  const cell = el?.closest('[data-row]') as HTMLElement | null
  if (!cell?.dataset.row || !cell?.dataset.col) return null
  const row = +cell.dataset.row
  const col = +cell.dataset.col
  return isNaN(row) || isNaN(col) ? null : { row, col }
}

export default function Board({ stage, queens, conflicts, markedCells, onCellClick, disabled, onCellMouseDown, onCellMouseEnter }: BoardProps) {
  return (
    <div
      className="w-full max-w-[min(90vw,24rem)] mx-auto border-4 border-gray-900  overflow-hidden shadow-xl"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${stage.size}, 1fr)`, touchAction: 'none' }}
      onTouchStart={(e) => {
        const coord = coordFromTouch(e.touches[0])
        if (coord) onCellMouseDown?.(coord)
      }}
      onTouchMove={(e) => {
        const coord = coordFromTouch(e.touches[0])
        if (coord) onCellMouseEnter?.(coord)
      }}
    >
      {stage.grid.map((row, rowIdx) =>
        row.map((regionId, colIdx) => {
          const key: CellKey = `${rowIdx}:${colIdx}`
          const hasQueen = queens.some((q) => q.row === rowIdx && q.col === colIdx)
          const isConflict = conflicts.has(key)
          const isMarked = markedCells.has(key)

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
              isMarked={isMarked}
              onClick={() => onCellClick({ row: rowIdx, col: colIdx })}
              disabled={disabled}
              borders={{ right: thickRight, bottom: thickBottom }}
              onMouseDown={() => onCellMouseDown?.({ row: rowIdx, col: colIdx })}
              onMouseEnter={() => onCellMouseEnter?.({ row: rowIdx, col: colIdx })}
            />
          )
        }),
      )}
    </div>
  )
}
