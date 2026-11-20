'use client'
import { motion } from 'framer-motion'
import { Armchair, Check, User } from 'lucide-react'

interface ChairVisualizerProps {
  tableNumber: number
  tableName: string
  capacity: number // number of chairs
  selectedChairs: number[]
  onChairClick?: (chairIndex: number) => void
  isTableSelected: boolean
  isTableOccupied?: boolean
  shape?: 'circle' | 'rectangle' | 'booth'
  interactiveChairs?: boolean
}

export default function ChairVisualizer({
  tableNumber,
  tableName,
  capacity,
  selectedChairs,
  onChairClick,
  isTableSelected,
  isTableOccupied = false,
  shape = 'rectangle',
  interactiveChairs = true,
}: ChairVisualizerProps) {
  // Determine chairs layout
  // 2 chairs: 1 top, 1 bottom
  // 4 chairs: 1 top, 1 bottom, 1 left, 1 right
  // 6 chairs: 2 top, 2 bottom, 1 left, 1 right
  // 8 chairs: 3 top, 3 bottom, 1 left, 1 right

  const getChairPositions = () => {
    switch (capacity) {
      case 2:
        return [
          { index: 1, pos: 'top-[-26px] left-1/2 -translate-x-1/2', label: 'T1' },
          { index: 2, pos: 'bottom-[-26px] left-1/2 -translate-x-1/2', label: 'T2' },
        ]
      case 4:
        return [
          { index: 1, pos: 'top-[-26px] left-1/2 -translate-x-1/2', label: 'C1' },
          { index: 2, pos: 'bottom-[-26px] left-1/2 -translate-x-1/2', label: 'C2' },
          { index: 3, pos: 'left-[-26px] top-1/2 -translate-y-1/2', label: 'C3' },
          { index: 4, pos: 'right-[-26px] top-1/2 -translate-y-1/2', label: 'C4' },
        ]
      case 6:
        return [
          { index: 1, pos: 'top-[-26px] left-[25%]', label: 'C1' },
          { index: 2, pos: 'top-[-26px] right-[25%]', label: 'C2' },
          { index: 3, pos: 'bottom-[-26px] left-[25%]', label: 'C3' },
          { index: 4, pos: 'bottom-[-26px] right-[25%]', label: 'C4' },
          { index: 5, pos: 'left-[-26px] top-1/2 -translate-y-1/2', label: 'C5' },
          { index: 6, pos: 'right-[-26px] top-1/2 -translate-y-1/2', label: 'C6' },
        ]
      case 8:
      default:
        return [
          { index: 1, pos: 'top-[-26px] left-[20%]', label: 'C1' },
          { index: 2, pos: 'top-[-26px] left-1/2 -translate-x-1/2', label: 'C2' },
          { index: 3, pos: 'top-[-26px] right-[20%]', label: 'C3' },
          { index: 4, pos: 'bottom-[-26px] left-[20%]', label: 'C4' },
          { index: 5, pos: 'bottom-[-26px] left-1/2 -translate-x-1/2', label: 'C5' },
          { index: 6, pos: 'bottom-[-26px] right-[20%]', label: 'C6' },
          { index: 7, pos: 'left-[-26px] top-1/2 -translate-y-1/2', label: 'C7' },
          { index: 8, pos: 'right-[-26px] top-1/2 -translate-y-1/2', label: 'C8' },
        ]
    }
  }

  const chairs = getChairPositions()

  const tableDimensions = () => {
    if (capacity === 2) return 'w-24 h-24'
    if (capacity === 4) return 'w-32 h-28'
    if (capacity === 6) return 'w-44 h-28'
    return 'w-56 h-28'
  }

  return (
    <div className="relative flex items-center justify-center p-8 select-none">
      {/* Table Container */}
      <motion.div
        animate={{
          scale: isTableSelected ? 1.04 : 1,
          borderColor: isTableSelected
            ? 'rgba(212, 175, 55, 0.9)'
            : isTableOccupied
            ? 'rgba(239, 68, 68, 0.3)'
            : 'rgba(197, 160, 89, 0.3)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`relative flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${tableDimensions()} ${
          shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
        } ${
          isTableSelected
            ? 'bg-gradient-to-br from-[#282214] via-[#1a1710] to-[#12110c] shadow-primary/20 border-2'
            : isTableOccupied
            ? 'bg-[#181313] border border-red-500/20 opacity-60 cursor-not-allowed'
            : 'bg-[#141418] border hover:border-primary/50'
        }`}
      >
        {/* Table Center Badge */}
        <div className="text-center px-2 pointer-events-none">
          <div className="flex items-center justify-center gap-1">
            <span
              className={`font-serif text-sm font-bold tracking-wider ${
                isTableSelected ? 'gold-gradient-text' : isTableOccupied ? 'text-red-400' : 'text-white'
              }`}
            >
              T-{tableNumber < 10 ? `0${tableNumber}` : tableNumber}
            </span>
            {isTableSelected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] text-black font-bold"
              >
                <Check className="h-2.5 w-2.5 stroke-[3]" />
              </motion.span>
            )}
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium truncate max-w-[100px]">
            {capacity} Chairs
          </p>
        </div>

        {/* Individual Chairs Arranged Around Table */}
        {chairs.map(({ index, pos }) => {
          const isChairSelected = isTableSelected && (selectedChairs.length === 0 || selectedChairs.includes(index))
          return (
            <motion.button
              key={index}
              type="button"
              disabled={isTableOccupied || !interactiveChairs}
              onClick={(e) => {
                e.stopPropagation()
                if (onChairClick) onChairClick(index)
              }}
              whileHover={!isTableOccupied ? { scale: 1.25 } : {}}
              whileTap={!isTableOccupied ? { scale: 0.9 } : {}}
              animate={{
                scale: isChairSelected ? [1, 1.15, 1.05] : 1,
              }}
              transition={{ duration: 0.3 }}
              className={`absolute ${pos} flex h-7 w-7 items-center justify-center rounded-full border shadow-md transition-all duration-300 z-10 ${
                isTableOccupied
                  ? 'bg-red-950/60 border-red-800/40 text-red-500/50 cursor-not-allowed'
                  : isChairSelected
                  ? 'gold-gradient-bg border-yellow-200 text-black shadow-primary/40 font-bold'
                  : isTableSelected
                  ? 'bg-[#2a2416] border-primary/40 text-primary hover:border-primary'
                  : 'bg-[#1a1a20] border-white/10 text-gray-400 hover:border-primary/50 hover:text-white'
              }`}
              title={`Chair #${index} (${isTableOccupied ? 'Occupied' : isChairSelected ? 'Selected' : 'Available'})`}
            >
              {isChairSelected ? (
                <User className="h-3.5 w-3.5 stroke-[2.5]" />
              ) : (
                <span className="text-[9px] font-semibold">{index}</span>
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
