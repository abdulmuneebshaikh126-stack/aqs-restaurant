'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, UtensilsCrossed } from 'lucide-react'

export default function OrdersIndexPage() {
  const [orderId, setOrderId] = useState('')
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orderId.trim()
    if (trimmed) {
      router.push(`/orders/${trimmed}`)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#141418] border border-primary/30 text-primary">
        <UtensilsCrossed className="h-10 w-10" />
      </div>

      <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-medium">
        Order Status
      </span>
      <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-5xl">
        Track Your Order
      </h1>
      <p className="mt-3 text-gray-400">
        Enter your Order ID below to track real-time kitchen preparation and delivery status.
      </p>

      <form onSubmit={handleTrack} className="mt-8 max-w-md mx-auto flex gap-2">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID..."
          required
          className="flex-1 rounded-full bg-[#141418] border border-white/10 px-5 py-3.5 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
        />
        <button
          type="submit"
          className="rounded-full gold-gradient-bg px-7 py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 flex items-center gap-2"
        >
          <Search className="h-4 w-4" /> Track
        </button>
      </form>

      <div className="mt-12 text-sm text-gray-400">
        Haven&apos;t placed an order yet?{' '}
        <Link href="/menu" className="text-primary hover:underline font-medium">
          Browse our Menu
        </Link>
      </div>
    </div>
  )
}
