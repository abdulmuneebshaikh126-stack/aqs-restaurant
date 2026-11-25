
import HeroSlider from '@/components/hero/HeroSlider'
import FoodCard from '@/components/menu/FoodCard'
import Link from 'next/link'
import Image from 'next/image'
import { MenuItem } from '@/types'

const categories = [
  { name: 'Artisan Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', count: 'Wood-fired' },
  { name: 'Gourmet Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', count: 'Prime Wagyu' },
  { name: 'Handcrafted Pasta', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', count: 'Fresh Ribbons' },
  { name: 'Steaks & Grills', image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500&q=80', count: 'Charred Cuts' },
  { name: 'Decadent Desserts', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', count: 'Artisan Sweets' },
  { name: 'Artisan Drinks', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&q=80', count: 'Crafted Elixirs' },
]

const featuredDishes: MenuItem[] = [
  {
    id: '4', category_id: null,
    name: 'Flame-Seared Prime Ribeye Steak',
    description: 'Flame-grilled 10oz prime ribeye, bone marrow herb butter, roasted garlic head, red wine demi-glace',
    price: 34.00, discount_price: 29.50,
    image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '2', category_id: null,
    name: 'Prime Wagyu Brioche Burger',
    description: 'Double Wagyu beef smashed patties, smoked gouda, caramelized shallot relish, truffle aioli on toasted brioche',
    price: 16.99, discount_price: null,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    is_available: true, is_featured: true,
  },
  {
    id: '1', category_id: null,
    name: 'Artisan Truffle & Wild Mushroom Pizza',
    description: 'Wood-fired sourdough crust, fior di latte, black truffle shavings, porcini mushrooms, fresh thyme',
    price: 18.50, discount_price: 15.99,
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    is_available: true, is_featured: true,
  },
]

const why = [
  { title: 'Fresh Ingredients', desc: 'Handpicked local produce and premium artisan ingredients.' },
  { title: 'Fast Delivery', desc: 'Hot and fresh dishes delivered directly to your doorstep.' },
  { title: 'Master Chefs', desc: 'Every culinary creation crafted with passion and precision.' },
  { title: 'Easy Reservations', desc: 'Seamless online table booking with instant confirmation.' },
]

const testimonials = [
  { name: 'Ayesha K.', text: 'The ambience and food quality at APNA-DERA are unmatched. Best dining experience in town!', rating: 5 },
  { name: 'Bilal M.', text: 'Fast delivery and unbelievable taste. The gourmet burger is to die for.', rating: 5 },
  { name: 'Sara R.', text: 'The table reservation system was so smooth. Our anniversary dinner was unforgettable.', rating: 5 },
]

export default function HomePage() {
  return (
    <>
      <HeroSlider />

      <section className="relative overflow-hidden bg-[var(--secondary)] py-16 border-b border-primary/20 transition-colors duration-300">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          <div className="mx-auto mb-6 relative h-28 w-28 overflow-hidden rounded-full border-2 border-primary/50 shadow-2xl shadow-primary/20">
            <Image src="/images/logo.jpg" alt="APNA-DERA Restaurant" fill sizes="112px" className="object-cover" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold">Welcome to</span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-wide md:text-5xl gold-gradient-text">APNA-DERA Restaurant</h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--foreground)] opacity-70">Good Food • Good Mood</p>
          <div className="mx-auto my-6 h-[1px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <p className="mx-auto max-w-2xl text-base text-[var(--foreground)] opacity-80 md:text-lg leading-relaxed font-light">
            Indulge in a curated symphony of extraordinary flavors. At APNA-DERA Restaurant, we fuse culinary artistry with modern dining excellence to bring unforgettable moments to every plate.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">Explore Categories</span>
          <h2 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">Popular Selections</h2>
          <p className="mt-2 text-[var(--foreground)] opacity-70">Discover our signature culinary categories crafted with passion.</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.name} href="/menu" className="group relative h-56 overflow-hidden rounded-2xl border border-primary/20 shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/10">
              <Image src={c.image} alt={c.name} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity group-hover:opacity-85" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-center">
                <span className="font-serif text-base font-bold text-white transition group-hover:text-primary">{c.name}</span>
                <span className="mt-1 text-[11px] uppercase tracking-wider text-[#C5A059] font-medium">{c.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[var(--secondary)] py-20 border-y border-primary/20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">Chef&apos;s Signature</span>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">Featured Dishes</h2>
            <p className="mt-2 text-[var(--foreground)] opacity-70">Award-winning recipes prepared by our master chefs.</p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDishes.map((dish) => <FoodCard key={dish.id} item={dish} />)}
          </div>
          <div className="mt-14 text-center">
            <Link href="/menu" className="inline-block rounded-full gold-gradient-bg px-9 py-3.5 text-base font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-105">Explore Full Menu</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">The APNA-DERA Promise</span>
          <h2 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">Why Dine With Us</h2>
          <p className="mt-2 text-[var(--foreground)] opacity-70">Delivering excellence in every bite and every interaction.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {why.map((w, index) => (
            <div key={w.title} className="rounded-2xl bg-[var(--secondary)] border border-primary/20 p-8 shadow-md transition hover:border-primary/50">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">0{index + 1}</div>
              <h3 className="font-serif text-lg font-semibold text-[var(--foreground)]">{w.title}</h3>
              <p className="mt-2 text-sm text-[var(--foreground)] opacity-70 leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--secondary)] py-20 border-y border-primary/20 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">Guest Reviews</span>
            <h2 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)] md:text-4xl">What Diners Say</h2>
            <p className="mt-2 text-[var(--foreground)] opacity-70">Stories and praise from our valued guests.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl bg-[var(--background)] border border-primary/20 p-8 shadow-md">
                <div className="mb-4 text-primary tracking-widest text-lg">{'★'.repeat(t.rating)}</div>
                <p className="text-[var(--foreground)] opacity-80 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-6 font-serif font-semibold text-primary">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--secondary)] to-[var(--background)] border border-primary/40 p-10 text-center shadow-2xl md:p-16">
          <div className="mx-auto max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A059] font-semibold">Fine Dining Experience</span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-[var(--foreground)] md:text-5xl">Reserve Your Table</h2>
            <p className="mt-4 text-[var(--foreground)] opacity-80 leading-relaxed font-light">
              Join us for an unforgettable lunch or dinner. Book in seconds with instant confirmation.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/reservations" className="rounded-full gold-gradient-bg px-9 py-4 font-semibold text-black shadow-lg transition hover:opacity-90 hover:scale-105">Book a Table</Link>
              <Link href="/menu" className="rounded-full border border-primary/50 px-8 py-4 font-semibold text-primary hover:bg-primary/10 transition">View Menu</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
