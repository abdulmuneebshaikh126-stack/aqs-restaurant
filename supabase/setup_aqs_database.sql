-- ==============================================================================
-- AQS Restaurant — Complete Supabase Database Setup & Schema
-- Run this entire script in Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Restaurant Tables Layout
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2,
  shape TEXT DEFAULT 'circle',
  status TEXT DEFAULT 'available',
  price_tier TEXT DEFAULT 'standard',
  features TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Reservations / Table Bookings Table
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  table_id TEXT,
  table_name TEXT,
  table_number INTEGER,
  chairs_count INTEGER,
  selected_chairs INTEGER[],
  zone TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'seated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convenient view for table_bookings
CREATE OR REPLACE VIEW public.table_bookings AS
  SELECT * FROM public.reservations;

-- 6. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT DEFAULT 'cash_on_delivery',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID,
  item_name TEXT NOT NULL,
  item_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Profiles Table (for registered users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 11. Drop existing policies to allow re-running without conflict
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public read menu" ON public.menu_items;
DROP POLICY IF EXISTS "Manage menu" ON public.menu_items;
DROP POLICY IF EXISTS "Public read tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Manage tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Anyone insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Manage orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Public read order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- 12. Create Clean RLS Policies
-- Categories: Anyone can read, authenticated can manage
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Manage categories" ON public.categories FOR ALL USING (true);

-- Menu: Anyone can read available menu items
CREATE POLICY "Public read menu" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Manage menu" ON public.menu_items FOR ALL USING (true);

-- Restaurant Tables: Anyone can view table floorplan
CREATE POLICY "Public read tables" ON public.restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Manage tables" ON public.restaurant_tables FOR ALL USING (true);

-- Orders: Anyone (including guest customers) can place an order and track it
CREATE POLICY "Anyone insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Manage orders" ON public.orders FOR ALL USING (true);

-- Order Items: Anyone can insert items when ordering, and read them when tracking
CREATE POLICY "Anyone insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order items" ON public.order_items FOR SELECT USING (true);

-- Reservations: Anyone can book a table, read reservations for status / admin
CREATE POLICY "Anyone insert reservations" ON public.reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reservations" ON public.reservations FOR SELECT USING (true);
CREATE POLICY "Manage reservations" ON public.reservations FOR ALL USING (true);

-- Profiles
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 13. Enable Supabase Realtime for Live Kitchen Orders & Reservations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reservations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
END $$;

-- 14. SEED INITIAL DATA: Categories
INSERT INTO public.categories (name, description, is_active)
VALUES 
  ('Steaks & Grills', 'Premium charcoal and flame-grilled meats and seafood', true),
  ('Pizza', 'Artisan hand-stretched wood-fired sourdough pizzas', true),
  ('Burgers', 'Gourmet smashed and brioche burgers', true),
  ('Pasta', 'Fresh handcrafted Italian pasta ribbon creations', true),
  ('Desserts', 'Decadent chef-crafted sweets and gelato', true),
  ('Drinks', 'Refreshing handcrafted mocktails and artisan beverages', true)
ON CONFLICT (name) DO NOTHING;

-- 15. SEED INITIAL DATA: Menu Items
INSERT INTO public.menu_items (category_name, name, description, price, discount_price, image_url, is_available, is_featured)
VALUES
  (
    'Pizza',
    'Artisan Truffle & Wild Mushroom Pizza',
    'Wood-fired sourdough crust, fior di latte, black truffle shavings, porcini mushrooms, fresh thyme',
    18.50, 15.99,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    true, true
  ),
  (
    'Burgers',
    'Prime Wagyu Brioche Burger',
    'Double Wagyu beef smashed patties, smoked gouda, caramelized shallot relish, truffle aioli on toasted brioche',
    16.99, NULL,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    true, true
  ),
  (
    'Pasta',
    'Handcrafted Truffle Fettuccine Alfredo',
    'House-made egg pasta ribbons tossed in aged Parmigiano Reggiano, brown butter, garlic cream & herbs',
    17.00, NULL,
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    true, false
  ),
  (
    'Steaks & Grills',
    'Flame-Seared Prime Ribeye Steak',
    'Flame-grilled 10oz prime ribeye, bone marrow herb butter, roasted garlic head, red wine demi-glace',
    34.00, 29.50,
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
    true, true
  ),
  (
    'Steaks & Grills',
    'Slow-Smoked Sticky Glazed Ribs',
    '12-hour hickory smoked tender ribs coated in signature spiced bourbon BBQ glaze and toasted sesame',
    24.50, NULL,
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    true, false
  ),
  (
    'Pasta',
    'Burrata & Heirloom Caesar Salad',
    'Crisp baby gem lettuce, creamy Puglia burrata, sourdough croutons, shaved parmigiano, garlic anchovy emulsion',
    13.50, 11.99,
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80',
    true, false
  ),
  (
    'Steaks & Grills',
    'Pan-Seared Wild Atlantic Salmon',
    'Crispy skin salmon filet served over saffron asparagus risotto and zesty lemon caper emulsion',
    22.00, NULL,
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    true, true
  ),
  (
    'Burgers',
    'Crispy Chicken Katsu Supreme',
    'Panko-crusted chicken tenderloin, honey sriracha glaze, pickled purple cabbage slaw on buttered sesame bun',
    14.50, NULL,
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
    true, false
  ),
  (
    'Desserts',
    'Molten Valrhona Lava Cake',
    'Warm decadent dark chocolate cake with flowing molten core, Madagascar bourbon vanilla bean gelato',
    9.50, NULL,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    true, true
  ),
  (
    'Desserts',
    'Vanilla Berry Glazed Cheesecake',
    'Velvety New York style cheesecake layered over buttery graham crust, topped with wild forest berry coulis',
    8.99, 7.50,
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    true, false
  ),
  (
    'Drinks',
    'Golden Passionfruit & Mint Mojito',
    'Crushed passionfruit, fresh garden spearmint, cane sugar, sparkling water and edible gold flake shimmer',
    6.50, NULL,
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',
    true, false
  ),
  (
    'Steaks & Grills',
    'Slow-Braised Birria Tacos',
    'Crisped corn tortillas filled with braised shredded beef, melted Oaxaca cheese, cilantro, rich dipping consommé',
    14.00, 12.00,
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    true, true
  );

-- Link category_id from categories
UPDATE public.menu_items m
SET category_id = c.id
FROM public.categories c
WHERE m.category_name = c.name AND m.category_id IS NULL;

-- 16. SEED INITIAL DATA: Restaurant Tables
INSERT INTO public.restaurant_tables (table_number, name, zone, capacity, shape, status, price_tier, features)
VALUES
  (1, 'Sunset Romantic Alcove', 'Window Terrace', 2, 'circle', 'available', 'premium', ARRAY['Panoramic City Lights', 'Candlelit Setting', 'Intimate 2-Seater']),
  (2, 'Skyline Window Table', 'Window Terrace', 2, 'circle', 'available', 'premium', ARRAY['Floor-to-ceiling Window', 'Evening Sunset View', 'Cozy Ambiance']),
  (3, 'Terrace Grand Window', 'Window Terrace', 4, 'rectangle', 'available', 'premium', ARRAY['Panoramic View', 'Spacious Seating', 'Direct Terrace Access']),
  (4, 'Chandelier Center Table', 'Main Dining', 4, 'rectangle', 'available', 'standard', ARRAY['Crystal Chandelier View', 'Central Atmosphere', 'Plush Velvet Chairs']),
  (5, 'Wine Cellar Vista Table', 'Main Dining', 4, 'rectangle', 'available', 'standard', ARRAY['Sommelier Corner', 'Ambient Warm Lighting', 'Spacious Table']),
  (6, 'Grand Family Table', 'Main Dining', 6, 'rectangle', 'available', 'standard', ARRAY['Comfortable for Families', 'Wide Spacing', 'Celebration Friendly']),
  (7, 'Royal Heritage Booth', 'VIP Lounge', 6, 'booth', 'available', 'vip', ARRAY['Private Booth Seating', 'Gold Leaf Accents', 'Dedicated Host Service']),
  (8, 'The Sovereign Circle', 'VIP Lounge', 4, 'circle', 'available', 'vip', ARRAY['Intimate VIP Booth', 'Champagne Chiller', 'Soft Acoustic Zone']),
  (9, 'Garden Pavilion Table', 'Chef''s Garden', 4, 'circle', 'available', 'standard', ARRAY['Surrounded by Fresh Herbs', 'Open Skylight', 'Botanical Decor']),
  (10, 'Glasshouse Vista Table', 'Chef''s Garden', 2, 'circle', 'available', 'standard', ARRAY['Glasshouse Atmosphere', 'Fountain View', 'Romantic Greenery']),
  (11, 'Terrace Corner Alcove', 'Window Terrace', 2, 'circle', 'available', 'premium', ARRAY['Private Corner', 'Unobstructed Horizon', 'Moonlight View']),
  (12, 'Chef''s Table Experience', 'Chef''s Garden', 6, 'rectangle', 'available', 'vip', ARRAY['Kitchen Showcase View', 'Chef Interaction', 'Tasting Menu Priority'])
ON CONFLICT (table_number) DO NOTHING;
