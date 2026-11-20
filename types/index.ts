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

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered'

export interface OrderItem {
  id?: string
  item_name: string
  item_price: number
  quantity: number
}

export interface Order {
  id: string
  user_id: string | null
  customer_name: string
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

export interface Reservation {
  id: string
  user_id: string | null
  customer_name: string
  phone: string
  reservation_date: string
  reservation_time: string
  guests: number
  special_requests: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  table_id?: string
  table_name?: string
  chairs_count?: number
  selected_chairs?: number[]
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

