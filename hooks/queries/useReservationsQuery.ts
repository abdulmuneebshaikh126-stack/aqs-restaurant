'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAdminReservations,
  getUserReservations,
  updateReservationStatus,
  submitReservation,
} from '@/lib/supabase/database'
import { Reservation, ReservationStatus } from '@/types'

export const ADMIN_RESERVATIONS_KEY = ['admin_reservations']
export const userReservationsKey = (userId: string) => ['user_reservations', userId]

export function useAdminReservationsQuery() {
  return useQuery({
    queryKey: ADMIN_RESERVATIONS_KEY,
    queryFn: async () => {
      const dbRes = await getAdminReservations()
      if (dbRes && dbRes.length > 0) {
        return dbRes
      }
      try {
        const stored = localStorage.getItem('aqs_reservations_data')
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

export function useUserReservationsQuery(userId?: string | null) {
  return useQuery({
    queryKey: userReservationsKey(userId || 'guest'),
    queryFn: async () => {
      if (!userId) return []
      const dbRes = await getUserReservations(userId)
      if (dbRes && dbRes.length > 0) {
        return dbRes
      }
      try {
        const stored = localStorage.getItem('aqs_reservations_data')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((r: any) => r.user_id === userId)
          }
        }
      } catch (e) {}
      return []
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 30,
  })
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      customer_name: string
      email?: string
      phone: string
      reservation_date: string
      reservation_time: string
      guests: number
      table_id?: string
      table_name?: string
      table_number?: number
      chairs_count?: number
      selected_chairs?: number[]
      zone?: string
      special_requests?: string | null
      user_id?: string | null
    }) => {
      const data = await submitReservation(payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_RESERVATIONS_KEY })
    },
  })
}

export function useUpdateReservationStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      resId,
      status,
    }: {
      resId: string
      status: ReservationStatus
    }) => {
      await updateReservationStatus(resId, status)
      // also update localStorage
      try {
        const stored = localStorage.getItem('aqs_reservations_data')
        if (stored) {
          const resList = JSON.parse(stored)
          const updated = resList.map((r: any) => (r.id === resId ? { ...r, status } : r))
          localStorage.setItem('aqs_reservations_data', JSON.stringify(updated))
        }
      } catch (e) {}
      return { resId, status }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_RESERVATIONS_KEY })
    },
  })
}
