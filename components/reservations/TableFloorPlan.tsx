'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Users,
  Eye,
  Crown,
  Trees,
  CheckCircle2,
  Info,
  MapPin,
  SlidersHorizontal,
} from 'lucide-react'
import { RestaurantTable } from '@/types'
import ChairVisualizer from './ChairVisualizer'

export const RESTAURANT_TABLES: RestaurantTable[] = [
  // Window Terrace
  {
    id: 'tbl-1',
    number: 1,
    name: 'Sunset Romantic Alcove',
    zone: 'Window Terrace',
    capacity: 2,
    shape: 'circle',
    status: 'available',
    priceTier: 'premium',
    features: ['Panoramic City Lights', 'Candlelit Setting', 'Intimate 2-Seater'],
  },
  {
    id: 'tbl-2',
    number: 2,
    name: 'Skyline Window Table',
    zone: 'Window Terrace',
    capacity: 2,
    shape: 'circle',
    status: 'available',
    priceTier: 'premium',
    features: ['Floor-to-ceiling Window', 'Evening Sunset View', 'Cozy Ambiance'],
  },
  {
    id: 'tbl-3',
    number: 3,
    name: 'Terrace Grand Window',
    zone: 'Window Terrace',
    capacity: 4,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'premium',
    features: ['Panoramic View', 'Spacious Seating', 'Direct Terrace Access'],
  },

  // Main Dining Hall
  {
    id: 'tbl-4',
    number: 4,
    name: 'Chandelier Center Table',
    zone: 'Main Dining',
    capacity: 4,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'standard',
    features: ['Crystal Chandelier View', 'Central Atmosphere', 'Plush Velvet Chairs'],
  },
  {
    id: 'tbl-5',
    number: 5,
    name: 'Wine Cellar Vista Table',
    zone: 'Main Dining',
    capacity: 4,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'standard',
    features: ['Vintage Wine Cellar View', 'Warm Acoustic Lighting', 'Spacious Distance'],
  },
  {
    id: 'tbl-6',
    number: 6,
    name: 'Grand Family Dining',
    zone: 'Main Dining',
    capacity: 6,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'standard',
    features: ['Comfortable 6-Chair Setup', 'Spacious Tabletop', 'Great for Families'],
  },
  {
    id: 'tbl-7',
    number: 7,
    name: 'Celebration Grand Table',
    zone: 'Main Dining',
    capacity: 6,
    shape: 'rectangle',
    status: 'reserved',
    priceTier: 'standard',
    features: ['6 Deluxe Chairs', 'Celebration Setup', 'Central Serving Space'],
  },

  // VIP Lounge
  {
    id: 'tbl-8',
    number: 8,
    name: 'Royal Velvet VIP Booth',
    zone: 'VIP Lounge',
    capacity: 6,
    shape: 'booth',
    status: 'available',
    priceTier: 'vip',
    features: ['Private Curved Velvet Booth', 'Personal Sommelier Access', 'Acoustic Privacy'],
  },
  {
    id: 'tbl-9',
    number: 9,
    name: 'Presidential 8-Seat Table',
    zone: 'VIP Lounge',
    capacity: 8,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'vip',
    features: ['8 Executive Highback Chairs', 'Private Butler Service', 'Dedicated Lounge Bar'],
  },

  // Chef's Garden
  {
    id: 'tbl-10',
    number: 10,
    name: 'Courtyard Fountain Table',
    zone: "Chef's Garden",
    capacity: 4,
    shape: 'circle',
    status: 'available',
    priceTier: 'standard',
    features: ['Open Sky Garden', 'Fountain Murmur', 'Fresh Floral Aromas'],
  },
  {
    id: 'tbl-11',
    number: 11,
    name: 'Olive Tree Patio',
    zone: "Chef's Garden",
    capacity: 4,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'standard',
    features: ['Illuminated Olive Trees', 'Breezy Patio', 'Relaxed Fine Dining'],
  },
  {
    id: 'tbl-12',
    number: 12,
    name: 'Garden Banquet Feast Table',
    zone: "Chef's Garden",
    capacity: 8,
    shape: 'rectangle',
    status: 'available',
    priceTier: 'vip',
    features: ['8 Garden Chairs', 'Long Wood Dining Slab', 'Under Fairy Lights'],
  },
]

interface TableFloorPlanProps {
  selectedTable: RestaurantTable | null
  selectedChairs: number[]
  onSelectTable: (table: RestaurantTable, chairs: number[]) => void
  guestCount: number
}

const ZONES = ['All Zones', 'Window Terrace', 'Main Dining', 'VIP Lounge', "Chef's Garden"] as const

export default function TableFloorPlan({
  selectedTable,
  selectedChairs,
  onSelectTable,
  guestCount,
}: TableFloorPlanProps) {
  const [activeZone, setActiveZone] = useState<string>('All Zones')
  const [filterCapacity, setFilterCapacity] = useState<number | 'all'>('all')

  const filteredTables = RESTAURANT_TABLES.filter((tbl) => {
    const matchZone = activeZone === 'All Zones' || tbl.zone === activeZone
    const matchCap =
      filterCapacity === 'all'
        ? true
        : filterCapacity === 6
        ? tbl.capacity >= 6
        : tbl.capacity === filterCapacity
    return matchZone && matchCap
  })

  const handleTableClick = (tbl: RestaurantTable) => {
    if (tbl.status === 'occupied' || tbl.status === 'reserved') return
    // Default select all chairs up to guestCount or table capacity
    const countToSelect = Math.min(guestCount || tbl.capacity, tbl.capacity)
    const defaultChairs = Array.from({ length: countToSelect }, (_, i) => i + 1)
    onSelectTable(tbl, defaultChairs)
  }

  const handleChairToggle = (tbl: RestaurantTable, chairIdx: number) => {
    if (tbl.id !== selectedTable?.id) {
      handleTableClick(tbl)
      return
    }
    let updated: number[]
    if (selectedChairs.includes(chairIdx)) {
      if (selectedChairs.length > 1) {
        updated = selectedChairs.filter((c) => c !== chairIdx)
      } else {
        updated = selectedChairs
      }
    } else {
      updated = [...selectedChairs, chairIdx].sort((a, b) => a - b)
    }
    onSelectTable(tbl, updated)
  }

  return (
    <div className="space-y-6">
      {/* Zone Filters & Legend Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Zone Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {ZONES.map((zone) => {
            const isActive = activeZone === zone
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setActiveZone(zone)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'gold-gradient-bg text-black shadow-lg scale-105'
                    : 'bg-[var(--surface)] border border-primary/20 text-[var(--muted)] hover:text-[var(--foreground)] hover:border-primary/50'
                }`}
              >
                {zone === 'Window Terrace' && <Eye className="h-3.5 w-3.5" />}
                {zone === 'Main Dining' && <Sparkles className="h-3.5 w-3.5" />}
                {zone === 'VIP Lounge' && <Crown className="h-3.5 w-3.5" />}
                {zone === "Chef's Garden" && <Trees className="h-3.5 w-3.5" />}
                {zone}
              </button>
            )
          })}
        </div>

        {/* Chair Capacity Quick Filter */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-medium flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" /> Chairs:
          </span>
          {[
            { label: 'All', value: 'all' },
            { label: '2 Seats', value: 2 },
            { label: '4 Seats', value: 4 },
            { label: '6+ Seats', value: 6 },
          ].map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setFilterCapacity(c.value as any)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filterCapacity === c.value
                  ? 'bg-primary/20 text-[#E5C158] border border-primary/50'
                  : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#121216] border border-primary/20 px-4 py-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full gold-gradient-bg shadow-sm" />
            <span className="text-[var(--foreground)] font-medium">Selected Chair / Table</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[var(--card)] border border-primary/40" />
            <span>Available Table</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-900/60 border border-red-500/40" />
            <span>Reserved / Occupied</span>
          </div>
        </div>
        <div className="text-[#C5A059] font-medium hidden sm:flex items-center gap-1">
          <Info className="h-3.5 w-3.5" />
          <span>Click a table or individual chair to select</span>
        </div>
      </div>

      {/* Tables Grid Layout with Animated Visual Chairs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTables.map((tbl) => {
          const isSelected = selectedTable?.id === tbl.id
          const isReserved = tbl.status === 'reserved' || tbl.status === 'occupied'

          return (
            <motion.div
              key={tbl.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleTableClick(tbl)}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#201b12] to-[#141418] border-primary shadow-xl shadow-primary/10 ring-1 ring-primary'
                  : isReserved
                  ? 'bg-[var(--surface)] border-red-950/40 opacity-70 cursor-not-allowed'
                  : 'bg-[var(--surface)] border-primary/20 hover:border-primary/60 hover:shadow-lg'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-[var(--foreground)] group-hover:text-primary transition">
                      Table {tbl.number < 10 ? `0${tbl.number}` : tbl.number}
                    </span>
                    {tbl.priceTier === 'vip' && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        <Crown className="h-2.5 w-2.5" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{tbl.name}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      isReserved
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : isSelected
                        ? 'gold-gradient-bg text-black font-bold shadow-sm'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isReserved ? 'Reserved' : isSelected ? 'Selected' : 'Available'}
                  </span>
                  <div className="text-[11px] text-[#C5A059] font-medium mt-1">
                    {tbl.capacity} Total Chairs
                  </div>
                </div>
              </div>

              {/* The Core Visualizer: Real Table & Animated Chairs */}
              <div className="my-4 flex items-center justify-center min-h-[170px] bg-[var(--input)]/60 rounded-xl border border-[var(--border-subtle)] relative">
                <ChairVisualizer
                  tableNumber={tbl.number}
                  tableName={tbl.name}
                  capacity={tbl.capacity}
                  shape={tbl.shape}
                  isTableSelected={isSelected}
                  isTableOccupied={isReserved}
                  selectedChairs={isSelected ? selectedChairs : []}
                  onChairClick={(chairIdx) => handleChairToggle(tbl, chairIdx)}
                  interactiveChairs={!isReserved}
                />
              </div>

              {/* Features and Zone Tag */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tbl.features?.slice(0, 2).map((feat) => (
                    <span
                      key={feat}
                      className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-[var(--muted-foreground)]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs">
                  <span className="text-[var(--muted-foreground)] flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> {tbl.zone}
                  </span>
                  <button
                    type="button"
                    disabled={isReserved}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                      isSelected
                        ? 'gold-gradient-bg text-black font-bold shadow-sm'
                        : isReserved
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'border border-primary/40 text-primary hover:bg-primary hover:text-black'
                    }`}
                  >
                    {isSelected ? 'Table Selected ✓' : isReserved ? 'Not Available' : 'Select Table'}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Selected Table Summary Drawer / Banner */}
      <AnimatePresence>
        {selectedTable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl gold-gradient-bg p-[1px] shadow-2xl"
          >
            <div className="rounded-2xl bg-[var(--surface)] p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl gold-gradient-bg text-black font-serif font-bold text-xl shadow-lg">
                  T-{selectedTable.number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-lg md:text-xl font-bold text-[var(--foreground)]">
                      {selectedTable.name}
                    </h4>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase font-bold">
                      Confirmed Choice
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[var(--muted-foreground)] mt-1">
                    {selectedTable.zone} • {selectedTable.capacity} Total Chairs Available
                  </p>
                </div>
              </div>

              {/* Chairs Detail & Action */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-xl bg-[var(--input)] border border-primary/30 px-4 py-2 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                    Reserved Chairs
                  </div>
                  <div className="font-serif text-lg font-bold gold-gradient-text">
                    {selectedChairs.length} of {selectedTable.capacity} Chairs
                  </div>
                </div>

                <div className="rounded-xl bg-primary/10 border border-primary/30 px-3.5 py-2 text-xs text-[#E5C158]">
                  <span>Seats: </span>
                  <span className="font-bold">
                    {selectedChairs.length === selectedTable.capacity
                      ? 'Full Table (All Chairs)'
                      : `Chair #${selectedChairs.join(', #')}`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
