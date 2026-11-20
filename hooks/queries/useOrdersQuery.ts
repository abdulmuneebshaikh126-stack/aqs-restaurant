'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminOrders, updateOrderStatus } from '@/lib/supabase/database'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'

export const ADMIN_ORDERS_KEY = ['admin_orders']
export const orderTrackingKey = (id: string) => ['order', id]

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: ADMIN_ORDERS_KEY,
    queryFn: async () => {
      const dbOrders = await getAdminOrders()
      if (dbOrders && dbOrders.length > 0) {
        return dbOrders
      }
      try {
        const stored = localStorage.getItem('aqs_orders_data')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (e) {}
      return []
    },
    staleTime: 1000 * 30, // 30s
  })
}

export function useOrderTrackingQuery(orderId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: orderTrackingKey(orderId),
    queryFn: async () => {
      // 1. Check Supabase
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single()

      if (!error && data) {
        return data as Order
      }

      // 2. Check localStorage fallback
      try {
        const stored = localStorage.getItem('aqs_orders_data')
        if (stored) {
          const parsed = JSON.parse(stored)
          const found = parsed.find((o: any) => o.id === orderId)
          if (found) return found as Order
        }
      } catch (e) {}

      return null
    },
    enabled: Boolean(orderId),
    staleTime: 1000 * 15,
  })
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order['status'] | 'cancelled' }) => {
      await updateOrderStatus(orderId, status)
      // also update localStorage
      try {
        const stored = localStorage.getItem('aqs_orders_data')
        if (stored) {
          const orders = JSON.parse(stored)
          const updated = orders.map((o: any) => (o.id === orderId ? { ...o, status } : o))
          localStorage.setItem('aqs_orders_data', JSON.stringify(updated))
        }
      } catch (e) {}
      return { orderId, status }
    },
    onSuccess: ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY })
      queryClient.invalidateQueries({ queryKey: orderTrackingKey(orderId) })
    },
  })
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order')
      }
      return data.order
    },
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY })
    },
  })
}
