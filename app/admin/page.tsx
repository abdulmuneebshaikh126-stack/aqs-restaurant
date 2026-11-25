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
  Edit2,
  ShieldAlert,
  ShieldCheck,
  Check,
} from 'lucide-react'
import { MenuItem, Order, Reservation, RestaurantTable, UserProfile } from '@/types'
import { RESTAURANT_TABLES } from '@/components/reservations/TableFloorPlan'
import ChairVisualizer from '@/components/reservations/ChairVisualizer'
import { toast } from 'sonner'
import { showConfirmAlert } from '@/lib/utils/sweetalert'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  useAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/hooks/queries/useOrdersQuery'
import {
  useAdminReservationsQuery,
  useUpdateReservationStatusMutation,
} from '@/hooks/queries/useReservationsQuery'
import {
  useMenuItemsQuery,
  useCreateDishMutation,
  useUpdateDishMutation,
  useDeleteDishMutation,
  useToggleDishAvailabilityMutation,
} from '@/hooks/queries/useMenuQuery'
import { getAllProfiles, updateUserRole } from '@/lib/supabase/database'
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
const DEFAULT_MENU_ITEMS: (MenuItem & { categoryName: string; in_stock: boolean })[] = [
  {
    id: '1',
    category_id: null,
    categoryName: 'Pizza',
    category_name: 'Pizza',
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
    categoryName: 'Burgers',
    category_name: 'Burgers',
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
    categoryName: 'Pasta',
    category_name: 'Pasta',
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
    categoryName: 'Steaks & Grills',
    category_name: 'Steaks & Grills',
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
    categoryName: 'Desserts',
    category_name: 'Desserts',
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

type AdminTab = 'dashboard' | 'orders' | 'reservations' | 'menu' | 'customers' | 'analytics'

export default function AdminPage() {
  const { user, profile, isAdmin, loading: authLoading, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [orders, setOrders] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>(DEFAULT_MENU_ITEMS)
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  const [showAddDishModal, setShowAddDishModal] = useState(false)
  const [editingDish, setEditingDish] = useState<any | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // New Dish Form State
  const [newDishName, setNewDishName] = useState('')
  const [newDishCategory, setNewDishCategory] = useState('Steaks & Grills')
  const [newDishPrice, setNewDishPrice] = useState('')
  const [newDishDiscountPrice, setNewDishDiscountPrice] = useState('')
  const [newDishDesc, setNewDishDesc] = useState('')
  const [newDishImage, setNewDishImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80')

  // TanStack Query & Mutations
  const { data: dbOrders, isLoading: ordersLoading } = useAdminOrdersQuery()
  const { data: dbRes, isLoading: resLoading } = useAdminReservationsQuery()
  const { data: dbMenuItems } = useMenuItemsQuery(DEFAULT_MENU_ITEMS)
  const updateOrderStatusMutation = useUpdateOrderStatusMutation()
  const updateReservationStatusMutation = useUpdateReservationStatusMutation()
  const createDishMutation = useCreateDishMutation()
  const updateDishMutation = useUpdateDishMutation()
  const deleteDishMutation = useDeleteDishMutation()
  const toggleDishAvailabilityMutation = useToggleDishAvailabilityMutation()

  // Load customer profiles for role management
  const loadProfiles = async () => {
    setProfilesLoading(true)
    try {
      const p = await getAllProfiles()
      if (p && p.length > 0) {
        setProfiles(p)
      } else {
        setProfiles([])
      }
    } catch {
    } finally {
      setProfilesLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'customers') {
      loadProfiles()
    }
  }, [activeTab])

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

  useEffect(() => {
    if (dbMenuItems && dbMenuItems.length > 0) {
      setMenuItems(
        dbMenuItems.map((item) => ({
          ...item,
          in_stock: item.is_available ?? true,
        }))
      )
    }
  }, [dbMenuItems])

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

  // Toggle dish stock & availability
  const handleToggleStock = (dishId: string) => {
    const target = menuItems.find((m) => m.id === dishId)
    const newStock = target ? !target.in_stock : true

    const updated = menuItems.map((m) =>
      m.id === dishId ? { ...m, in_stock: newStock, is_available: newStock } : m
    )
    setMenuItems(updated)
    syncWithChatbotKB(updated)

    toggleDishAvailabilityMutation.mutate(
      { dishId, is_available: newStock },
      {
        onSuccess: () => {
          toast.info(newStock ? 'Dish restored to active menu' : 'Dish marked sold out')
        },
        onError: () => {
          toast.info('Local availability updated')
        },
      }
    )
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
      onError: () => {
        const updated = menuItems.filter((m) => m.id !== dishId)
        setMenuItems(updated)
        toast.success('Dish removed from catalog')
      },
    })
  }

  // Add new dish with Supabase Mutation
  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDishName || !newDishPrice) return

    const price = parseFloat(newDishPrice) || 12.0
    const discount_price = newDishDiscountPrice ? parseFloat(newDishDiscountPrice) : null

    createDishMutation.mutate(
      {
        name: newDishName,
        category_name: newDishCategory,
        price,
        discount_price,
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
            category_name: newDishCategory,
            description: newDishDesc,
            price,
            discount_price,
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
          setNewDishDiscountPrice('')
          setNewDishDesc('')
          setShowAddDishModal(false)
          toast.success('New Dish Added!', {
            description: `${newDishName} added to menu & database.`,
          })
        },
        onError: () => {
          const item = {
            id: `dish-${Date.now().toString(36)}`,
            name: newDishName,
            category_name: newDishCategory,
            description: newDishDesc,
            price,
            discount_price,
            image_url: newDishImage,
            is_available: true,
            is_featured: false,
            in_stock: true,
          }
          const updated = [item, ...menuItems]
          setMenuItems(updated)
          syncWithChatbotKB(updated)
          setShowAddDishModal(false)
          toast.success('Dish added to catalog!')
        },
      }
    )
  }

  // Edit existing dish
  const handleEditDishSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDish) return

    updateDishMutation.mutate(
      {
        dishId: editingDish.id,
        dish: {
          name: editingDish.name,
          category_name: editingDish.category_name || editingDish.category || 'Steaks & Grills',
          price: Number(editingDish.price),
          discount_price: editingDish.discount_price ? Number(editingDish.discount_price) : null,
          description: editingDish.description,
          image_url: editingDish.image_url,
          is_available: editingDish.is_available ?? true,
          is_featured: editingDish.is_featured ?? false,
        },
      },
      {
        onSuccess: () => {
          const updated = menuItems.map((m) =>
            m.id === editingDish.id
              ? { ...editingDish, in_stock: editingDish.is_available ?? true }
              : m
          )
          setMenuItems(updated)
          syncWithChatbotKB(updated)
          setEditingDish(null)
          toast.success('Dish Updated!', { description: `${editingDish.name} details saved.` })
        },
        onError: () => {
          const updated = menuItems.map((m) => (m.id === editingDish.id ? editingDish : m))
          setMenuItems(updated)
          setEditingDish(null)
          toast.success('Dish updated locally')
        },
      }
    )
  }

  // Promote / Demote user role
  const handleToggleUserRole = async (targetUser: UserProfile) => {
    const nextRole = targetUser.role === 'admin' ? 'customer' : 'admin'
    const confirm = await showConfirmAlert(
      `Change User Role?`,
      `Are you sure you want to change ${targetUser.full_name || targetUser.email}'s role to ${nextRole.toUpperCase()}?`
    )
    if (!confirm) return

    try {
      await updateUserRole(targetUser.id, nextRole)
      setProfiles((prev) =>
        prev.map((p) => (p.id === targetUser.id ? { ...p, role: nextRole } : p))
      )
      toast.success('User Role Updated', {
        description: `${targetUser.full_name || 'User'} is now an ${nextRole}.`,
      })
      if (targetUser.id === user?.id) {
        await refreshProfile()
      }
    } catch (err: any) {
      toast.error('Role Update Failed', { description: err.message })
    }
  }

  // Calculate Key KPI Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const activeOrdersCount = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length
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
      o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Admin Authorization Gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#C5A059]" />
        <p className="font-serif text-lg text-[var(--muted)]">Verifying administrator credentials...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-primary/30 p-8 shadow-2xl text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#E5C158]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">Administrator Portal</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Access to APNA DERA operations, live kitchen dispatch, and catalog management requires an authenticated administrator session.
          </p>
          <Link
            href="/login"
            className="block w-full rounded-full gold-gradient-bg py-3.5 text-sm font-semibold text-black shadow-lg hover:opacity-90 transition"
          >
            Sign In as Administrator
          </Link>
          <Link href="/" className="block text-xs uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)] pt-2">
            ← Return to Main Dining Room
          </Link>
        </div>
      </div>
    )
  }

  const isPermitted = isAdmin || profile?.role === 'admin'

  if (!isPermitted) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-red-500/30 p-8 shadow-2xl text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)]">Access Restricted</h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Your signed-in account (<span className="text-[#C5A059] font-medium">{user.email}</span>) does not have administrator privileges.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--card)] py-3 text-xs uppercase tracking-wider font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Luxury Admin Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-md border-b border-primary/20 shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-primary/40 shadow-lg">
              <Image
                src="/images/logo.jpg"
                alt="APNA DERA Admin"
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-wider gold-gradient-text">
                  APNA DERA
                </span>
                <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-amber-300">
                  Manager Portal
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] font-medium -mt-0.5">
                Kitchen & Floor Command
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Time */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-[var(--surface)] border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--muted)]">
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
              className="md:hidden text-[var(--muted)] p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation for Desktop */}
        <div className="mx-auto max-w-7xl px-4 md:px-8 hidden md:flex items-center gap-2 border-t border-[var(--border-subtle)] pt-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: activeOrdersCount },
            { id: 'reservations', label: 'Tables & Chairs', icon: CalendarCheck, badge: bookedTablesCount },
            { id: 'menu', label: 'Menu Manager', icon: UtensilsCrossed },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`relative flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                  isActive ? 'text-primary' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-primary text-black' : 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]'
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
              className="md:hidden border-t border-primary/20 bg-[var(--secondary)] px-4 py-3 space-y-1"
            >
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: activeOrdersCount },
                { id: 'reservations', label: 'Tables & Chairs', icon: CalendarCheck, badge: bookedTablesCount },
                { id: 'menu', label: 'Menu Manager', icon: UtensilsCrossed },
                { id: 'customers', label: 'Customers', icon: Users },
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
                        : 'text-[var(--muted)] hover:bg-[var(--card)]'
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
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                    Today&apos;s Revenue
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold gold-gradient-text">
                  Rs. {totalRevenue.toFixed(2)}
                </div>
                <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="h-3 w-3" /> +18.4% vs yesterday
                </p>
              </div>

              {/* Metric 2 */}
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                    Active Kitchen Orders
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <ChefHat className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-[var(--foreground)]">
                  {activeOrdersCount}
                </div>
                <p className="mt-1 text-xs text-amber-300 font-medium">
                  {orders.filter((o) => o.status === 'pending').length} pending dispatch
                </p>
              </div>

              {/* Metric 3 */}
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                    Booked Tables & Chairs
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-[var(--foreground)]">
                  {bookedTablesCount} <span className="text-sm font-sans text-[var(--muted-foreground)] font-normal">/ 12 Tables</span>
                </div>
                <p className="mt-1 text-xs text-[#E5C158] font-medium">
                  {totalChairsReserved} Chairs Allocated Today
                </p>
              </div>

              {/* Metric 4 */}
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                    Average Order Value
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/30 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 font-serif text-3xl font-bold text-[var(--foreground)]">
                  Rs. {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Across {orders.length} total orders
                </p>
              </div>
            </div>

            {/* Live Queue Previews: Orders & Tables */}
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Orders List Preview */}
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">Recent Orders</h3>
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
                      className="flex items-center justify-between rounded-xl bg-[var(--input)] border border-[var(--border-subtle)] p-4 hover:border-primary/40 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-[var(--foreground)]">{ord.customer_name}</span>
                          <span className="font-mono text-[10px] text-[var(--muted-foreground)]">#{ord.id.slice(0, 10)}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {ord.order_items?.map((i: any) => `${i.quantity}x ${i.item_name}`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold gold-gradient-text text-sm">
                          Rs. {(ord.total || 0).toFixed(2)}
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
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">Table & Chair Bookings</h3>
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
                      className="flex items-center justify-between rounded-xl bg-[var(--input)] border border-[var(--border-subtle)] p-4 hover:border-primary/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gold-gradient-bg text-black font-serif font-bold text-sm shadow">
                          T-{res.table_number || 1}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-[var(--foreground)]">{res.customer_name}</div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
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
                        : 'bg-[var(--surface)] border border-primary/20 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search customer, phone, order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full bg-[var(--surface)] border border-[var(--border)] pl-10 pr-4 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none w-full md:w-72"
                />
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-12 text-center text-[var(--muted-foreground)]">
                  No orders matching criteria.
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <motion.div
                    key={ord.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg space-y-4 hover:border-primary/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--border)] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-[var(--foreground)]">
                            {ord.customer_name}
                          </h4>
                          <span className="font-mono text-xs text-[var(--muted-foreground)]">#{ord.id}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          Phone: <span className="text-[var(--foreground)]">{ord.phone}</span> • Address: {ord.delivery_address}
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
                          Rs. {(ord.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="rounded-xl bg-[var(--input)] border border-[var(--border-subtle)] p-4 space-y-2">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                        Kitchen Items
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {ord.order_items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs text-[var(--muted)]">
                            <span>
                              <span className="font-bold text-primary">{item.quantity}x</span> {item.item_name}
                            </span>
                            <span className="text-[var(--muted-foreground)]">${((item.item_price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {ord.notes && (
                        <p className="mt-2 text-xs italic text-amber-200/80 border-t border-[var(--border-subtle)] pt-2">
                          Note: &ldquo;{ord.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Interactive Status Changer Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-xs text-[var(--muted-foreground)]">
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
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                  Total Floor Capacity
                </span>
                <div className="font-serif text-2xl font-bold gold-gradient-text mt-1">
                  12 Tables • 56 Chairs
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Across 4 fine-dining zones</p>
              </div>

              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                  Today&apos;s Booked Chairs
                </span>
                <div className="font-serif text-2xl font-bold text-[var(--foreground)] mt-1">
                  {totalChairsReserved} Chairs Occupied
                </div>
                <p className="text-xs text-emerald-400 mt-0.5">
                  {Math.round((totalChairsReserved / 56) * 100)}% Floor Occupancy
                </p>
              </div>

              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold">
                  Pending Approval
                </span>
                <div className="font-serif text-2xl font-bold text-amber-300 mt-1">
                  {reservations.filter((r) => r.status === 'pending').length} Requests
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Awaiting manager confirmation</p>
              </div>
            </div>

            {/* Reservations List with Table & Chair Details */}
            <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">
                    Guest Table & Chairs Reservations
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
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
                    className="rounded-xl bg-[var(--input)] border border-[var(--border-subtle)] p-5 space-y-3 hover:border-primary/40 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-gradient-bg text-black font-serif font-bold text-base shadow">
                          T-{res.table_number || 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-[var(--foreground)] text-base">
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
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            Phone: <span className="text-[var(--foreground)]">{res.phone}</span> • Date: {res.reservation_date} at {res.reservation_time}
                          </p>
                        </div>
                      </div>

                      {/* Chairs Allocation Pill */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-xl bg-primary/10 border border-primary/30 px-3.5 py-1.5 text-center">
                          <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold block">
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
                            className="rounded-full border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500 hover:text-[var(--foreground)] transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>

                    {res.special_requests && (
                      <p className="text-xs text-[var(--muted-foreground)] border-t border-[var(--border-subtle)] pt-2">
                        <span className="text-[#C5A059] font-medium">Special Request:</span> &ldquo;{res.special_requests}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Floor Plan Overview of All Tables */}
            <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-[var(--foreground)]">
                Floor Plan Live Tables Status
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {RESTAURANT_TABLES.map((tbl) => (
                  <div
                    key={tbl.id}
                    className="rounded-xl bg-[var(--input)] border border-[var(--border-subtle)] p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[var(--foreground)]">Table {tbl.number}</span>
                      <span className="rounded-full bg-primary/10 text-[#C5A059] px-2 py-0.5 text-[10px] font-bold">
                        {tbl.capacity} Chairs
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{tbl.name}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--muted-foreground)]">
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
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[var(--foreground)]">
                  Menu Items Catalog
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
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
                  className="overflow-hidden rounded-2xl bg-[var(--surface)] border border-primary/20 shadow-lg flex flex-col justify-between group"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[var(--input)]">
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
                            : 'bg-red-500 text-[var(--foreground)]'
                        }`}
                      >
                        {dish.in_stock ? 'In Stock' : 'Sold Out'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[var(--foreground)]">
                        {dish.name}
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="font-serif text-lg font-bold gold-gradient-text">
                        Rs. {dish.price.toFixed(2)}
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
                          className="p-1.5 text-[var(--muted-foreground)] hover:text-red-400 transition"
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
                    className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-primary/40 p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                      <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">Add New Dish</h3>
                      <button
                        onClick={() => setShowAddDishModal(false)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddDish} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                          Dish Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newDishName}
                          onChange={(e) => setNewDishName(e.target.value)}
                          placeholder="e.g. Saffron Garlic Lobster Tail"
                          className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                            Category
                          </label>
                          <select
                            value={newDishCategory}
                            onChange={(e) => setNewDishCategory(e.target.value)}
                            className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--foreground)] focus:border-primary focus:outline-none"
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
                          <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                            Price (Rs.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newDishPrice}
                            onChange={(e) => setNewDishPrice(e.target.value)}
                            placeholder="24.50"
                            className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={newDishImage}
                          onChange={(e) => setNewDishImage(e.target.value)}
                          className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={newDishDesc}
                          onChange={(e) => setNewDishDesc(e.target.value)}
                          placeholder="Ingredients, flavors, artisan preparation details..."
                          className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAddDishModal(false)}
                          className="rounded-full border border-[var(--border)] px-5 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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

            {/* Edit Dish Modal */}
            <AnimatePresence>
              {editingDish && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-primary/40 p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                      <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">Edit Dish Details</h3>
                      <button
                        onClick={() => setEditingDish(null)}
                        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEditDishSave} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                          Dish Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editingDish.name || ''}
                          onChange={(e) =>
                            setEditingDish({ ...editingDish, name: e.target.value })
                          }
                          className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                            Category
                          </label>
                          <select
                            value={editingDish.category_name || editingDish.category || 'Steaks & Grills'}
                            onChange={(e) =>
                              setEditingDish({ ...editingDish, category_name: e.target.value, category: e.target.value })
                            }
                            className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--foreground)] focus:border-primary focus:outline-none"
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
                          <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                            Price (Rs.)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editingDish.price || ''}
                            onChange={(e) =>
                              setEditingDish({ ...editingDish, price: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                            Discount Price (Rs.) (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingDish.discount_price ?? ''}
                            onChange={(e) =>
                              setEditingDish({
                                ...editingDish,
                                discount_price: e.target.value ? parseFloat(e.target.value) : null,
                              })
                            }
                            placeholder="Leave empty if none"
                            className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                            Availability
                          </label>
                          <select
                            value={editingDish.is_available ? 'true' : 'false'}
                            onChange={(e) =>
                              setEditingDish({
                                ...editingDish,
                                is_available: e.target.value === 'true',
                                in_stock: e.target.value === 'true',
                              })
                            }
                            className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--foreground)] focus:border-primary focus:outline-none"
                          >
                            <option value="true">In Stock (Available)</option>
                            <option value="false">Sold Out (Unavailable)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={editingDish.image_url || ''}
                          onChange={(e) =>
                            setEditingDish({ ...editingDish, image_url: e.target.value })
                          }
                          className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingDish.description || ''}
                          onChange={(e) =>
                            setEditingDish({ ...editingDish, description: e.target.value })
                          }
                          className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingDish(null)}
                          className="rounded-full border border-[var(--border)] px-5 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updateDishMutation.isPending}
                          className="rounded-full gold-gradient-bg px-6 py-2 text-xs font-bold uppercase tracking-wider text-black shadow hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {updateDishMutation.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            'Save Changes'
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
        {/* TAB 5: CUSTOMER ROLES & ACCOUNTS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" /> Customer Accounts & Roles
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  View registered diners, monitor activity, and manage administrative privileges securely.
                </p>
              </div>

              <button
                onClick={loadProfiles}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh List
              </button>
            </div>

            {/* Customer Role Statistics */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold block">Total Registered</span>
                <span className="font-serif text-2xl font-bold text-[var(--foreground)] mt-1 block">{profiles.length}</span>
              </div>
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold block">Active Customers</span>
                <span className="font-serif text-2xl font-bold text-emerald-400 mt-1 block">
                  {profiles.filter((p) => p.role !== 'admin').length}
                </span>
              </div>
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-5">
                <span className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold block">Administrators</span>
                <span className="font-serif text-2xl font-bold text-[#E5C158] mt-1 block">
                  {profiles.filter((p) => p.role === 'admin').length}
                </span>
              </div>
            </div>

            {/* Customers Table */}
            {profilesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#C5A059]" />
              </div>
            ) : profiles.length === 0 ? (
              <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-12 text-center">
                <p className="text-[var(--muted-foreground)]">No registered profiles found in database.</p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--input)] uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)]">
                      <tr>
                        <th className="py-4 px-6 font-semibold">User</th>
                        <th className="py-4 px-6 font-semibold">Contact</th>
                        <th className="py-4 px-6 font-semibold">Current Role</th>
                        <th className="py-4 px-6 font-semibold">Registered</th>
                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--muted)]">
                      {profiles.map((p) => {
                        const isSelf = p.id === user?.id
                        const isTargetAdmin = p.role === 'admin'
                        return (
                          <tr key={p.id} className="hover:bg-[var(--border-subtle)] transition">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full gold-gradient-bg text-black font-bold">
                                  {p.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div className="font-serif text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                                    {p.full_name || 'Guest User'}
                                    {isSelf && (
                                      <span className="text-[10px] bg-primary/20 text-[#E5C158] px-1.5 py-0.2 rounded font-sans font-normal">
                                        (You)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-[var(--muted-foreground)] font-mono truncate max-w-[160px]">
                                    {p.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>{p.email || '—'}</div>
                              <div className="text-[var(--muted-foreground)] text-[11px] mt-0.5">{p.phone || 'No phone'}</div>
                            </td>
                            <td className="py-4 px-6">
                              {isTargetAdmin ? (
                                <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#E5C158]">
                                  Admin
                                </span>
                              ) : (
                                <span className="rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                                  Customer
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-[var(--muted-foreground)]">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Active'}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleToggleUserRole(p)}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                                  isTargetAdmin
                                    ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                                    : 'gold-gradient-bg text-black shadow hover:opacity-90'
                                }`}
                              >
                                {isTargetAdmin ? 'Demote to Customer' : 'Promote to Admin'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
            <div className="border-b border-[var(--border)] pb-4">
              <h3 className="font-serif text-2xl font-bold text-[var(--foreground)]">
                Performance Analytics & Dining Insights
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Key trends, category revenues, and peak reservation hours.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Live Revenue by Dish / Order Breakdown */}
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg space-y-4">
                <h4 className="font-serif text-lg font-bold text-[var(--foreground)]">
                  Top Revenue Dishes (Live Orders)
                </h4>
                {(() => {
                  const dishTotals = new Map<string, number>()
                  let grandTotal = 0
                  for (const o of orders) {
                    if (o.status === 'cancelled') continue
                    for (const item of o.order_items || []) {
                      const amt = Number(item.item_price || 0) * Number(item.quantity || 1)
                      dishTotals.set(item.item_name, (dishTotals.get(item.item_name) || 0) + amt)
                      grandTotal += amt
                    }
                  }
                  const entries = Array.from(dishTotals.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                  if (entries.length === 0) {
                    return <p className="text-xs text-[var(--muted-foreground)]">No completed order data yet.</p>
                  }
                  return (
                    <div className="space-y-3">
                      {entries.map(([name, amount]) => {
                        const percent = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0
                        return (
                          <div key={name} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--muted)] font-medium truncate max-w-[60%]">{name}</span>
                              <span className="text-primary font-bold">Rs. {amount.toFixed(2)} ({percent}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[var(--input)] overflow-hidden">
                              <div
                                className="h-full gold-gradient-bg rounded-full transition-all duration-700"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>

              {/* Peak Dining Hours from Live Reservations */}
              <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-6 shadow-lg space-y-4">
                <h4 className="font-serif text-lg font-bold text-[var(--foreground)]">
                  Reservation Time Slots (Live Bookings)
                </h4>
                {(() => {
                  const slotCounts = new Map<string, number>()
                  for (const r of reservations) {
                    if (r.status === 'rejected') continue
                    const slot = r.reservation_time || 'Unscheduled'
                    slotCounts.set(slot, (slotCounts.get(slot) || 0) + 1)
                  }
                  const entries = Array.from(slotCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
                  const maxCount = entries.length > 0 ? entries[0][1] : 1
                  if (entries.length === 0) {
                    return <p className="text-xs text-[var(--muted-foreground)]">No reservation data yet.</p>
                  }
                  return (
                    <div className="space-y-3">
                      {entries.map(([time, count]) => {
                        const load = Math.round((count / maxCount) * 100)
                        return (
                          <div key={time} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-[var(--muted)]">{time}</span>
                              <span className="text-primary font-semibold">{count} Booking(s)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[var(--input)] overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 rounded-full transition-all duration-700"
                                style={{ width: `${load}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
