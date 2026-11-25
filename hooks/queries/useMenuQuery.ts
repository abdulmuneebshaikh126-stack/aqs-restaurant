'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMenuItems,
  getCategories,
  createDish,
  updateDish,
  deleteDish,
  toggleDishAvailability,
} from '@/lib/supabase/database'
import { MenuItem } from '@/types'

export const MENU_QUERY_KEY = ['menu_items']
export const CATEGORIES_QUERY_KEY = ['categories']

export function useMenuItemsQuery(fallbackItems?: (MenuItem & { categoryName: string })[]) {
  return useQuery({
    queryKey: MENU_QUERY_KEY,
    queryFn: async () => {
      const dbItems = await getMenuItems()
      if (dbItems && dbItems.length > 0) {
        return dbItems
      }
      return fallbackItems || []
    },
    staleTime: 1000 * 60 * 3, // 3 mins
  })
}

export function useCategoriesQuery(fallbackCategories?: string[]) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const cats = await getCategories()
      if (cats && cats.length > 0) {
        return cats
      }
      return fallbackCategories || ['All', 'Steaks & Grills', 'Pizza', 'Burgers', 'Pasta', 'Desserts', 'Drinks']
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateDishMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dish: {
      name: string
      category_name: string
      price: number
      discount_price?: number | null
      description?: string
      image_url?: string
      is_available?: boolean
      is_featured?: boolean
    }) => {
      return await createDish(dish)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

export function useUpdateDishMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      dishId,
      dish,
    }: {
      dishId: string
      dish: {
        name: string
        category_name: string
        price: number
        discount_price?: number | null
        description?: string
        image_url?: string
        is_available?: boolean
        is_featured?: boolean
      }
    }) => {
      return await updateDish(dishId, dish)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useDeleteDishMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dishId: string) => {
      return await deleteDish(dishId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useToggleDishAvailabilityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dishId, is_available }: { dishId: string; is_available: boolean }) => {
      return await toggleDishAvailability(dishId, is_available)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}
