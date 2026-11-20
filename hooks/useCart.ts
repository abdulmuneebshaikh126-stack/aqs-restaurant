'use client'
import { useState, useEffect } from 'react'
import { CartItem, MenuItem } from '@/types'

const STORAGE_KEY = 'restaurant-cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, loaded])

  const addItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id))

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id)
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    )
  }

  const clearCart = () => setItems([])

  const subtotal = items.reduce(
    (sum, i) => sum + (i.discount_price ?? i.price) * i.quantity,
    0
  )
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const deliveryFee = subtotal > 0 ? 3.99 : 0
  const total = subtotal + deliveryFee

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    itemCount,
    deliveryFee,
    total,
  }
}
