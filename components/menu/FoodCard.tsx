
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check, Star, AlertCircle } from 'lucide-react'
import { MenuItem } from '@/types'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'

export default function FoodCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const price = item.discount_price ?? item.price
  const isAvailable = item.is_available ?? true

  const handleAdd = () => {
    if (!isAvailable) {
      toast.error('Dish Unavailable', {
        description: `${item.name} is currently out of stock in our kitchen.`,
      })
      return
    }

    addItem(item)
    setAdded(true)
    toast.success(`${item.name} added to cart!`, {
      description: `Rs. {price.toFixed(2)} • Ready in cart`,
    })
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-[var(--secondary)] text-[var(--foreground)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10 ${
        !isAvailable ? 'opacity-75' : ''
      }`}
    >
      <div className="relative h-56 w-full overflow-hidden bg-[var(--background)]">
        <Image
          src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
            !isAvailable ? 'grayscale-[50%]' : ''
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {!isAvailable ? (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-red-500/40 bg-red-950/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-300 shadow-md backdrop-blur-md">
            <AlertCircle className="h-3 w-3" /> Sold Out
          </span>
        ) : item.discount_price ? (
          <span className="absolute left-3 top-3 rounded-full gold-gradient-bg px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black shadow-md">
            Special Offer
          </span>
        ) : item.is_featured ? (
          <span className="absolute left-3 top-3 rounded-full border border-primary/40 bg-black/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] shadow-md backdrop-blur-md">
            Chef&apos;s Pick
          </span>
        ) : null}

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-xs font-semibold text-yellow-400 backdrop-blur-md">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>4.9</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="font-serif text-lg font-bold text-[var(--foreground)] transition-colors duration-300 group-hover:text-primary">
            {item.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--foreground)] opacity-70">
            {item.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[var(--foreground)]/10 pt-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold gold-gradient-text tracking-tight">
                Rs. {price.toFixed(2)}
              </span>
              {item.discount_price && (
                <span className="text-xs text-[var(--foreground)] opacity-50 line-through">
                  Rs. {item.price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--foreground)] opacity-60">
              {isAvailable ? 'Freshly Prepared' : 'Unavailable Today'}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-md transition-all duration-300 ${
              !isAvailable
                ? 'cursor-not-allowed border border-[var(--foreground)]/10 bg-[var(--background)] text-[var(--foreground)] opacity-50'
                : added
                ? 'scale-95 bg-emerald-500 text-white'
                : 'gold-gradient-bg text-black hover:scale-105 active:scale-95 hover:opacity-90'
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            {!isAvailable ? (
              'Sold Out'
            ) : added ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
