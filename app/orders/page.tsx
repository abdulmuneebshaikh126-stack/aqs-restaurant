'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, UtensilsCrossed, ShoppingBag, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useUserOrdersQuery } from '@/hooks/queries/useOrdersQuery'

export default function OrdersIndexPage() {
  const [orderId, setOrderId] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const { data: userOrders = [] } = useUserOrdersQuery(user?.id)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orderId.trim()
    if (trimmed) {
      router.push(`/orders/${trimmed}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)] border border-primary/30 text-primary">
        <UtensilsCrossed className="h-10 w-10" />
      </div>

      <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
        Order Status
      </span>
      <h1 className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)] md:text-5xl">
        Track Your Order
      </h1>
      <p className="mt-3 text-[var(--muted-foreground)]">
        Enter your Order ID or Order Number below to track real-time kitchen preparation and delivery dispatch.
      </p>

      <form onSubmit={handleTrack} className="mt-8 max-w-md mx-auto flex gap-2">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. APNA-DERA-... or UUID"
          required
          className="flex-1 rounded-full bg-[var(--surface)] border border-[var(--border)] px-5 py-3.5 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
        />
        <button
          type="submit"
          className="rounded-full gold-gradient-bg px-7 py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 flex items-center gap-2 cursor-pointer"
        >
          <Search className="h-4 w-4" /> Track
        </button>
      </form>

      {/* Logged in user recent orders */}
      {user && userOrders.length > 0 && (
        <div className="mt-12 text-left bg-[var(--surface)] border border-primary/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#C5A059]" /> Your Recent Orders
            </h3>
            <Link href="/account" className="text-xs text-[#C5A059] hover:underline font-semibold uppercase">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {userOrders.slice(0, 3).map((ord: any) => (
              <Link
                key={ord.id}
                href={`/orders/${ord.id}`}
                className="flex items-center justify-between rounded-xl bg-[var(--input)] p-3 border border-[var(--border-subtle)] hover:border-primary/40 transition group"
              >
                <div>
                  <span className="font-mono text-xs text-[#C5A059] font-bold">
                    #{ord.order_number || ord.id.slice(0, 8)}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    ${Number(ord.total).toFixed(2)} • Status: <span className="capitalize text-[var(--foreground)] font-medium">{ord.status}</span>
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-primary transition" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 text-sm text-[var(--muted-foreground)]">
        Haven&apos;t placed an order yet?{' '}
        <Link href="/menu" className="text-primary hover:underline font-medium">
          Browse our Menu
        </Link>
      </div>
    </div>
  )
}
