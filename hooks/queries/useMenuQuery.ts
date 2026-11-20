'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMenuItems, getCategories } from '@/lib/supabase/database'
import { createClient } from '@/lib/supabase/client'
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
    staleTime: 1000 * 60 * 5, // 5 mins
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
  const supabase = createClient()

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
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          name: dish.name,
          category_name: dish.category_name,
          price: dish.price,
          discount_price: dish.discount_price || null,
          description: dish.description || '',
          image_url: dish.image_url || '',
          is_available: dish.is_available ?? true,
          is_featured: dish.is_featured ?? false,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}

export function useDeleteDishMutation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (dishId: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', dishId)

      if (error) throw error
      return dishId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    },
  })
}
