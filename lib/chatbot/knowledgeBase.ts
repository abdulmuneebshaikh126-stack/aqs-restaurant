import path from 'path'
import fs from 'fs'

// Interface definitions for the Knowledge Base
export interface RestaurantInfo {
  name: string
  tagline: string
  description: string
  address: string
  phone: string
  email: string
  delivery_fee: number
  delivery_time: string
  payment_methods: string
  order_tracking: string
  reservation_info: string
  updated_at: string
}

export interface OpeningHourEntry {
  day_range: string
  open_time: string
  close_time: string
  notes?: string
}

export interface MenuItemKB {
  id: string
  name: string
  category: string
  description: string
  price: number
  discount_price: number | null
  is_available: boolean
  is_featured: boolean
  image_url: string | null
  keywords: string
}

export interface TableKB {
  id: string
  number: number
  name: string
  zone: string
  capacity: number
  shape: string
  price_tier: string
  features: string[]
}

export interface FAQKB {
  topic: string
  question: string
  answer: string
}

export interface KnowledgeBaseSnapshot {
  info: RestaurantInfo
  openingHours: OpeningHourEntry[]
  categories: { id: string; name: string; description: string }[]
  menuItems: MenuItemKB[]
  tables: TableKB[]
  faqs: FAQKB[]
  lastUpdated: string
}

// Verified data extracted directly from the existing AQS Restaurant codebase
const VERIFIED_RESTAURANT_INFO: RestaurantInfo = {
  name: 'AQS Restaurant',
  tagline: 'Good Food • Good Mood',
  description:
    'Where culinary passion meets sophisticated taste. Crafting memorable dining experiences with the finest ingredients. Indulge in our curated symphony of extraordinary flavors fusing culinary artistry with modern dining excellence.',
  address: '123 Luxury Avenue, Gourmet District',
  phone: '+92 300 1234567',
  email: 'contact@aqsrestaurant.com',
  delivery_fee: 5.0,
  delivery_time: 'Hot and fresh dishes delivered directly to your doorstep in 30 minutes.',
  payment_methods: 'Cash on Delivery (COD)',
  order_tracking:
    'Live kitchen tracking active through our Orders page (/orders) with four real-time milestones: Pending, Preparing, Ready, and Delivered.',
  reservation_info:
    'Interactive table and chair reservation with visual seating floor plan across 4 dining zones (Window Terrace, Main Dining, VIP Lounge, Chef Garden). Free online booking with instant confirmation pass.',
  updated_at: new Date().toISOString(),
}

const VERIFIED_OPENING_HOURS: OpeningHourEntry[] = [
  { day_range: 'Monday – Thursday', open_time: '11:00 AM', close_time: '11:00 PM', notes: 'Lunch & Dinner Service' },
  { day_range: 'Friday – Saturday', open_time: '11:00 AM', close_time: '12:00 AM', notes: 'Midnight Fine Dining & Drinks' },
  { day_range: 'Sunday', open_time: '12:00 PM', close_time: '10:00 PM', notes: 'Sunday Brunch & Dinner' },
]

const VERIFIED_CATEGORIES = [
  { id: 'cat-steaks', name: 'Steaks & Grills', description: 'Flame-seared prime beef cuts, slow-smoked ribs, and fresh seafood' },
  { id: 'cat-pizza', name: 'Pizza', description: 'Wood-fired artisan sourdough pizzas baked with gourmet Italian toppings' },
  { id: 'cat-burgers', name: 'Burgers', description: 'Prime Wagyu beef and crispy panko chicken on toasted brioche' },
  { id: 'cat-pasta', name: 'Pasta', description: 'Handcrafted fresh egg pasta ribbons in rich parmesan cream sauces' },
  { id: 'cat-desserts', name: 'Desserts', description: 'Decadent Valrhona chocolate cakes, glazed New York cheesecakes' },
  { id: 'cat-drinks', name: 'Drinks', description: 'Crafted botanical sparklers, passionfruit mojitos, and gold-flake elixirs' },
]

const VERIFIED_MENU_ITEMS: MenuItemKB[] = [
  {
    id: '1',
    name: 'Artisan Truffle & Wild Mushroom Pizza',
    category: 'Pizza',
    description: 'Wood-fired sourdough crust, fior di latte, black truffle shavings, porcini mushrooms, fresh thyme',
    price: 18.5,
    discount_price: 15.99,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    keywords: 'pizza, truffle, mushroom, wild mushroom, sourdough, cheese, italian, vegetarian, sale, special',
  },
  {
    id: '2',
    name: 'Prime Wagyu Brioche Burger',
    category: 'Burgers',
    description: 'Double Wagyu beef smashed patties, smoked gouda, caramelized shallot relish, truffle aioli on toasted brioche',
    price: 16.99,
    discount_price: null,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    keywords: 'burger, wagyu, beef, prime burger, brioche, patties, gouda, truffle aioli, cheeseburger',
  },
  {
    id: '3',
    name: 'Handcrafted Truffle Fettuccine Alfredo',
    category: 'Pasta',
    description: 'House-made egg pasta ribbons tossed in aged Parmigiano Reggiano, brown butter, garlic cream & herbs',
    price: 17.0,
    discount_price: null,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    keywords: 'pasta, fettuccine, alfredo, truffle fettuccine, cream, parmigiano, egg pasta, italian',
  },
  {
    id: '4',
    name: 'Flame-Seared Prime Ribeye Steak',
    category: 'Steaks & Grills',
    description: 'Flame-grilled 10oz prime ribeye, bone marrow herb butter, roasted garlic head, red wine demi-glace',
    price: 34.0,
    discount_price: 29.5,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
    keywords: 'steak, ribeye, prime ribeye, beef steak, beef, meat, grill, flame seared, bone marrow, special, sale',
  },
  {
    id: '5',
    name: 'Slow-Smoked Sticky Glazed Ribs',
    category: 'Steaks & Grills',
    description: '12-hour hickory smoked tender ribs coated in signature spiced bourbon BBQ glaze and toasted sesame',
    price: 24.5,
    discount_price: null,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    keywords: 'ribs, smoked ribs, bbq ribs, sticky ribs, pork ribs, meat, grill, glazed ribs',
  },
  {
    id: '6',
    name: 'Burrata & Heirloom Caesar Salad',
    category: 'Pasta',
    description: 'Crisp baby gem lettuce, creamy Puglia burrata, sourdough croutons, shaved parmigiano, garlic anchovy emulsion',
    price: 13.5,
    discount_price: 11.99,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80',
    keywords: 'salad, caesar salad, burrata, cheese, heirloom, greens, appetizer, light, healthy, special',
  },
  {
    id: '7',
    name: 'Pan-Seared Wild Atlantic Salmon',
    category: 'Steaks & Grills',
    description: 'Crispy skin salmon filet served over saffron asparagus risotto and zesty lemon caper emulsion',
    price: 22.0,
    discount_price: null,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    keywords: 'salmon, fish, seafood, atlantic salmon, pan seared, risotto, healthy, grill',
  },
  {
    id: '8',
    name: 'Crispy Chicken Katsu Supreme',
    category: 'Burgers',
    description: 'Panko-crusted chicken tenderloin, honey sriracha glaze, pickled purple cabbage slaw on buttered sesame bun',
    price: 14.5,
    discount_price: null,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
    keywords: 'chicken, chicken burger, katsu, crispy chicken, panko, sriracha, sandwich, poultry',
  },
  {
    id: '9',
    name: 'Molten Valrhona Lava Cake',
    category: 'Desserts',
    description: 'Warm decadent dark chocolate cake with flowing molten core, Madagascar bourbon vanilla bean gelato',
    price: 9.5,
    discount_price: null,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    keywords: 'dessert, cake, chocolate cake, molten lava, lava cake, valrhona, sweet, gelato, ice cream',
  },
  {
    id: '10',
    name: 'Vanilla Berry Glazed Cheesecake',
    category: 'Desserts',
    description: 'Velvety New York style cheesecake layered over buttery graham crust, topped with wild forest berry coulis',
    price: 8.99,
    discount_price: 7.5,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    keywords: 'dessert, cheesecake, berry cheesecake, new york cheesecake, sweet, berries, strawberry, special',
  },
  {
    id: '11',
    name: 'Golden Passionfruit & Mint Mojito',
    category: 'Drinks',
    description: 'Crushed passionfruit, fresh garden spearmint, cane sugar, sparkling water and edible gold flake shimmer',
    price: 6.5,
    discount_price: null,
    is_available: true,
    is_featured: false,
    image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',
    keywords: 'drink, beverage, mojito, passionfruit, mocktail, cocktail, mint, refreshment, cold, gold shimmer',
  },
  {
    id: '12',
    name: 'Slow-Braised Birria Tacos',
    category: 'Steaks & Grills',
    description: 'Crisped corn tortillas filled with braised shredded beef, melted Oaxaca cheese, cilantro, rich dipping consommé',
    price: 14.0,
    discount_price: 12.0,
    is_available: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    keywords: 'tacos, birria, birria tacos, beef tacos, mexican, consomme, shredded beef, special, sale',
  },
]

const VERIFIED_TABLES: TableKB[] = [
  {
    id: 'tbl-1',
    number: 1,
    name: 'Sunset Romantic Alcove',
    zone: 'Window Terrace',
    capacity: 2,
    shape: 'circle',
    price_tier: 'premium',
    features: ['Panoramic City Lights', 'Candlelit Setting', 'Intimate 2-Seater'],
  },
  {
    id: 'tbl-2',
    number: 2,
    name: 'Skyline Window Table',
    zone: 'Window Terrace',
    capacity: 2,
    shape: 'circle',
    price_tier: 'premium',
    features: ['Floor-to-ceiling Window', 'Evening Sunset View', 'Cozy Ambiance'],
  },
  {
    id: 'tbl-3',
    number: 3,
    name: 'Terrace Grand Window',
    zone: 'Window Terrace',
    capacity: 4,
    shape: 'rectangle',
    price_tier: 'premium',
    features: ['Panoramic View', 'Spacious Seating', 'Direct Terrace Access'],
  },
  {
    id: 'tbl-4',
    number: 4,
    name: 'Chandelier Center Table',
    zone: 'Main Dining',
    capacity: 4,
    shape: 'rectangle',
    price_tier: 'standard',
    features: ['Crystal Chandelier View', 'Central Atmosphere', 'Plush Velvet Chairs'],
  },
  {
    id: 'tbl-5',
    number: 5,
    name: 'Wine Cellar Vista Table',
    zone: 'Main Dining',
    capacity: 4,
    shape: 'rectangle',
    price_tier: 'standard',
    features: ['Vintage Wine Cellar View', 'Warm Acoustic Lighting', 'Spacious Distance'],
  },
  {
    id: 'tbl-6',
    number: 6,
    name: 'Grand Family Dining',
    zone: 'Main Dining',
    capacity: 6,
    shape: 'rectangle',
    price_tier: 'standard',
    features: ['Comfortable 6-Chair Setup', 'Spacious Tabletop', 'Great for Families'],
  },
  {
    id: 'tbl-7',
    number: 7,
    name: 'Celebration Grand Table',
    zone: 'Main Dining',
    capacity: 6,
    shape: 'rectangle',
    price_tier: 'standard',
    features: ['6 Deluxe Chairs', 'Celebration Setup', 'Central Serving Space'],
  },
  {
    id: 'tbl-8',
    number: 8,
    name: 'Royal Velvet VIP Booth',
    zone: 'VIP Lounge',
    capacity: 6,
    shape: 'booth',
    price_tier: 'vip',
    features: ['Private Curved Velvet Booth', 'Personal Sommelier Access', 'Acoustic Privacy'],
  },
  {
    id: 'tbl-9',
    number: 9,
    name: 'Presidential 8-Seat Table',
    zone: 'VIP Lounge',
    capacity: 8,
    shape: 'rectangle',
    price_tier: 'vip',
    features: ['8 Executive Highback Chairs', 'Private Butler Service', 'Dedicated Lounge Bar'],
  },
  {
    id: 'tbl-10',
    number: 10,
    name: 'Courtyard Fountain Table',
    zone: "Chef's Garden",
    capacity: 4,
    shape: 'circle',
    price_tier: 'standard',
    features: ['Open Sky Garden', 'Fountain Murmur', 'Fresh Floral Aromas'],
  },
  {
    id: 'tbl-11',
    number: 11,
    name: 'Olive Tree Patio',
    zone: "Chef's Garden",
    capacity: 4,
    shape: 'rectangle',
    price_tier: 'standard',
    features: ['Illuminated Olive Trees', 'Breezy Patio', 'Relaxed Fine Dining'],
  },
  {
    id: 'tbl-12',
    number: 12,
    name: 'Garden Banquet Feast Table',
    zone: "Chef's Garden",
    capacity: 8,
    shape: 'rectangle',
    price_tier: 'vip',
    features: ['8 Garden Chairs', 'Long Wood Dining Slab', 'Under Fairy Lights'],
  },
]

const VERIFIED_FAQS: FAQKB[] = [
  {
    topic: 'Reservations',
    question: 'How do I book a table and choose chairs?',
    answer:
      'You can book online on our Reservations page (/reservations). Select your date and arrival time, pick your table on our interactive 2D floor plan, and select your individual chairs. Reservation is free with instant confirmation.',
  },
  {
    topic: 'Delivery',
    question: 'What is your delivery fee and delivery time?',
    answer:
      'We deliver hot and fresh within 30 minutes. Our flat delivery fee is $5.00 for all orders within our gourmet delivery radius.',
  },
  {
    topic: 'Payment',
    question: 'What payment methods do you accept?',
    answer:
      'We accept Cash on Delivery (COD). You can pay our delivery rider in cash upon receiving your hot meal.',
  },
  {
    topic: 'Opening Hours',
    question: 'What are the opening and closing hours of AQS Restaurant?',
    answer:
      'AQS Restaurant is open: Monday – Thursday: 11:00 AM – 11:00 PM | Friday – Saturday: 11:00 AM – 12:00 AM (Midnight) | Sunday: 12:00 PM – 10:00 PM.',
  },
  {
    topic: 'Location',
    question: 'Where is AQS Restaurant located?',
    answer:
      'AQS Restaurant is located at 123 Luxury Avenue, Gourmet District. You can reach our front desk by phone at +92 300 1234567 or by email at contact@aqsrestaurant.com.',
  },
  {
    topic: 'Ordering',
    question: 'How can I order food online?',
    answer:
      'Visit our Menu page (/menu), click "Add" on any dish to add it to your cart, and proceed to Checkout (/checkout) with Cash on Delivery.',
  },
  {
    topic: 'Chairs & Seating',
    question: 'How many chairs are available per table?',
    answer:
      'We have tables ranging from intimate 2-chair romantic tables up to 8-chair presidential banquet tables across 4 zones: Window Terrace, Main Dining, VIP Lounge, and Chef Garden.',
  },
]

// Database file paths
const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'aqs_knowledge_base.sqlite')
const JSON_BACKUP_PATH = path.join(DB_DIR, 'aqs_knowledge_base.json')

// Lazy SQLite initialization helper
let sqliteDb: any = null

function getSqliteInstance() {
  if (sqliteDb) return sqliteDb

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }

    // Attempt to load native node:sqlite
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DatabaseSync } = require('node:sqlite')
    sqliteDb = new DatabaseSync(DB_PATH)

    // Setup schema
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS restaurant_info (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT,
        description TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        delivery_fee REAL,
        delivery_time TEXT,
        payment_methods TEXT,
        order_tracking TEXT,
        reservation_info TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS opening_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_range TEXT NOT NULL,
        open_time TEXT NOT NULL,
        close_time TEXT NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS menu_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_price REAL,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_featured INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        keywords TEXT
      );

      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL,
        name TEXT NOT NULL,
        zone TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        shape TEXT NOT NULL,
        price_tier TEXT,
        features TEXT
      );

      CREATE TABLE IF NOT EXISTS faqs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      );
    `)

    // Seed if empty
    const infoCount = sqliteDb.prepare('SELECT count(*) as count FROM restaurant_info').get()
    if (!infoCount || infoCount.count === 0) {
      seedDatabase(sqliteDb)
    }

    return sqliteDb
  } catch (err) {
    console.warn('SQLite init warning, falling back to persistent JSON storage:', err)
    return null
  }
}

function seedDatabase(db: any) {
  // 1. Info
  const insertInfo = db.prepare(`
    INSERT OR REPLACE INTO restaurant_info (
      id, name, tagline, description, address, phone, email,
      delivery_fee, delivery_time, payment_methods, order_tracking, reservation_info, updated_at
    ) VALUES (
      'main', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `)
  insertInfo.run(
    VERIFIED_RESTAURANT_INFO.name,
    VERIFIED_RESTAURANT_INFO.tagline,
    VERIFIED_RESTAURANT_INFO.description,
    VERIFIED_RESTAURANT_INFO.address,
    VERIFIED_RESTAURANT_INFO.phone,
    VERIFIED_RESTAURANT_INFO.email,
    VERIFIED_RESTAURANT_INFO.delivery_fee,
    VERIFIED_RESTAURANT_INFO.delivery_time,
    VERIFIED_RESTAURANT_INFO.payment_methods,
    VERIFIED_RESTAURANT_INFO.order_tracking,
    VERIFIED_RESTAURANT_INFO.reservation_info,
    VERIFIED_RESTAURANT_INFO.updated_at
  )

  // 2. Opening hours
  const insertHours = db.prepare(
    'INSERT INTO opening_hours (day_range, open_time, close_time, notes) VALUES (?, ?, ?, ?)'
  )
  for (const h of VERIFIED_OPENING_HOURS) {
    insertHours.run(h.day_range, h.open_time, h.close_time, h.notes || '')
  }

  // 3. Categories
  const insertCat = db.prepare(
    'INSERT OR REPLACE INTO menu_categories (id, name, description) VALUES (?, ?, ?)'
  )
  for (const c of VERIFIED_CATEGORIES) {
    insertCat.run(c.id, c.name, c.description)
  }

  // 4. Menu Items
  const insertItem = db.prepare(`
    INSERT OR REPLACE INTO menu_items (
      id, name, category, description, price, discount_price, is_available, is_featured, image_url, keywords
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const m of VERIFIED_MENU_ITEMS) {
    insertItem.run(
      m.id,
      m.name,
      m.category,
      m.description,
      m.price,
      m.discount_price,
      m.is_available ? 1 : 0,
      m.is_featured ? 1 : 0,
      m.image_url,
      m.keywords
    )
  }

  // 5. Tables
  const insertTable = db.prepare(`
    INSERT OR REPLACE INTO restaurant_tables (
      id, number, name, zone, capacity, shape, price_tier, features
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const t of VERIFIED_TABLES) {
    insertTable.run(
      t.id,
      t.number,
      t.name,
      t.zone,
      t.capacity,
      t.shape,
      t.price_tier,
      JSON.stringify(t.features)
    )
  }

  // 6. FAQs
  const insertFAQ = db.prepare('INSERT INTO faqs (topic, question, answer) VALUES (?, ?, ?)')
  for (const f of VERIFIED_FAQS) {
    insertFAQ.run(f.topic, f.question, f.answer)
  }

  // Also write JSON mirror backup
  saveJsonMirror()
}

function saveJsonMirror(snapshot?: KnowledgeBaseSnapshot) {
  try {
    const data: KnowledgeBaseSnapshot =
      snapshot || {
        info: VERIFIED_RESTAURANT_INFO,
        openingHours: VERIFIED_OPENING_HOURS,
        categories: VERIFIED_CATEGORIES,
        menuItems: VERIFIED_MENU_ITEMS,
        tables: VERIFIED_TABLES,
        faqs: VERIFIED_FAQS,
        lastUpdated: new Date().toISOString(),
      }
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }
    fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.warn('Could not write JSON mirror backup:', err)
  }
}

function loadJsonMirror(): KnowledgeBaseSnapshot {
  try {
    if (fs.existsSync(JSON_BACKUP_PATH)) {
      const raw = fs.readFileSync(JSON_BACKUP_PATH, 'utf-8')
      return JSON.parse(raw)
    }
  } catch (e) {}

  return {
    info: VERIFIED_RESTAURANT_INFO,
    openingHours: VERIFIED_OPENING_HOURS,
    categories: VERIFIED_CATEGORIES,
    menuItems: VERIFIED_MENU_ITEMS,
    tables: VERIFIED_TABLES,
    faqs: VERIFIED_FAQS,
    lastUpdated: new Date().toISOString(),
  }
}

// =========================================================================
// PUBLIC KNOWLEDGE BASE INTERFACE
// =========================================================================

export function getKnowledgeBase(): KnowledgeBaseSnapshot {
  const db = getSqliteInstance()
  if (!db) {
    return loadJsonMirror()
  }

  try {
    const info = db.prepare('SELECT * FROM restaurant_info WHERE id = ?').get('main') as RestaurantInfo
    const openingHours = db.prepare('SELECT * FROM opening_hours').all() as OpeningHourEntry[]
    const categories = db.prepare('SELECT * FROM menu_categories').all() as any[]
    const rawItems = db.prepare('SELECT * FROM menu_items').all() as any[]
    const menuItems: MenuItemKB[] = rawItems.map((r) => ({
      ...r,
      is_available: Boolean(r.is_available),
      is_featured: Boolean(r.is_featured),
    }))

    const rawTables = db.prepare('SELECT * FROM restaurant_tables').all() as any[]
    const tables: TableKB[] = rawTables.map((t) => ({
      ...t,
      features: t.features ? JSON.parse(t.features) : [],
    }))

    const faqs = db.prepare('SELECT * FROM faqs').all() as FAQKB[]

    const snapshot: KnowledgeBaseSnapshot = {
      info: info || VERIFIED_RESTAURANT_INFO,
      openingHours: openingHours.length > 0 ? openingHours : VERIFIED_OPENING_HOURS,
      categories: categories.length > 0 ? categories : VERIFIED_CATEGORIES,
      menuItems: menuItems.length > 0 ? menuItems : VERIFIED_MENU_ITEMS,
      tables: tables.length > 0 ? tables : VERIFIED_TABLES,
      faqs: faqs.length > 0 ? faqs : VERIFIED_FAQS,
      lastUpdated: new Date().toISOString(),
    }

    saveJsonMirror(snapshot)
    return snapshot
  } catch (err) {
    console.error('Error querying SQLite Knowledge Base:', err)
    return loadJsonMirror()
  }
}

// Synchronize Knowledge Base when Admin adds/edits dishes or restaurant settings
export function syncKnowledgeBaseFromAdmin(newOrUpdatedItems?: any[]): { success: boolean; itemsCount: number } {
  const db = getSqliteInstance()
  const snapshot = loadJsonMirror()

  if (newOrUpdatedItems && Array.isArray(newOrUpdatedItems)) {
    const updatedMenuItems: MenuItemKB[] = newOrUpdatedItems.map((item) => ({
      id: item.id || `dish-${Date.now()}`,
      name: item.name,
      category: item.category || 'Specialties',
      description: item.description || '',
      price: parseFloat(item.price) || 0,
      discount_price: item.discount_price ? parseFloat(item.discount_price) : null,
      is_available: item.is_available !== false && item.in_stock !== false,
      is_featured: Boolean(item.is_featured),
      image_url: item.image_url || null,
      keywords: `${item.name.toLowerCase()}, ${item.category?.toLowerCase() || ''}, food, dish`,
    }))

    snapshot.menuItems = updatedMenuItems
    snapshot.lastUpdated = new Date().toISOString()
    saveJsonMirror(snapshot)

    if (db) {
      try {
        db.exec('DELETE FROM menu_items')
        const insertItem = db.prepare(`
          INSERT INTO menu_items (
            id, name, category, description, price, discount_price, is_available, is_featured, image_url, keywords
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        for (const m of updatedMenuItems) {
          insertItem.run(
            m.id,
            m.name,
            m.category,
            m.description,
            m.price,
            m.discount_price,
            m.is_available ? 1 : 0,
            m.is_featured ? 1 : 0,
            m.image_url,
            m.keywords
          )
        }
      } catch (err) {
        console.warn('Error syncing to SQLite:', err)
      }
    }

    return { success: true, itemsCount: updatedMenuItems.length }
  }

  return { success: true, itemsCount: snapshot.menuItems.length }
}
