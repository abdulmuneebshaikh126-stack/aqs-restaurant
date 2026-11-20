'use client'
import { useState } from 'react'
import FoodCard from '@/components/menu/FoodCard'
import { MenuItem } from '@/types'
import { useMenuItemsQuery, useCategoriesQuery } from '@/hooks/queries/useMenuQuery'
import { Loader2 } from 'lucide-react'

const menuCategories = [
  'All',
  'Steaks & Grills',
  'Pizza',
  'Burgers',
  'Pasta',
  'Desserts',
  'Drinks',
]

const demoItems: (MenuItem & { categoryName: string })[] = [
  {
    id: '1', category_id: null, categoryName: 'Pizza',
    name: 'Artisan Truffle & Wild Mushroom Pizza',
    description: 'Wood-fired sourdough crust, fior di latte, black truffle shavings, porcini mushrooms, fresh thyme',
    price: 18.50, discount_price: 15.99,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '2', category_id: null, categoryName: 'Burgers',
    name: 'Prime Wagyu Brioche Burger',
    description: 'Double Wagyu beef smashed patties, smoked gouda, caramelized shallot relish, truffle aioli on toasted brioche',
    price: 16.99, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '3', category_id: null, categoryName: 'Pasta',
    name: 'Handcrafted Truffle Fettuccine Alfredo',
    description: 'House-made egg pasta ribbons tossed in aged Parmigiano Reggiano, brown butter, garlic cream & herbs',
    price: 17.00, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    is_available: true, is_featured: false,
  },
  {
    id: '4', category_id: null, categoryName: 'Steaks & Grills',
    name: 'Flame-Seared Prime Ribeye Steak',
    description: 'Flame-grilled 10oz prime ribeye, bone marrow herb butter, roasted garlic head, red wine demi-glace',
    price: 34.00, discount_price: 29.50,
    image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '5', category_id: null, categoryName: 'Steaks & Grills',
    name: 'Slow-Smoked Sticky Glazed Ribs',
    description: '12-hour hickory smoked tender ribs coated in signature spiced bourbon BBQ glaze and toasted sesame',
    price: 24.50, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    is_available: true, is_featured: false,
  },
  {
    id: '6', category_id: null, categoryName: 'Pasta',
    name: 'Burrata & Heirloom Caesar Salad',
    description: 'Crisp baby gem lettuce, creamy Puglia burrata, sourdough croutons, shaved parmigiano, garlic anchovy emulsion',
    price: 13.50, discount_price: 11.99,
    image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80',
    is_available: true, is_featured: false,
  },
  {
    id: '7', category_id: null, categoryName: 'Steaks & Grills',
    name: 'Pan-Seared Wild Atlantic Salmon',
    description: 'Crispy skin salmon filet served over saffron asparagus risotto and zesty lemon caper emulsion',
    price: 22.00, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '8', category_id: null, categoryName: 'Burgers',
    name: 'Crispy Chicken Katsu Supreme',
    description: 'Panko-crusted chicken tenderloin, honey sriracha glaze, pickled purple cabbage slaw on buttered sesame bun',
    price: 14.50, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80',
    is_available: true, is_featured: false,
  },
  {
    id: '9', category_id: null, categoryName: 'Desserts',
    name: 'Molten Valrhona Lava Cake',
    description: 'Warm decadent dark chocolate cake with flowing molten core, Madagascar bourbon vanilla bean gelato',
    price: 9.50, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '10', category_id: null, categoryName: 'Desserts',
    name: 'Vanilla Berry Glazed Cheesecake',
    description: 'Velvety New York style cheesecake layered over buttery graham crust, topped with wild forest berry coulis',
    price: 8.99, discount_price: 7.50,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    is_available: true, is_featured: false,
  },
  {
    id: '11', category_id: null, categoryName: 'Drinks',
    name: 'Golden Passionfruit & Mint Mojito',
    description: 'Crushed passionfruit, fresh garden spearmint, cane sugar, sparkling water and edible gold flake shimmer',
    price: 6.50, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&q=80',
    is_available: true, is_featured: false,
  },
  {
    id: '12', category_id: null, categoryName: 'Steaks & Grills',
    name: 'Slow-Braised Birria Tacos',
    description: 'Crisped corn tortillas filled with braised shredded beef, melted Oaxaca cheese, cilantro, rich dipping consommé',
    price: 14.00, discount_price: 12.00,
    image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    is_available: true, is_featured: true,
  },
]

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const { data: items = demoItems, isLoading } = useMenuItemsQuery(demoItems)
  const { data: categories = menuCategories } = useCategoriesQuery(menuCategories)

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((i) => i.categoryName === activeCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold">
          AQS Culinary Collection
        </span>
        <h1 className="mt-2 font-serif text-4xl font-bold text-white md:text-5xl">
          Our Menu
        </h1>
        <p className="mt-3 text-gray-400">
          Fresh, delicious, and passionately crafted with the finest ingredients.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-12">
        {categories.map((cat) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-5 py-2 text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 ${
                isActive
                  ? 'gold-gradient-bg text-black shadow-lg scale-105'
                  : 'bg-[#141418] border border-primary/20 text-gray-300 hover:text-white hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#C5A059]" />
          <p className="text-sm text-gray-400">Loading delicacies from AQS Kitchen...</p>
        </div>
      ) : (
        /* Food Cards Grid */
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
