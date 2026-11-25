'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { useOrderTrackingQuery } from '@/hooks/queries/useOrdersQuery'
import { Loader2, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { PageEntrance } from '@/components/motion/MotionPrimitives'

const TRACKING_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { data: initialOrder, isLoading, error: orderError } = useOrderTrackingQuery(params.id)
  const [order, setOrder] = useState<Order | null>(null)
  const [live, setLive] = useState(false)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder)
    }
  }, [initialOrder])

  useEffect(() => {
    if (channelRef.current) return
    const channel = supabase
      .channel(`order-${params.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${params.id}` },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, status: payload.new.status } : prev))
          toast.info('Kitchen Status Updated', {
            description: `Order #${params.id.slice(0, 8)} is now ${payload.new.status}.`,
          })
        }
      )
      .subscribe((s) => setLive(s === 'SUBSCRIBED'))

    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [params.id, supabase])

  if (isLoading || (!order && isLoading)) {
    return (
      <div className="p-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#C5A059]" />
        <p className="font-serif text-xl text-[var(--muted)]">Locating your APNA-DERA order...</p>
        <span className="text-xs text-[var(--muted-foreground)]">Checking kitchen dispatch & database</span>
      </div>
    )
  }

  if (orderError) {
    return (
      <div className="mx-auto max-w-lg p-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">Access Restricted</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {(orderError as Error).message || 'Please sign in with the account that placed this order.'}
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg p-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">Order Not Found</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          We could not locate an order matching ID <span className="text-[#C5A059] font-mono">{params.id}</span>. Please verify your reference number.
        </p>
      </div>
    )
  }

  const isCancelled = order.status === 'cancelled'
  const idx = TRACKING_STEPS.indexOf(order.status)

  return (
    <PageEntrance className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-400 shadow-md shadow-emerald-500/50' : 'bg-yellow-400'}`} />
        <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
          {live ? 'Live Kitchen Tracking Active' : 'Connecting to Kitchen...'}
        </span>
      </div>

      <h1 className="mt-3 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
        Order #{order.order_number || order.id.slice(0, 8)}
      </h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Placed on {new Date(order.created_at).toLocaleString()}
      </p>

      {/* Cancelled Alert Banner */}
      {isCancelled ? (
        <div className="mt-8 rounded-2xl bg-red-500/10 border border-red-500/40 p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
          <h2 className="font-serif text-xl font-bold text-red-500">Order Cancelled</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            This order has been cancelled by the kitchen or customer service. If you have questions, please contact APNA-DERA support.
          </p>
        </div>
      ) : (
        /* Progress tracker */
        <div className="mt-10 rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-md overflow-x-auto">
          <div className="flex items-center justify-between min-w-[340px]">
            {TRACKING_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full font-bold transition shadow text-xs sm:text-sm ${
                    i <= idx
                      ? 'gold-gradient-bg text-black'
                      : 'bg-[var(--card)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-2 text-[10px] sm:text-xs uppercase tracking-wider text-center ${
                    i <= idx ? 'text-primary font-semibold' : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="mt-6 rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-md">
        <h2 className="mb-4 font-serif text-xl font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          Order Summary
        </h2>
        <div className="space-y-3">
          {order.order_items && order.order_items.map((it, i) => (
            <div key={i} className="flex justify-between border-b border-[var(--border-subtle)] pb-2 text-sm text-[var(--muted)] last:border-0">
              <span>{it.item_name} × {it.quantity}</span>
              <span className="font-medium text-[var(--foreground)]">${(Number(it.item_price) * it.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5 text-xs text-[var(--muted-foreground)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[var(--foreground)]">${Number(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="text-[var(--foreground)]">${Number(order.delivery_fee || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4 text-xl font-bold">
          <span className="font-serif text-[var(--foreground)]">Total</span>
          <span className="gold-gradient-text">Rs. {Number(order.total).toFixed(2)}</span>
        </div>
      </div>
    </PageEntrance>
  )
}
