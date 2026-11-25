'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminOrders, getUserOrders, updateOrderStatus } from '@/lib/supabase/database'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types'

export const ADMIN_ORDERS_KEY = ['admin_orders']
export const userOrdersKey = (userId: string) => ['user_orders', userId]
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

export function useUserOrdersQuery(userId?: string | null) {
  return useQuery({
    queryKey: userOrdersKey(userId || 'guest'),
    queryFn: async () => {
      if (!userId) return []
      const dbOrders = await getUserOrders(userId)
      if (dbOrders && dbOrders.length > 0) {
        return dbOrders
      }
      try {
        const stored = localStorage.getItem('aqs_orders_data')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((o: any) => o.user_id === userId)
          }
        }
      } catch (e) {}
      return []
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  })
}

export function useOrderTrackingQuery(orderId: string) {
  return useQuery({
    queryKey: orderTrackingKey(orderId),
    queryFn: async () => {
      // 1. Check secure server API route
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.order) return data.order as Order
        } else if (res.status === 403) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Access denied for this order.')
        }
      } catch (err: any) {
        if (err?.message?.includes('sign in') || err?.message?.includes('Access denied')) {
          throw err
        }
      }

      // 2. Check localStorage fallback (for offline/local orders)
      try {
        const stored = localStorage.getItem('aqs_orders_data')
        if (stored) {
          const parsed = JSON.parse(stored)
          const found = parsed.find(
            (o: any) => o.id === orderId || o.order_number === orderId
          )
          if (found) return found as Order
        }
      } catch (e) {}

      return null
    },
    enabled: Boolean(orderId),
    retry: false,
    staleTime: 1000 * 15,
  })
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY })
    },
  })
}
