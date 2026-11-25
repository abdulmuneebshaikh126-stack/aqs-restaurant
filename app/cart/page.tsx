'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--surface)] border border-primary/30 text-primary">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Your Cart is Empty</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Discover our culinary creations and add something delicious!</p>
        <Link
          href="/menu"
          className="mt-8 inline-block rounded-full gold-gradient-bg px-9 py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-105"
        >
          Explore Menu
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          Order Review
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
          Your Cart
        </h1>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 rounded-2xl bg-[var(--surface)] border border-primary/20 p-4 shadow-md transition hover:border-primary/40"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-primary/20 shrink-0 bg-[var(--input)]">
              <Image
                src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-[var(--foreground)]">{item.name}</h3>
              <p className="font-bold gold-gradient-text">
                ${(item.discount_price ?? item.price).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="rounded-full bg-[var(--card)] border border-primary/20 p-2 text-[var(--foreground)] hover:text-primary transition"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold text-[var(--foreground)]">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="rounded-full bg-[var(--card)] border border-primary/20 p-2 text-[var(--foreground)] hover:text-primary transition"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-[var(--muted-foreground)] hover:text-red-400 transition"
              aria-label="Remove item"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
        <div className="flex justify-between border-b border-[var(--border)] pb-3 text-sm text-[var(--muted)]">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--foreground)]">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-b border-[var(--border)] py-3 text-sm text-[var(--muted)]">
          <span>Delivery Fee</span>
          <span className="font-medium text-[var(--foreground)]">${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-4 text-xl font-bold">
          <span className="text-[var(--foreground)] font-serif">Total</span>
          <span className="gold-gradient-text">${total.toFixed(2)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block rounded-full gold-gradient-bg py-3.5 text-center font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-[1.02]"
        >
          Proceed to Checkout
        </Link>
        <button
          onClick={clearCart}
          className="mt-3 w-full text-xs text-[var(--muted-foreground)] hover:text-red-400 transition tracking-wider uppercase"
        >
          Clear Cart
        </button>
      </div>
    </div>
  )
}
