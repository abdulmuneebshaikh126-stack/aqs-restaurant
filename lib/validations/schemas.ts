import { z } from 'zod'

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Valid phone number required'),
  email: z.string().email('Valid email address required').optional().or(z.literal('')),
  delivery_address: z.string().min(8, 'Full delivery address required'),
  notes: z.string().optional(),
})

export const reservationSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().min(7, 'Valid phone number required'),
  reservation_date: z.string().min(1, 'Reservation date is required'),
  reservation_time: z.string().min(1, 'Reservation time is required'),
  guests: z.number().min(1, 'At least 1 guest').max(20, 'Maximum 20 guests per table'),
  special_requests: z.string().optional(),
  table_id: z.string().optional(),
  table_name: z.string().optional(),
  table_number: z.number().optional(),
  chairs_count: z.number().optional(),
  selected_chairs: z.array(z.number()).optional(),
  zone: z.string().optional(),
})

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Valid phone number required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

export const dishSchema = z.object({
  name: z.string().min(2, 'Dish name is required'),
  category_name: z.string().min(1, 'Category is required'),
  price: z.number().positive('Price must be greater than 0'),
  discount_price: z.number().positive('Discount price must be greater than 0').optional().nullable(),
  description: z.string().min(5, 'Description is required'),
  image_url: z.string().url('Valid image URL required').optional().or(z.literal('')),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type ReservationInput = z.infer<typeof reservationSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type DishInput = z.infer<typeof dishSchema>
