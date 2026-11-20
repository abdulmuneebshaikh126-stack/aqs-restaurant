'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutSchema, CheckoutInput } from '@/lib/validations/schemas'
import { useCart } from '@/hooks/useCart'
import { useCreateOrderMutation } from '@/hooks/queries/useOrdersQuery'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, deliveryFee, total, clearCart } = useCart()
  const createOrderMutation = useCreateOrderMutation()

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  })

  const onSubmit = async (data: CheckoutInput) => {
    if (items.length === 0) return

    try {
      const order = await createOrderMutation.mutateAsync({
        ...data,
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
        description: `Order #${order.id.slice(0, 8)} has been sent to our kitchen.`,
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
        <h1 className="font-serif text-3xl font-bold text-white">Your Cart is Empty</h1>
        <p className="mt-2 text-gray-400">Please add items to your cart before proceeding to checkout.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          Finalize Order
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-white md:text-4xl">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 space-y-4">
          <h2 className="font-serif text-xl font-semibold text-white border-b border-white/10 pb-3">
            Delivery Details
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Full Name</label>
            <input
              {...register('customer_name')}
              placeholder="e.g. John Doe"
              className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
            />
            {errors.customer_name && <p className="mt-1 text-sm text-red-400">{errors.customer_name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Phone Number</label>
            <input
              {...register('phone')}
              placeholder="e.g. +92 300 1234567"
              className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Delivery Address</label>
            <textarea
              {...register('delivery_address')}
              rows={3}
              placeholder="Full street address, apartment / floor details"
              className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
            />
            {errors.delivery_address && <p className="mt-1 text-sm text-red-400">{errors.delivery_address.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Order Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Special delivery instructions or spice level preferences"
              className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6">
          <h2 className="font-serif text-xl font-semibold text-white border-b border-white/10 pb-3">
            Payment Method
          </h2>
          <div className="mt-3 flex items-center justify-between text-gray-300">
            <span>Payment Mode</span>
            <span className="font-semibold text-[#E5C158]">Cash on Delivery</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Subtotal</span>
            <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>Delivery</span>
            <span className="font-medium text-white">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-xl font-bold">
            <span className="font-serif text-white">Total</span>
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
