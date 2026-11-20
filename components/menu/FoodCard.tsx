'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Check, Star } from 'lucide-react'
import { MenuItem } from '@/types'
import { useCart } from '@/hooks/useCart'
import { toast } from 'sonner'

export default function FoodCard({ item }: { item: MenuItem }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const price = item.discount_price ?? item.price

  const handleAdd = () => {
    addItem(item)
    setAdded(true)
    toast.success(`${item.name} added to cart!`, {
      description: `$${price.toFixed(2)} • Ready in cart`,
    })
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group overflow-hidden rounded-2xl bg-[#141418] border border-primary/20 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/10">
      {/* Food Real Image with Badges */}
      <div className="relative h-56 w-full overflow-hidden bg-[#0c0c0e]">
        <Image
          src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Subtle shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-black/30" />

        {/* Special Discount or Chef Badge */}
        {item.discount_price ? (
          <span className="absolute left-3 top-3 rounded-full gold-gradient-bg px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-black shadow-md">
            Special
          </span>
        ) : item.is_featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-black/75 backdrop-blur-md border border-primary/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#E5C158] shadow-md">
            Chef&apos;s Pick
          </span>
        ) : null}

        {/* Real rating badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span>4.9</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-serif text-lg font-bold text-white transition-colors duration-300 group-hover:text-primary">
            {item.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-gray-400 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price and CTA */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold gold-gradient-text tracking-tight">
                ${price.toFixed(2)}
              </span>
              {item.discount_price && (
                <span className="text-xs text-gray-500 line-through">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Freshly Prepared
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md ${
              added
                ? 'bg-emerald-500 text-white scale-95'
                : 'gold-gradient-bg text-black hover:opacity-90 hover:scale-105'
            }`}
            aria-label={`Add ${item.name} to cart`}
          >
            {added ? (
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
