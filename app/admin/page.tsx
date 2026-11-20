'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarCheck,
  UtensilsCrossed,
  BarChart3,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  ChefHat,
  Users,
  Eye,
  Crown,
  Trash2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Bell,
  Menu as MenuIcon,
  X,
  SlidersHorizontal,
} from 'lucide-react'
import { MenuItem, Order, Reservation, RestaurantTable } from '@/types'
import { RESTAURANT_TABLES } from '@/components/reservations/TableFloorPlan'
import ChairVisualizer from '@/components/reservations/ChairVisualizer'
import { toast } from 'sonner'
import { showConfirmAlert } from '@/lib/utils/sweetalert'
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/hooks/queries/useOrdersQuery'
import {
  useAdminReservationsQuery,
  useUpdateReservationStatusMutation,
} from '@/hooks/queries/useReservationsQuery'
import {
  useCreateDishMutation,
  useDeleteDishMutation,
} from '@/hooks/queries/useMenuQuery'
import { Loader2 } from 'lucide-react'

// Default seed orders if none in localStorage
const DEFAULT_SEED_ORDERS = [
  {
    id: 'aqs-ord-901',
    customer_name: 'Sophia Montgomery',
    phone: '+92 301 9876543',
    delivery_address: 'Penthouse 14, Royal Palm Residences',
    payment_method: 'cash_on_delivery',
    notes: 'Extra truffle shavings please, doorbell is ringing.',
    subtotal: 51.0,
    delivery_fee: 5.0,
    total: 56.0,
    status: 'preparing' as const,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    order_items: [
      { item_name: 'Flame-Seared Prime Ribeye Steak', item_price: 34.0, quantity: 1 },
      { item_name: 'Handcrafted Truffle Fettuccine Alfredo', item_price: 17.0, quantity: 1 },
    ],
  },
  {
    id: 'aqs-ord-902',
    customer_name: 'Hamza Tariq',
    phone: '+92 321 4455667',
    delivery_address: 'House 42, Sector F-7/2, Islamabad',
    payment_method: 'cash_on_delivery',
    notes: 'Please bring hot and pack cutlery.',
    subtotal: 35.49,
    delivery_fee: 5.0,
    total: 40.49,
    status: 'pending' as const,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    order_items: [
      { item_name: 'Artisan Truffle & Wild Mushroom Pizza', item_price: 18.5, quantity: 1 },
      { item_name: 'Prime Wagyu Brioche Burger', item_price: 16.99, quantity: 1 },
    ],
  },
  {
    id: 'aqs-ord-903',
    customer_name: 'Dr. Zeeshan Ali',
    phone: '+92 333 1122334',
    delivery_address: 'Villa 108, Lake City Phase 2',
    payment_method: 'cash_on_delivery',
    notes: 'Leave at guard room if busy.',
    subtotal: 62.0,
    delivery_fee: 5.0,
    total: 67.0,
    status: 'ready' as const,
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    order_items: [
      { item_name: 'Slow-Smoked Sticky Glazed Ribs', item_price: 24.5, quantity: 2 },
      { item_name: 'Golden Passionfruit & Mint Mojito', item_price: 6.5, quantity: 2 },
    ],
  },
  {
    id: 'aqs-ord-904',
    customer_name: 'Elena Rostova',
    phone: '+92 345 9988776',
    delivery_address: 'Suite 302, Diplomatic Enclave',
    payment_method: 'cash_on_delivery',
    notes: 'Birthday dessert packaging.',
    subtotal: 48.0,
    delivery_fee: 5.0,
    total: 53.0,
    status: 'delivered' as const,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    order_items: [
      { item_name: 'Pan-Seared Wild Atlantic Salmon', item_price: 22.0, quantity: 1 },
      { item_name: 'Burrata & Heirloom Caesar Salad', item_price: 13.5, quantity: 1 },
      { item_name: 'Molten Valrhona Lava Cake', item_price: 9.5, quantity: 1 },
    ],
  },
]

// Default seed reservations with Table and Chairs details
const DEFAULT_SEED_RESERVATIONS = [
  {
    id: 'res-seed-1',
    customer_name: 'Ahmad & Maryam Khan',
    phone: '+92 300 8877665',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '08:00 PM',
    guests: 2,
    table_id: 'tbl-1',
    table_name: 'Sunset Romantic Alcove',
    table_number: 1,
    chairs_count: 2,
    selected_chairs: [1, 2],
    zone: 'Window Terrace',
    status: 'approved' as const,
    special_requests: 'Anniversary celebration. Window sunset view preferred.',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 'res-seed-2',
    customer_name: 'Malik Faisal & Associates',
    phone: '+92 312 3344556',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '08:30 PM',
    guests: 6,
    table_id: 'tbl-8',
    table_name: 'Royal Velvet VIP Booth',
    table_number: 8,
    chairs_count: 6,
    selected_chairs: [1, 2, 3, 4, 5, 6],
    zone: 'VIP Lounge',
    status: 'pending' as const,
    special_requests: 'Corporate dinner, quiet corner required.',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'res-seed-3',
    customer_name: 'Zainab & Family',
    phone: '+92 334 7766554',
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_time: '09:00 PM',
    guests: 4,
    table_id: 'tbl-4',
    table_name: 'Chandelier Center Table',
    table_number: 4,
    chairs_count: 4,
    selected_chairs: [1, 2, 3, 4],
    zone: 'Main Dining',
    status: 'approved' as const,
    special_requests: 'High chair needed for infant if possible.',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
]

// Default Menu items
const DEFAULT_MENU_ITEMS: (MenuItem & { in_stock: boolean })[] = [
  {
    id: '1',
    category_id: null,
    name: 'Artisan Truffle & Wild Mushroom Pizza',
    description: 'Wood-fired sourdough crust, fior di latte, black truffle shavings, porcini mushrooms, fresh thyme',
    price: 18.5,
    discount_price: 15.99,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    is_available: true,
    is_featured: true,
    in_stock: true,
  },
  {
    id: '2',
    category_id: null,
    name: 'Prime Wagyu Brioche Burger',
    description: 'Double Wagyu beef smashed patties, smoked gouda, caramelized shallot relish, truffle aioli on toasted brioche',
    price: 16.99,
    discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    is_available: true,
    is_featured: true,
    in_stock: true,
  },
  {
    id: '3',
    category_id: null,
    name: 'Handcrafted Truffle Fettuccine Alfredo',
    description: 'House-made egg pasta ribbons tossed in aged Parmigiano Reggiano, brown butter, garlic cream & herbs',
    price: 17.0,
    discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    is_available: true,
    is_featured: false,
    in_stock: true,
  },
  {
    id: '4',
    category_id: null,
    name: 'Flame-Seared Prime Ribeye Steak',
    description: 'Flame-grilled 10oz prime ribeye, bone marrow herb butter, roasted garlic head, red wine demi-glace',
    price: 34.0,
    discount_price: 29.5,
    image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
    is_available: true,
    is_featured: true,
    in_stock: true,
  },
  {
    id: '5',
    category_id: null,
    name: 'Molten Valrhona Lava Cake',
    description: 'Warm decadent dark chocolate cake with flowing molten core, Madagascar bourbon vanilla bean gelato',
    price: 9.5,
    discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    is_available: true,
    is_featured: true,
    in_stock: true,
  },
]

type AdminTab = 'dashboard' | 'orders' | 'reservations' | 'menu' | 'analytics'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [orders, setOrders] = useState<any[]>(DEFAULT_SEED_ORDERS)
  const [reservations, setReservations] = useState<any[]>(DEFAULT_SEED_RESERVATIONS)
  const [menuItems, setMenuItems] = useState<any[]>(DEFAULT_MENU_ITEMS)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  const [showAddDishModal, setShowAddDishModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('')
  const [newDishCategory, setNewDishCategory] = useState('Steaks & Grills')
  const [newDishPrice, setNewDishPrice] = useState('')
  const [newDishDesc, setNewDishDesc] = useState('')
  const [newDishImage, setNewDishImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80')

  // TanStack Query & Mutations
  const { data: dbOrders, isLoading: ordersLoading } = useAdminOrdersQuery()
  const { data: dbRes, isLoading: resLoading } = useAdminReservationsQuery()
  const updateOrderStatusMutation = useUpdateOrderStatusMutation()
  const updateReservationStatusMutation = useUpdateReservationStatusMutation()
  const createDishMutation = useCreateDishMutation()
  const deleteDishMutation = useDeleteDishMutation()

  // Sync state when query data updates
  useEffect(() => {
    if (dbOrders && dbOrders.length > 0) {
      setOrders(dbOrders)
    }
  }, [dbOrders])

  useEffect(() => {
    if (dbRes && dbRes.length > 0) {
      setReservations(dbRes)
    }
  }, [dbRes])

  // Order status update handler
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status'] | 'cancelled') => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    setOrders(updated)
    updateOrderStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order #${orderId.slice(0, 8)} updated to ${newStatus}`)
        },
        onError: (err) => {
          toast.error('Order status update notice', { description: err.message })
        },
      }
    )
  }

  // Reservation status update handler
  const handleUpdateReservationStatus = (resId: string, newStatus: 'approved' | 'rejected' | 'seated') => {
    const updated = reservations.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
    setReservations(updated)
    updateReservationStatusMutation.mutate(
      { resId, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Reservation #${resId.slice(0, 8)} marked as ${newStatus}`)
        },
        onError: (err) => {
          toast.error('Reservation update notice', { description: err.message })
        },
      }
    )
  }

  // Automatic synchronization with Chatbot Knowledge Base
  const syncWithChatbotKB = async (items: any[]) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', menuItems: items }),
      })
    } catch (e) {
      console.warn('Auto-sync chatbot warning:', e)
    }
  }

  // Toggle dish stock
  const handleToggleStock = (dishId: string) => {
    const updated = menuItems.map((m) =>
      m.id === dishId ? { ...m, in_stock: !m.in_stock, is_available: !m.is_available } : m
    )
    setMenuItems(updated)
    syncWithChatbotKB(updated)
    toast.info('Menu item availability updated')
  }

  // Delete dish with SweetAlert2 confirmation
  const handleDeleteDish = async (dishId: string) => {
    const confirmed = await showConfirmAlert(
      'Remove Dish?',
      'Are you sure you want to remove this dish from the menu?'
    )
    if (!confirmed) return

    deleteDishMutation.mutate(dishId, {
      onSuccess: () => {
        const updated = menuItems.filter((m) => m.id !== dishId)
        setMenuItems(updated)
        syncWithChatbotKB(updated)
        toast.success('Dish removed from menu')
      },
      onError: (err) => {
        toast.error('Failed to remove dish', { description: err.message })
      },
    })
  }

  // Add new dish with Supabase Mutation
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDishName || !newDishPrice) return

    const price = parseFloat(newDishPrice) || 12.0

    createDishMutation.mutate(
      {
        name: newDishName,
        category_name: newDishCategory,
        price,
        description: newDishDesc,
        image_url: newDishImage,
        is_available: true,
        is_featured: false,
      },
      {
        onSuccess: (newItem: any) => {
          const item = {
            id: newItem?.id || `dish-${Date.now().toString(36)}`,
            category_id: null,
            name: newDishName,
            description: newDishDesc,
            price,
            discount_price: null,
            image_url: newDishImage,
            is_available: true,
            is_featured: false,
            in_stock: true,
          }
          const updated = [item, ...menuItems]
          setMenuItems(updated)
          syncWithChatbotKB(updated)
          setNewDishName('')
          setNewDishPrice('')
          setNewDishDesc('')
          setShowAddDishModal(false)
          toast.success('New Dish Added!', {
            description: `${newDishName} added to menu & database.`,
          })
        },
        onError: (err) => {
          toast.error('Failed to add dish', { description: err.message })
        },
      }
    )
  }

  // Calculate Key KPI Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const activeOrdersCount = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length
  const bookedTablesCount = reservations.filter((r) => r.status === 'approved' || r.status === 'pending').length
  const totalChairsReserved = reservations
    .filter((r) => r.status === 'approved' || r.status === 'pending')
    .reduce((sum, r) => sum + (r.chairs_count || r.guests || 2), 0)

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter
    const matchesSearch =
      !searchQuery ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.includes(searchQuery) ||
      o.id?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-200">
      {/* Top Luxury Admin Header */}
      <header className="sticky top-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-primary/20 shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-primary/40 shadow-lg">
              <Image
                src="/images/logo.jpg"
                alt="AQS Admin"
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-wider gold-gradient-text">
                  AQS
                </span>
                <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-amber-300">
                  Manager Portal
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-medium -mt-0.5">
                Kitchen & Floor Command
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Time */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-[#141418] border border-white/10 px-4 py-1.5 text-xs text-gray-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System Online</span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
            >
              <span>View Restaurant</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation for Desktop */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 hidden md:flex items-center gap-2 border-t border-white/5 pt-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: activeOrdersCount },
            { id: 'reservations', label: 'Tables & Chairs', icon: CalendarCheck, badge: bookedTablesCount },
            { id: 'menu', label: 'Menu Manager', icon: UtensilsCrossed },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`relative flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-primary text-black' : 'bg-[#1e1e24] text-white border border-white/10'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="adminActiveTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 gold-gradient-bg shadow-sm"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-primary/20 bg-[#121214] px-4 py-3 space-y-1"
            >
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: activeOrdersCount },
                { id: 'reservations', label: 'Tables & Chairs', icon: CalendarCheck, badge: bookedTablesCount },
                { id: 'menu', label: 'Menu Manager', icon: UtensilsCrossed },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as AdminTab)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs uppercase tracking-wider font-semibold transition ${
                      isActive
                        ? 'gold-gradient-bg text-black shadow font-bold'
                        : 'text-gray-300 hover:bg-[#1a1a20]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Admin Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Top 4 KPI Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric 1 */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Today&apos;s Revenue
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold gold-gradient-text">
                  ${totalRevenue.toFixed(2)}
                </div>
                <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="h-3 w-3" /> +18.4% vs yesterday
                </p>
              </div>

              {/* Metric 2 */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Active Kitchen Orders
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <ChefHat className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-white">
                  {activeOrdersCount}
                </div>
                <p className="mt-1 text-xs text-amber-300 font-medium">
                  {orders.filter((o) => o.status === 'pending').length} pending dispatch
                </p>
              </div>

              {/* Metric 3 */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Booked Tables & Chairs
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-white">
                  {bookedTablesCount} <span className="text-sm font-sans text-gray-400 font-normal">/ 12 Tables</span>
                </div>
                <p className="mt-1 text-xs text-[#E5C158] font-medium">
                  {totalChairsReserved} Chairs Allocated Today
                </p>
              </div>

              {/* Metric 4 */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Average Order Value
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-white">
                  ${orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Across {orders.length} total orders
                </p>
              </div>
            </div>

            {/* Live Queue Previews: Orders & Tables */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Orders List Preview */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="font-serif text-lg font-bold text-white">Recent Orders</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs uppercase tracking-wider text-primary hover:underline font-semibold"
                  >
                    View All ({orders.length})
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {orders.slice(0, 4).map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-center justify-between rounded-xl bg-[#0c0c0e] border border-white/5 p-4 hover:border-primary/40 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-white">{ord.customer_name}</span>
                          <span className="font-mono text-[10px] text-gray-500">#{ord.id.slice(0, 10)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ord.order_items?.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold gold-gradient-text text-sm">
                          ${(ord.total || 0).toFixed(2)}
                        </span>
                        <div>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : ord.status === 'ready'
                                ? 'bg-cyan-500/10 text-cyan-400'
                                : ord.status === 'preparing'
                                ? 'bg-amber-500/10 text-amber-300'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Table Reservations Preview with Chairs */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-serif text-lg font-bold text-white">Table & Chair Bookings</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="text-xs uppercase tracking-wider text-primary hover:underline font-semibold"
                  >
                    Floor Plan ({reservations.length})
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {reservations.slice(0, 4).map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between rounded-xl bg-[#0c0c0e] border border-white/5 p-4 hover:border-primary/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gold-gradient-bg text-black font-serif font-bold text-sm shadow">
                          T-{res.table_number || 1}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-white">{res.customer_name}</div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {res.reservation_time} • {res.zone || 'Main Dining'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="rounded-lg bg-primary/10 border border-primary/30 px-2 py-0.5 text-center">
                          <span className="text-[10px] uppercase font-bold text-[#E5C158]">
                            {res.chairs_count || res.guests || 2} Chairs
                          </span>
                        </div>
                        <span
                          className={`mt-1 inline-block text-[10px] font-semibold uppercase ${
                            res.status === 'approved'
                              ? 'text-emerald-400'
                              : res.status === 'seated'
                              ? 'text-cyan-400'
                              : 'text-amber-300'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE ORDERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: 'All Orders', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Preparing', value: 'preparing' },
                  { label: 'Ready', value: 'ready' },
                  { label: 'Delivered', value: 'delivered' },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setOrderStatusFilter(f.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      orderStatusFilter === f.value
                        ? 'gold-gradient-bg text-black shadow font-bold'
                        : 'bg-[#141418] border border-primary/20 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search customer, phone, order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full bg-[#141418] border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none w-full md:w-72"
                />
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl bg-[#141418] border border-primary/20 p-12 text-center text-gray-400">
                  No orders matching criteria.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <motion.div
                    key={ord.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg space-y-4 hover:border-primary/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-white">
                            {ord.customer_name}
                          </h4>
                          <span className="font-mono text-xs text-gray-500">#{ord.id}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Phone: <span className="text-white">{ord.phone}</span> • Address: {ord.delivery_address}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : ord.status === 'ready'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : ord.status === 'preparing'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          Status: {ord.status}
                        </span>
                        <span className="font-serif text-xl font-bold gold-gradient-text">
                          ${(ord.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="rounded-xl bg-[#0c0c0e] border border-white/5 p-4 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                        Kitchen Items
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {ord.order_items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs text-gray-300">
                            <span>
                              <span className="font-bold text-primary">{item.quantity}x</span> {item.item_name}
                            </span>
                            <span className="text-gray-400">${((item.item_price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {ord.notes && (
                        <p className="mt-2 text-xs italic text-amber-200/80 border-t border-white/5 pt-2">
                          Note: &ldquo;{ord.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Interactive Status Changer Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-xs text-gray-400">
                        Placed on {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {ord.status !== 'preparing' && ord.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'preparing')}
                            className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/40 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500 hover:text-black transition"
                          >
                            <ChefHat className="h-3.5 w-3.5" /> Start Preparing
                          </button>
                        )}
                        {ord.status !== 'ready' && ord.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'ready')}
                            className="flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/40 px-3.5 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                          >
                            <Bell className="h-3.5 w-3.5" /> Mark Ready
                          </button>
                        )}
                        {ord.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'delivered')}
                            className="flex items-center gap-1 rounded-full gold-gradient-bg px-4 py-1.5 text-xs font-bold text-black shadow transition hover:opacity-90"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Delivered
                          </button>
                        )}
                        {ord.status !== 'cancelled' && ord.status !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'cancelled')}
                            className="text-xs text-red-400 hover:text-red-300 px-2"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TABLES & RESERVATIONS (WITH CHAIRS VISUALIZATION) */}
        {/* ========================================================================= */}
        {activeTab === 'reservations' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Live Seating Stats Bar */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Total Floor Capacity
                </span>
                <div className="font-serif text-2xl font-bold gold-gradient-text mt-1">
                  12 Tables • 56 Chairs
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Across 4 fine-dining zones</p>
              </div>

              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Today&apos;s Booked Chairs
                </span>
                <div className="font-serif text-2xl font-bold text-white mt-1">
                  {totalChairsReserved} Chairs Occupied
                </div>
                <p className="text-xs text-emerald-400 mt-0.5">
                  {Math.round((totalChairsReserved / 56) * 100)}% Floor Occupancy
                </p>
              </div>

              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Pending Approval
                </span>
                <div className="font-serif text-2xl font-bold text-amber-300 mt-1">
                  {reservations.filter((r) => r.status === 'pending').length} Requests
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Awaiting manager confirmation</p>
              </div>
            </div>

            {/* Reservations List with Table & Chair Details */}
            <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    Guest Table & Chairs Reservations
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Live bookings showing assigned table and exact chairs reserved.
                  </p>
                </div>
                <Link
                  href="/reservations"
                  className="rounded-full gold-gradient-bg px-4 py-2 text-xs font-bold text-black shadow transition hover:opacity-90 flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Book Table as Guest
                </Link>
              </div>

              <div className="space-y-4">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="rounded-xl bg-[#0c0c0e] border border-white/5 p-5 space-y-3 hover:border-primary/40 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-gradient-bg text-black font-serif font-bold text-base shadow">
                          T-{res.table_number || 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-white text-base">
                              {res.customer_name}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider ${
                                res.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : res.status === 'seated'
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Phone: <span className="text-white">{res.phone}</span> • Date: {res.reservation_date} at {res.reservation_time}
                          </p>
                        </div>
                      </div>

                      {/* Chairs Allocation Pill */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-xl bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-center">
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">
                            Chairs Reserved
                          </span>
                          <span className="font-serif text-sm font-bold text-[#E5C158]">
                            {res.chairs_count || res.guests || 2} Chairs (Seats #{res.selected_chairs?.join(', #') || '1, 2'})
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {res.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'approved')}
                              className="rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-black transition"
                            >
                              Approve
                            </button>
                          )}
                          {res.status !== 'seated' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'seated')}
                              className="rounded-full bg-cyan-500/10 border border-cyan-500/40 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500 hover:text-black transition"
                            >
                              Seat Guests
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'rejected')}
                            className="rounded-full border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500 hover:text-white transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                    {res.special_requests && (
                      <p className="text-xs text-gray-400 border-t border-white/5 pt-2">
                        <span className="text-[#C5A059] font-medium">Special Request:</span> &ldquo;{res.special_requests}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Floor Plan Overview of All Tables */}
            <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-white">
                Floor Plan Live Tables Status
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {RESTAURANT_TABLES.map((tbl) => (
                  <div
                    key={tbl.id}
                    className="rounded-xl bg-[#0c0c0e] border border-white/5 p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-white">Table {tbl.number}</span>
                      <span className="rounded-full bg-primary/10 text-[#C5A059] px-2 py-0.5 text-[10px] font-bold">
                        {tbl.capacity} Chairs
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{tbl.name}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] text-gray-500">
                      <span>{tbl.zone}</span>
                      <span className={tbl.status === 'reserved' ? 'text-red-400' : 'text-emerald-400'}>
                        {tbl.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MENU MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-white">
                  Menu Items Catalog
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage dishes, pricing, inventory availability, and culinary specials.
                </p>
              </div>

              <button
                onClick={() => setShowAddDishModal(true)}
                className="flex items-center gap-1.5 rounded-full gold-gradient-bg px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Add New Dish
              </button>
            </div>

            {/* Menu Items Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="overflow-hidden rounded-2xl bg-[#141418] border border-primary/20 shadow-lg flex flex-col justify-between group"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[#0c0c0e]">
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          dish.in_stock
                            ? 'bg-emerald-500 text-black'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {dish.in_stock ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-white">
                        {dish.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-400 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="font-serif text-lg font-bold gold-gradient-text">
                        ${dish.price.toFixed(2)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStock(dish.id)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            dish.in_stock
                              ? 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                              : 'gold-gradient-bg text-black'
                          }`}
                        >
                          {dish.in_stock ? 'Mark Sold Out' : 'Restore Stock'}
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Dish Modal */}
            <AnimatePresence>
              {showAddDishModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg rounded-2xl bg-[#141418] border border-primary/40 p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-serif text-xl font-bold text-white">Add New Dish</h3>
                      <button
                        onClick={() => setShowAddDishModal(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddDish} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                          Dish Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newDishName}
                          onChange={(e) => setNewDishName(e.target.value)}
                          placeholder="e.g. Saffron Garlic Lobster Tail"
                          className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                            Category
                          </label>
                          <select
                            value={newDishCategory}
                            onChange={(e) => setNewDishCategory(e.target.value)}
                            className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-3 py-2.5 text-xs text-white focus:border-primary focus:outline-none"
                          >
                            <option>Steaks & Grills</option>
                            <option>Pizza</option>
                            <option>Burgers</option>
                            <option>Pasta</option>
                            <option>Desserts</option>
                            <option>Drinks</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newDishPrice}
                            onChange={(e) => setNewDishPrice(e.target.value)}
                            placeholder="24.50"
                            className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={newDishImage}
                          onChange={(e) => setNewDishImage(e.target.value)}
                          className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={newDishDesc}
                          onChange={(e) => setNewDishDesc(e.target.value)}
                          placeholder="Ingredients, flavors, artisan preparation details..."
                          className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddDishModal(false)}
                          className="rounded-full border border-white/20 px-5 py-2 text-xs font-medium text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createDishMutation.isPending}
                          className="rounded-full gold-gradient-bg px-6 py-2 text-xs font-bold uppercase tracking-wider text-black shadow hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {createDishMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            'Save Dish'
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ANALYTICS & REPORTS */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl font-bold text-white">
                Performance Analytics & Dining Insights
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Key trends, category revenues, and peak reservation hours.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Category Sales Share */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg space-y-4">
                <h4 className="font-serif text-lg font-bold text-white">
                  Revenue by Category
                </h4>
                <div className="space-y-3">
                  {[
                    { cat: 'Steaks & Flame Grills', percent: 38, amount: '$1,081.20' },
                    { cat: 'Woodfired Artisan Pizza', percent: 26, amount: '$739.80' },
                    { cat: 'Prime Wagyu Burgers', percent: 18, amount: '$512.10' },
                    { cat: 'Handcrafted Pasta', percent: 11, amount: '$313.00' },
                    { cat: 'Desserts & Beverages', percent: 7, amount: '$199.40' },
                  ].map((c) => (
                    <div key={c.cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 font-medium">{c.cat}</span>
                        <span className="text-primary font-bold">{c.amount} ({c.percent}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#0c0c0e] overflow-hidden">
                        <div
                          className="h-full gold-gradient-bg rounded-full transition-all duration-700"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Dining Hours */}
              <div className="rounded-2xl bg-[#141418] border border-primary/20 p-6 shadow-lg space-y-4">
                <h4 className="font-serif text-lg font-bold text-white">
                  Peak Dining & Reservation Hours
                </h4>
                <div className="space-y-3">
                  {[
                    { time: '07:30 PM – 08:30 PM (Dinner Rush)', load: 95 },
                    { time: '08:30 PM – 09:30 PM (Late Dinner)', load: 85 },
                    { time: '01:00 PM – 02:00 PM (Lunch Hour)', load: 60 },
                    { time: '06:30 PM – 07:30 PM (Early Evening)', load: 50 },
                    { time: '09:30 PM – 11:00 PM (Lounge Cocktails)', load: 45 },
                  ].map((h) => (
                    <div key={h.time} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">{h.time}</span>
                        <span className="text-amber-300 font-semibold">{h.load}% Capacity</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#0c0c0e] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-700"
                          style={{ width: `${h.load}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
