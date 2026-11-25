'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { useUserOrdersQuery } from '@/hooks/queries/useOrdersQuery'
import { useUserReservationsQuery } from '@/hooks/queries/useReservationsQuery'
import { updateUserProfile } from '@/lib/supabase/database'
import { toast } from 'sonner'
import { showConfirmAlert } from '@/lib/utils/sweetalert'
import {
  User,
  ShoppingBag,
  CalendarDays,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
  Phone,
  Mail,
  ChevronRight,
  Edit2,
  Check,
} from 'lucide-react'
import { PageEntrance } from '@/components/motion/MotionPrimitives'

export default function AccountPage() {
  const router = useRouter()
  const { user, profile, isAdmin, loading: authLoading, signOut, refreshProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'settings'>('orders')
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: userOrders = [], isLoading: ordersLoading } = useUserOrdersQuery(user?.id)
  const { data: userReservations = [], isLoading: reservationsLoading } = useUserReservationsQuery(user?.id)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#C5A059]" />
        <p className="font-serif text-lg text-[var(--muted)]">Loading your dining profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)] border border-primary/30 text-primary">
          <User className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Sign In Required</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Please sign in to view your orders, reservations, and personal profile.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full gold-gradient-bg px-8 py-3.5 font-semibold text-black shadow-lg hover:opacity-90 transition"
        >
          Sign In / Register
        </Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    const confirmed = await showConfirmAlert(
      'Sign Out',
      'Are you sure you want to log out of your account?',
      'Yes, Sign Out'
    )
    if (confirmed) {
      await signOut()
      toast.success('Signed out successfully.')
      router.push('/')
      router.refresh()
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    try {
      await updateUserProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
      })
      await refreshProfile()
      setEditing(false)
      toast.success('Profile Updated', {
        description: 'Your contact details have been updated.',
      })
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err.message || 'Could not update profile.',
      })
    } finally {
      setSaving(false)
    }
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">Delivered</span>
      case 'ready':
        return <span className="rounded-full bg-sky-500/10 border border-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-400">Ready</span>
      case 'preparing':
        return <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-400">Preparing</span>
      case 'confirmed':
        return <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400">Confirmed</span>
      case 'cancelled':
        return <span className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">Cancelled</span>
      default:
        return <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-400">Pending</span>
    }
  }

  const getReservationStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">Approved</span>
      case 'rejected':
        return <span className="rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-400">Rejected</span>
      case 'seated':
        return <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-400">Seated</span>
      default:
        return <span className="rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-400">Pending</span>
    }
  }

  return (
    <PageEntrance className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      {/* User Header Profile Card */}
      <div className="rounded-3xl bg-[var(--surface)] border border-primary/30 p-6 md:p-8 shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gold-gradient-bg text-black shadow-lg">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                  {profile?.full_name || 'Valued Guest'}
                </h1>
                {isAdmin ? (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#E5C158]">
                    Admin
                  </span>
                ) : (
                  <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#C5A059]">
                    Customer
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  {user.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-5 py-2.5 text-xs font-semibold text-[#E5C158] hover:bg-primary/20 transition shadow"
              >
                <ShieldCheck className="h-4 w-4" /> Admin Portal
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-red-400 hover:border-red-400/40 transition"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mt-8 flex gap-2 border-t border-[var(--border)] pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition ${
              activeTab === 'orders'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> My Orders ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition ${
              activeTab === 'reservations'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            <CalendarDays className="h-4 w-4" /> My Reservations ({userReservations.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition ${
              activeTab === 'settings'
                ? 'gold-gradient-bg text-black shadow-md'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            <Edit2 className="h-4 w-4" /> Profile Details
          </button>
        </div>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">Order History</h2>
            <Link
              href="/menu"
              className="text-xs uppercase tracking-wider text-[#C5A059] hover:underline font-semibold"
            >
              Order More +
            </Link>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C5A059]" />
            </div>
          ) : userOrders.length === 0 ? (
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">No Orders Placed Yet</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Explore our signature steaks, wood-fired pizzas, and gourmet creations.
              </p>
              <Link
                href="/menu"
                className="mt-6 inline-block rounded-full gold-gradient-bg px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:opacity-90 transition"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((ord: any) => (
                <div
                  key={ord.id}
                  className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5 shadow-md hover:border-primary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase">
                        #{ord.order_number || ord.id.slice(0, 8)}
                      </span>
                      {getOrderStatusBadge(ord.status)}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[var(--foreground)] mt-1">
                      Rs. {Number(ord.total).toFixed(2)} • {ord.order_items?.length || 0} item(s)
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Placed on {new Date(ord.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                      Deliver to: {ord.delivery_address}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${ord.id}`}
                    className="flex items-center gap-2 rounded-full gold-gradient-bg px-5 py-2.5 text-xs font-bold text-black uppercase tracking-wider shadow hover:opacity-90 transition w-fit"
                  >
                    Track Live <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reservations */}
      {activeTab === 'reservations' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">Table Reservations</h2>
            <Link
              href="/reservations"
              className="text-xs uppercase tracking-wider text-[#C5A059] hover:underline font-semibold"
            >
              Reserve Table +
            </Link>
          </div>

          {reservationsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#C5A059]" />
            </div>
          ) : userReservations.length === 0 ? (
            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-12 text-center">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-600 mb-3" />
              <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">No Table Reservations Found</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Book an intimate window terrace table or VIP booth for your next dining experience.
              </p>
              <Link
                href="/reservations"
                className="mt-6 inline-block rounded-full gold-gradient-bg px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-md hover:opacity-90 transition"
              >
                Reserve a Table
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userReservations.map((res: any) => (
                <div
                  key={res.id}
                  className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5 shadow-md hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#C5A059] font-bold">
                        {res.zone || 'Main Dining'}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                        {res.table_name || `Table #${res.table_number || '01'}`}
                      </h3>
                    </div>
                    {getReservationStatusBadge(res.status)}
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--muted-foreground)] block uppercase text-[10px]">Date</span>
                      <span className="font-semibold text-[var(--foreground)]">{res.reservation_date}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)] block uppercase text-[10px]">Time Slot</span>
                      <span className="font-semibold text-[var(--foreground)]">{res.reservation_time}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)] block uppercase text-[10px]">Guests & Seats</span>
                      <span className="font-semibold text-[#E5C158]">
                        {res.guests} Guests (Seats #{res.selected_chairs?.join(', #') || res.chairs_count || res.guests})
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--muted-foreground)] block uppercase text-[10px]">Booking Ref</span>
                      <span className="font-mono text-[var(--muted)] uppercase">{res.id.slice(0, 8)}</span>
                    </div>
                  </div>

                  {res.special_requests && (
                    <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--muted-foreground)]">
                      <span className="text-[var(--muted-foreground)] font-medium">Notes: </span>
                      {res.special_requests}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'settings' && (
        <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 md:p-8 max-w-xl">
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-2">Personal Information</h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-6">
            Keep your contact details up to date for effortless checkout and reservation confirmations.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full rounded-xl bg-[var(--input)]/60 border border-[var(--border)] px-4 py-3 text-[var(--muted-foreground)] cursor-not-allowed text-sm"
              />
              <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">
                Managed via Supabase Auth credentials.
              </span>
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full gold-gradient-bg px-7 py-3 font-semibold text-black text-xs uppercase tracking-wider shadow hover:opacity-90 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </PageEntrance>
  )
}
