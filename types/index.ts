export interface Category {
  id: string
  name: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface MenuItem {
  id: string
  category_id: string | null
  category_name?: string | null
  name: string
  description: string | null
  price: number
  discount_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  category?: Category
  created_at?: string
  updated_at?: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export interface OrderItem {
  id?: string
  order_id?: string
  menu_item_id?: string | null
  item_name: string
  item_price: number
  quantity: number
  created_at?: string
}

export interface Order {
  id: string
  order_number?: string
  user_id: string | null
  customer_name: string
  email?: string | null
  phone: string
  delivery_address: string
  notes: string | null
  payment_method: string
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  created_at: string
  updated_at?: string
  order_items: OrderItem[]
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'seated'

export interface Reservation {
  id: string
  user_id: string | null
  customer_name: string
  email?: string | null
  phone: string
  reservation_date: string
  reservation_time: string
  guests: number
  special_requests: string | null
  status: ReservationStatus
  created_at: string
  table_id?: string
  table_name?: string
  table_number?: number
  chairs_count?: number
  selected_chairs?: number[]
  zone?: string
}

export interface RestaurantTable {
  id: string
  number: number
  name: string
  zone: 'Main Dining' | 'Window Terrace' | 'VIP Lounge' | "Chef's Garden"
  capacity: number // number of chairs
  shape: 'circle' | 'rectangle' | 'booth'
  status: 'available' | 'reserved' | 'occupied'
  priceTier?: 'standard' | 'premium' | 'vip'
  features?: string[]
}

export interface UserProfile {
  id: string
  full_name: string | null
  phone: string | null
  email?: string | null
  role: 'customer' | 'admin'
  created_at?: string
  updated_at?: string
}

