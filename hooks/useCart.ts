'use client'

import { useState, useEffect, useCallback } from 'react'
import { CartItem, MenuItem } from '@/types'

const STORAGE_KEY = 'restaurant-cart'
const CART_EVENT = 'aqs-cart-updated'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Read items from localStorage
  const loadCart = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    loadCart()
    setLoaded(true)

    const handleSync = () => loadCart()
    window.addEventListener(CART_EVENT, handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener(CART_EVENT, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [loadCart])

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems))
      window.dispatchEvent(new CustomEvent(CART_EVENT))
    } catch {}
  }

  const addItem = (item: MenuItem) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const current: CartItem[] = stored ? JSON.parse(stored) : items
      const existing = current.find((i) => i.id === item.id)

      let updated: CartItem[]
      if (existing) {
        updated = current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        updated = [...current, { ...item, quantity: 1 }]
      }
      saveCart(updated)
    } catch {
      const existing = items.find((i) => i.id === item.id)
      const updated = existing
        ? items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...items, { ...item, quantity: 1 }]
      saveCart(updated)
    }
  }

  const removeItem = (id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const current: CartItem[] = stored ? JSON.parse(stored) : items
      saveCart(current.filter((i) => i.id !== id))
    } catch {
      saveCart(items.filter((i) => i.id !== id))
    }
  }

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const current: CartItem[] = stored ? JSON.parse(stored) : items
      saveCart(current.map((i) => (i.id === id ? { ...i, quantity: qty } : i)))
    } catch {
      saveCart(items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)))
    }
  }

  const clearCart = () => {
    saveCart([])
  }

  const subtotal = items.reduce(
    (sum, i) => sum + (i.discount_price ?? i.price) * i.quantity,
    0
  )
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const deliveryFee = subtotal > 0 ? 5.0 : 0
  const total = subtotal + deliveryFee

  return {
    items,
    loaded,
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
