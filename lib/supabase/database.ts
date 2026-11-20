import { createClient } from './client'
import { MenuItem, Order, Reservation, CartItem } from '@/types'

// UUID regex validator to avoid Postgres UUID cast errors
const isValidUUID = (id: any): boolean =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

/**
 * Fetch all available menu items from Supabase.
 */
export async function getMenuItems(): Promise<(MenuItem & { categoryName: string })[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, category:categories(name)')
      .eq('is_available', true)
      .order('created_at', { ascending: true })

    if (error || !data || data.length === 0) {
      return []
    }

    return data.map((item: any) => ({
      id: item.id,
      category_id: item.category_id,
      categoryName: item.category?.name || item.category_name || 'All',
      name: item.name,
      description: item.description,
      price: Number(item.price),
      discount_price: item.discount_price ? Number(item.discount_price) : null,
      image_url: item.image_url,
      is_available: item.is_available ?? true,
      is_featured: item.is_featured ?? false,
      created_at: item.created_at,
    }))
  } catch (err) {
    console.warn('Failed to load menu from Supabase, using fallback:', err)
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
 * Create a new table reservation / booking in Supabase.
 */
export async function submitReservation(payload: {
  customer_name: string
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
}) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('reservations')
    .insert({
      customer_name: payload.customer_name,
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
