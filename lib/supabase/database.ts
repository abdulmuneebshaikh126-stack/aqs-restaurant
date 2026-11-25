import { createClient } from './client'
import { MenuItem, Order, Reservation, UserProfile } from '@/types'

// UUID regex validator to avoid Postgres UUID cast errors
export const isValidUUID = (id: any): boolean =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

/**
 * Fetch all menu items from Supabase (or fallback).
 */
export async function getMenuItems(): Promise<(MenuItem & { categoryName: string })[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return []
    }

    return data.map((item: any) => ({
      id: item.id,
      category_id: item.category_id,
      categoryName: item.category?.name || item.category_name || 'All',
      category_name: item.category_name || item.category?.name || 'All',
      name: item.name,
      description: item.description,
      price: Number(item.price),
      discount_price: item.discount_price ? Number(item.discount_price) : null,
      image_url: item.image_url,
      is_available: item.is_available ?? true,
      is_featured: item.is_featured ?? false,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))
  } catch (err) {
    console.warn('Failed to load menu from Supabase:', err)
    return []
  }
}

/**
 * Fetch all categories from Supabase.
 */
export async function getCategories(): Promise<string[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error || !data || data.length === 0) {
      return []
    }

    return ['All', ...data.map((c: any) => c.name)]
  } catch (err) {
    return []
  }
}

/**
 * Create a new dish (Admin)
 */
export async function createDish(dish: {
  name: string
  category_name: string
  price: number
  discount_price?: number | null
  description?: string
  image_url?: string
  is_available?: boolean
  is_featured?: boolean
}) {
  const supabase = createClient()
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
}

/**
 * Update an existing dish (Admin)
 */
export async function updateDish(dishId: string, dish: {
  name: string
  category_name: string
  price: number
  discount_price?: number | null
  description?: string
  image_url?: string
  is_available?: boolean
  is_featured?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .update({
      name: dish.name,
      category_name: dish.category_name,
      price: dish.price,
      discount_price: dish.discount_price || null,
      description: dish.description || '',
      image_url: dish.image_url || '',
      is_available: dish.is_available ?? true,
      is_featured: dish.is_featured ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dishId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a dish (Admin)
 */
export async function deleteDish(dishId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', dishId)

  if (error) throw error
  return dishId
}

/**
 * Toggle menu item availability (Admin)
 */
export async function toggleDishAvailability(dishId: string, is_available: boolean) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .update({ is_available, updated_at: new Date().toISOString() })
    .eq('id', dishId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create a new table reservation in Supabase.
 */
export async function submitReservation(payload: {
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
}) {
  const supabase = createClient()

  // Verify conflict: check if table is already booked for this date and time
  if (payload.table_number && payload.reservation_date && payload.reservation_time) {
    const { data: conflict } = await supabase
      .from('reservations')
      .select('id')
      .eq('table_number', payload.table_number)
      .eq('reservation_date', payload.reservation_date)
      .eq('reservation_time', payload.reservation_time)
      .neq('status', 'rejected')
      .limit(1)

    if (conflict && conflict.length > 0) {
      throw new Error(`Table #${payload.table_number} is already booked for ${payload.reservation_date} at ${payload.reservation_time}. Please select another time or table.`)
    }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: payload.user_id || null,
      customer_name: payload.customer_name,
      email: payload.email || null,
      phone: payload.phone,
      reservation_date: payload.reservation_date,
      reservation_time: payload.reservation_time,
      guests: payload.guests,
      table_id: payload.table_id || null,
      table_name: payload.table_name || null,
      table_number: payload.table_number || null,
      chairs_count: payload.chairs_count || null,
      selected_chairs: payload.selected_chairs || null,
      zone: payload.zone || null,
      special_requests: payload.special_requests || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Fetch reservations for the admin dashboard.
 */
export async function getAdminReservations(): Promise<Reservation[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
  } catch (err) {
    console.warn('Failed to load admin reservations from Supabase:', err)
    return []
  }
}

/**
 * Fetch reservations for a specific user.
 */
export async function getUserReservations(userId: string): Promise<Reservation[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data
  } catch (err) {
    return []
  }
}

/**
 * Update a reservation's status in Supabase.
 */
export async function updateReservationStatus(reservationId: string, status: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)

    if (error) throw error
    return true
  } catch (err) {
    console.warn('Supabase reservation update failed:', err)
    return false
  }
}

/**
 * Fetch orders for the admin dashboard.
 */
export async function getAdminOrders(): Promise<Order[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((o: any) => ({
      ...o,
      order_items: o.order_items || [],
    }))
  } catch (err) {
    console.warn('Failed to load admin orders from Supabase:', err)
    return []
  }
}

/**
 * Fetch orders for a specific user.
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((o: any) => ({
      ...o,
      order_items: o.order_items || [],
    }))
  } catch (err) {
    return []
  }
}

/**
 * Update an order's status in Supabase.
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (err) {
    console.warn('Supabase order update failed:', err)
    return false
  }
}

/**
 * Fetch user profile from Supabase profiles table.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return null
    return data as UserProfile
  } catch (err) {
    return null
  }
}

/**
 * Update user profile in Supabase profiles table.
 */
export async function updateUserProfile(userId: string, updates: { full_name?: string; phone?: string }) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch all profiles (Admin)
 */
export async function getAllProfiles(): Promise<UserProfile[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return data as UserProfile[]
  } catch (err) {
    console.warn('Failed to load profiles:', err)
    return []
  }
}

/**
 * Update user role (Admin)
 */
export async function updateUserRole(userId: string, role: 'customer' | 'admin') {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
