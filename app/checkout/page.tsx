'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, CheckoutInput } from '@/lib/validations/schemas'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/lib/auth/AuthContext'
import { useCreateOrderMutation } from '@/hooks/queries/useOrdersQuery'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, deliveryFee, total, clearCart } = useCart()
  const { user, profile } = useAuth()
  const createOrderMutation = useCreateOrderMutation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: '',
      phone: '',
      email: '',
      delivery_address: '',
      notes: '',
    },
  })

  // Auto-fill logged-in user credentials
  useEffect(() => {
    if (profile?.full_name) setValue('customer_name', profile.full_name)
    if (profile?.phone) setValue('phone', profile.phone)
    if (user?.email) setValue('email', user.email)
  }, [profile, user, setValue])

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) return

    try {
      const order = await createOrderMutation.mutateAsync({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || user?.email || null,
        delivery_address: data.delivery_address,
        notes: data.notes || null,
        items: items.map((i) => ({
          menu_item_id: i.id,
          item_name: i.name,
          item_price: i.discount_price ?? i.price,
          quantity: i.quantity,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total,
      })

      // Save to localStorage for instant local viewing
      try {
        const orderRecord = {
          ...order,
          order_items: items.map((i) => ({
            item_name: i.name,
            item_price: i.discount_price ?? i.price,
            quantity: i.quantity,
          })),
        }
        const existing = JSON.parse(localStorage.getItem('aqs_orders_data') || '[]')
        localStorage.setItem('aqs_orders_data', JSON.stringify([orderRecord, ...existing]))
      } catch (storageErr) {}

      toast.success('Order Placed Successfully!', {
        description: `Order #${order.order_number || order.id.slice(0, 8)} has been dispatched to our kitchen.`,
      })

      clearCart()
      router.push(`/orders/${order.id}`)
    } catch (e: any) {
      toast.error('Order Submission Failed', {
        description: e.message || 'Please check your connection and try again.',
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-[var(--foreground)]">Your Cart is Empty</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">Please add items to your cart before proceeding to checkout.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          Finalize Order
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 space-y-4">
          <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
            Delivery Details
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">Full Name</label>
            <input
              {...register('customer_name')}
              placeholder="e.g. Alexander Vance"
              className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
            />
            {errors.customer_name && <p className="mt-1 text-sm text-red-400">{errors.customer_name.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">Phone Number</label>
              <input
                {...register('phone')}
                placeholder="e.g. +92 300 1234567"
                className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">Email Address (optional)</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">Delivery Address</label>
            <textarea
              {...register('delivery_address')}
              rows={3}
              placeholder="Full street address, apartment / villa / suite details"
              className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
            />
            {errors.delivery_address && <p className="mt-1 text-sm text-red-400">{errors.delivery_address.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--muted)]">Order Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Special delivery instructions or dining preferences"
              className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition text-sm"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6">
          <h2 className="font-serif text-xl font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-3">
            Payment Method
          </h2>
          <div className="mt-3 flex items-center justify-between text-[var(--muted)]">
            <span>Payment Mode</span>
            <span className="font-semibold text-[#E5C158]">Cash on Delivery</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 space-y-3">
          <div className="flex justify-between text-sm text-[var(--muted)]">
            <span>Subtotal</span>
            <span className="font-medium text-[var(--foreground)]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--muted)]">
            <span>Delivery</span>
            <span className="font-medium text-[var(--foreground)]">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-3 text-xl font-bold">
            <span className="font-serif text-[var(--foreground)]">Total</span>
            <span className="gold-gradient-text">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={createOrderMutation.isPending}
          className="w-full rounded-full gold-gradient-bg py-4 text-base font-semibold text-black shadow-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Placing Order with Kitchen...</span>
            </>
          ) : (
            'Confirm & Place Order'
          )}
        </button>
      </form>
    </div>
  )
}
