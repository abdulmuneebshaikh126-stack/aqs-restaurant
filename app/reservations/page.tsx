'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Crown,
  Share2,
  CalendarDays,
  Loader2,
} from 'lucide-react'
import { reservationSchema, ReservationInput } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { RestaurantTable } from '@/types'
import TableFloorPlan, { RESTAURANT_TABLES } from '@/components/reservations/TableFloorPlan'
import { useCreateReservationMutation } from '@/hooks/queries/useReservationsQuery'
import { toast } from 'sonner'

const TIME_SLOTS = [
  '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'
]

export default function ReservationsPage() {
  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState<any | null>(null)
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(RESTAURANT_TABLES[0])
  const [selectedChairs, setSelectedChairs] = useState<number[]>([1, 2])
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const supabase = createClient()
  const { user, profile } = useAuth()
  const createReservationMutation = useCreateReservationMutation()

  // Get tomorrow's date formatted as YYYY-MM-DD for default
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      reservation_date: defaultDate,
      reservation_time: '08:00 PM',
      guests: 2,
      customer_name: '',
      email: '',
      phone: '',
      special_requests: '',
    },
  })

  // Autofill user details
  useEffect(() => {
    if (profile?.full_name) setValue('customer_name', profile.full_name)
    if (user?.email) setValue('email', user.email)
    if (profile?.phone) setValue('phone', profile.phone)
  }, [profile, user, setValue])

  const watchGuests = watch('guests') || 2
  const watchDate = watch('reservation_date')
  const watchTime = watch('reservation_time')

  // When guest count changes, auto-select a fitting table if needed
  useEffect(() => {
    if (selectedTable && selectedTable.capacity < watchGuests) {
      const fitting = RESTAURANT_TABLES.find((t) => t.capacity >= watchGuests && t.status === 'available')
      if (fitting) {
        setSelectedTable(fitting)
        setSelectedChairs(Array.from({ length: watchGuests }, (_, i) => i + 1))
      }
    }
  }, [watchGuests])

  const handleTableAndChairs = (tbl: RestaurantTable, chairs: number[]) => {
    setSelectedTable(tbl)
    setSelectedChairs(chairs)
    setValue('guests', chairs.length)
  }

  const onSubmit = async (data: ReservationInput) => {
    setLoading(true)

    const reservationPayload = {
      id: `res-${Date.now().toString(36)}`,
      user_id: user?.id || null,
      customer_name: data.customer_name,
      email: data.email,
      phone: data.phone,
      reservation_date: data.reservation_date,
      reservation_time: data.reservation_time,
      guests: selectedChairs.length || data.guests,
      special_requests: data.special_requests || null,
      table_id: selectedTable?.id || 'tbl-1',
      table_name: selectedTable?.name || 'Table 01',
      table_number: selectedTable?.number || 1,
      chairs_count: selectedChairs.length,
      selected_chairs: selectedChairs,
      zone: selectedTable?.zone || 'Main Dining',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    }

    try {
      // 1. Save to Supabase using mutation
      await createReservationMutation.mutateAsync({
        user_id: reservationPayload.user_id,
        customer_name: reservationPayload.customer_name,
        email: reservationPayload.email,
        phone: reservationPayload.phone,
        reservation_date: reservationPayload.reservation_date,
        reservation_time: reservationPayload.reservation_time,
        guests: reservationPayload.guests,
        table_id: reservationPayload.table_id,
        table_name: reservationPayload.table_name,
        table_number: reservationPayload.table_number,
        chairs_count: reservationPayload.chairs_count,
        selected_chairs: reservationPayload.selected_chairs,
        zone: reservationPayload.zone,
        special_requests: reservationPayload.special_requests,
      })
    } catch (e: any) {
      console.warn('Supabase booking notice:', e?.message)
      if (e?.message && e.message.includes('already booked')) {
        toast.error('Booking Conflict', { description: e.message })
        setLoading(false)
        return
      }
    }

    // 2. Persist in localStorage for instant Admin Panel viewing
    try {
      const existing = JSON.parse(localStorage.getItem('aqs_reservations_data') || '[]')
      localStorage.setItem('aqs_reservations_data', JSON.stringify([reservationPayload, ...existing]))
    } catch (e) {
      console.warn('Storage error:', e)
    }

    toast.success('Table Reserved Successfully!', {
      description: `${reservationPayload.table_name} reserved for ${reservationPayload.reservation_date} at ${reservationPayload.reservation_time}`,
    })

    setLoading(false)
    setSuccessData(reservationPayload)
  }

  // Success view with celebration & pass
  if (successData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-primary/40 p-8 md:p-12 text-center shadow-2xl"
        >
          {/* Glowing background halo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

          {/* Success Checkmark Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full gold-gradient-bg text-black shadow-xl shadow-primary/20"
          >
            <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
          </motion.div>

          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-bold">
            Reservation Confirmed
          </span>
          <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)] md:text-5xl">
            Table Reserved for {successData.customer_name}
          </h1>
          <p className="mt-3 text-sm md:text-base text-[var(--muted-foreground)] max-w-md mx-auto">
            Your table and individual chairs have been secured at APNA-DERA Restaurant. An SMS confirmation will be delivered to <span className="text-[var(--foreground)] font-medium">{successData.phone}</span>.
          </p>

          {/* Luxury Table & Seating Pass */}
          <div className="mt-8 rounded-2xl bg-[var(--input)] border border-primary/30 p-6 text-left shadow-lg">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
                  APNA-DERA Dining Pass
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--foreground)] mt-0.5">
                  Table {successData.table_number < 10 ? `0${successData.table_number}` : successData.table_number} — {successData.table_name}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{successData.zone}</p>
              </div>
              <div className="rounded-xl gold-gradient-bg px-3 py-1.5 text-center text-black">
                <div className="text-[9px] uppercase tracking-wider font-extrabold">Chairs</div>
                <div className="font-serif text-lg font-bold leading-tight">
                  {successData.chairs_count}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs md:text-sm">
              <div>
                <span className="text-[var(--muted-foreground)] uppercase tracking-wider text-[10px] block">Date</span>
                <span className="font-medium text-[var(--foreground)]">{successData.reservation_date}</span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] uppercase tracking-wider text-[10px] block">Time Slot</span>
                <span className="font-medium text-[var(--foreground)]">{successData.reservation_time}</span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] uppercase tracking-wider text-[10px] block">Selected Chairs</span>
                <span className="font-medium text-[#E5C158]">
                  Seats #{successData.selected_chairs?.join(', #')}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)] uppercase tracking-wider text-[10px] block">Booking Ref</span>
                <span className="font-mono text-[var(--muted)] uppercase">{successData.id}</span>
              </div>
            </div>

            {successData.special_requests && (
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)]">
                <span className="text-[var(--muted-foreground)] font-medium">Special Requests: </span>
                {successData.special_requests}
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                setSuccessData(null)
                setStep(1)
              }}
              className="rounded-full gold-gradient-bg px-8 py-3.5 text-sm font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-105"
            >
              Book Another Table
            </button>
            <a
              href="/menu"
              className="rounded-full border border-primary/50 px-8 py-3.5 text-sm font-semibold text-primary hover:bg-primary/10 transition"
            >
              Explore Pre-order Menu
            </a>
            {user && (
              <a
                href="/account"
                className="rounded-full border border-amber-500/50 bg-amber-500/10 px-8 py-3.5 text-sm font-semibold text-[#E5C158] hover:bg-amber-500/20 transition shadow"
              >
                View in My Account
              </a>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      {/* Page Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Luxury Table & Seating Reservation
        </span>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)] md:text-5xl">
          Reserve Your Table & Chairs
        </h1>
        <p className="mt-3 text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed font-light">
          Choose your dining date, select your table and exact chairs directly on our interactive floor plan, and secure your dining experience in seconds.
        </p>
      </div>

      {/* Animated Step Progress Indicator */}
      <div className="mx-auto max-w-3xl mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 gold-gradient-bg transition-all duration-500 -z-0"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {[
            { num: 1, label: 'Date & Time', icon: CalendarDays },
            { num: 2, label: 'Table & Chairs', icon: Users },
            { num: 3, label: 'Guest Details', icon: Crown },
          ].map((s) => {
            const isPassed = step > s.num
            const isCurrent = step === s.num
            const Icon = s.icon

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as any)}
                className="flex flex-col items-center gap-2 relative z-10 group"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-sm transition-all duration-300 shadow-lg ${
                    isCurrent
                      ? 'gold-gradient-bg text-black ring-4 ring-primary/20 scale-110'
                      : isPassed
                      ? 'bg-emerald-500 text-[var(--foreground)]'
                      : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-wider transition ${
                    isCurrent ? 'text-[#E5C158]' : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Reservation Flow */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* STEP 1: Date, Time & Guests */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mx-auto max-w-3xl rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 md:p-10 shadow-xl space-y-8"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" /> Step 1: When are you dining?
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Select your preferred date, party size, and arrival time slot.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Date Input */}
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Reservation Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('reservation_date')}
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3.5 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition [color-scheme:inherit]"
                />
                {errors.reservation_date && (
                  <p className="mt-1 text-xs text-red-400">{errors.reservation_date.message}</p>
                )}
              </div>

              {/* Guests Count Selector */}
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Party Size (Guests)
                </label>
                <div className="flex items-center gap-2">
                  {[2, 4, 6, 8].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setValue('guests', g)}
                      className={`flex-1 rounded-xl py-3 font-semibold text-sm transition-all duration-200 ${
                        watchGuests === g
                          ? 'gold-gradient-bg text-black shadow-md scale-105'
                          : 'bg-[var(--input)] border border-[var(--border)] text-[var(--muted)] hover:border-primary/40'
                      }`}
                    >
                      {g} Guests
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time Slot Buttons */}
            <div>
              <label className="mb-3 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Available Arrival Slots
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = watchTime === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setValue('reservation_time', slot)}
                      className={`rounded-xl py-2.5 px-3 text-xs font-semibold tracking-wider transition-all duration-200 ${
                        isSelected
                          ? 'gold-gradient-bg text-black shadow-md scale-105 font-bold'
                          : 'bg-[var(--input)] border border-[var(--border)] text-[var(--muted)] hover:border-primary/50 hover:text-[var(--foreground)]'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-full gold-gradient-bg px-8 py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-105"
              >
                Choose Table & Chairs <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Interactive Table & Chairs Floor Plan */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 md:p-8 shadow-xl space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" /> Step 2: Interactive Table & Chairs Floor Plan
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Click on any table or its individual chairs to pick your exact seating.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--muted)] hover:border-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!selectedTable}
                  className="flex items-center gap-1.5 rounded-full gold-gradient-bg px-6 py-2 text-xs font-bold uppercase tracking-wider text-black shadow transition hover:opacity-90 disabled:opacity-50"
                >
                  Confirm Guest Details <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Floor Plan Component with Real Animated Chairs */}
            <TableFloorPlan
              selectedTable={selectedTable}
              selectedChairs={selectedChairs}
              onSelectTable={handleTableAndChairs}
              guestCount={watchGuests}
            />

            {/* Bottom Nav Action */}
            <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change Date & Time
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedTable}
                className="flex items-center gap-2 rounded-full gold-gradient-bg px-8 py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-105 disabled:opacity-50"
              >
                Proceed to Guest Details ({selectedChairs.length} Chairs) <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Guest Details & Final Submission */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mx-auto max-w-3xl rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 md:p-10 shadow-xl space-y-8"
          >
            <div>
              <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <Crown className="h-6 w-6 text-primary" /> Step 3: Complete Your Reservation
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Enter your details to finalize your table and chairs booking.
              </p>
            </div>

            {/* Reservation Summary Snapshot */}
            {selectedTable && (
              <div className="rounded-xl bg-[var(--input)] border border-primary/30 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
                    Selected Table
                  </span>
                  <div className="font-serif text-lg font-bold text-[var(--foreground)]">
                    Table {selectedTable.number} — {selectedTable.name}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {selectedTable.zone} • {watchDate} at {watchTime}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-center">
                    <span className="text-[10px] uppercase text-[var(--muted-foreground)] block font-semibold">Chairs</span>
                    <span className="font-serif text-base font-bold gold-gradient-text">
                      {selectedChairs.length} Reserved
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-[#E5C158] hover:underline"
                  >
                    Change Table
                  </button>
                </div>
              </div>
            )}

            {/* Contact Inputs */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Full Name
                </label>
                <input
                  {...register('customer_name')}
                  placeholder="e.g. Alexander Vance"
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3.5 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                />
                {errors.customer_name && (
                  <p className="mt-1 text-xs text-red-400">{errors.customer_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3.5 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="e.g. you@example.com"
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3.5 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-semibold">
                  Special Requests (Optional)
                </label>
                <textarea
                  {...register('special_requests')}
                  rows={3}
                  placeholder="Anniversary celebration, window view, dietary allergies, champagne on arrival..."
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3.5 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Floor Plan
              </button>

              <button
                type="submit"
                disabled={loading || createReservationMutation.isPending}
                className="flex items-center gap-2 rounded-full gold-gradient-bg px-9 py-4 font-semibold text-black shadow-xl transition hover:opacity-90 hover:scale-105 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading || createReservationMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Securing Table...</span>
                  </>
                ) : (
                  `Confirm Reservation (${selectedChairs.length} Chairs)`
                )}
              </button>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  )
}
