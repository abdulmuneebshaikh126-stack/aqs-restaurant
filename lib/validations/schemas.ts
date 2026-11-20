import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(7, 'Valid phone required'),
  delivery_address: z.string().min(10, 'Full address required'),
  notes: z.string().optional(),
})

export const reservationSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(7, 'Valid phone required'),
  reservation_date: z.string().min(1, 'Date required'),
  reservation_time: z.string().min(1, 'Time required'),
  guests: z.number().min(1, 'At least 1 guest').max(20, 'Max 20 guests'),
  special_requests: z.string().optional(),
  table_id: z.string().optional(),
  table_name: z.string().optional(),
  chairs_count: z.number().optional(),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReservationInput = z.infer<typeof reservationSchema>

