import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = decodeURIComponent(params.id || '').trim()
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      isAdmin = profile?.role === 'admin'
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .maybeSingle()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Protect customer's private order info if order belongs to a registered user
    if (order.user_id && (!user || (user.id !== order.user_id && !isAdmin))) {
      return NextResponse.json(
        { error: 'Please sign in with the account that placed this order.' },
        { status: 403 }
      )
    }

    // For guest orders (no user_id), mask sensitive personal details unless admin
    if (!order.user_id && !isAdmin) {
      return NextResponse.json({
        order: {
          ...order,
          phone: order.phone ? `***-***-${String(order.phone).slice(-4)}` : '',
          email: null,
          delivery_address: 'Protected for guest privacy',
        },
      })
    }

    return NextResponse.json({ order })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
