'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'
import { useOrderTrackingQuery } from '@/hooks/queries/useOrdersQuery'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const STEPS: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered']

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { data: initialOrder, isLoading } = useOrderTrackingQuery(params.id)
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
        <p className="font-serif text-xl text-gray-300">Locating your AQS order...</p>
        <span className="text-xs text-gray-500">Checking kitchen dispatch & database</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-20 text-center font-serif text-xl text-gray-400">
        Order not found. Please check your order ID or contact AQS support.
      </div>
    )
  }

  const idx = STEPS.indexOf(order.status)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${live ? 'bg-emerald-400 shadow-md shadow-emerald-500/50' : 'bg-yellow-400'}`} />
        <span className="text-xs uppercase tracking-wider text-gray-400">
          {live ? 'Live Kitchen Tracking Active' : 'Connecting to Kitchen...'}
        </span>
      </div>

      <h1 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
        Order #{order.id.slice(0, 8)}
      </h1>
      <p className="mt-1 text-sm text-gray-400">Placed on {new Date(order.created_at).toLocaleString()}</p>

      {/* Progress tracker */}
      <div className="mt-10 rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-md">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full font-bold transition shadow ${
                  i <= idx
                    ? 'gold-gradient-bg text-black'
                    : 'bg-[#1e1e24] text-gray-500 border border-white/5'
                }`}
              >
                {i + 1}
              </div>
              <span className={`mt-2 text-xs uppercase tracking-wider ${i <= idx ? 'text-primary font-semibold' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div className="mt-6 rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-md">
        <h2 className="mb-4 font-serif text-xl font-semibold text-white border-b border-white/10 pb-3">
          Order Summary
        </h2>
        <div className="space-y-3">
          {order.order_items.map((it, i) => (
            <div key={i} className="flex justify-between border-b border-white/5 pb-2 text-sm text-gray-300 last:border-0">
              <span>{it.item_name} × {it.quantity}</span>
              <span className="font-medium text-white">${(it.item_price * it.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-xl font-bold">
          <span className="font-serif text-white">Total</span>
          <span className="gold-gradient-text">${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
