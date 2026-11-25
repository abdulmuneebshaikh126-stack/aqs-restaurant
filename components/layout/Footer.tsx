
import Link from 'next/link'
import Image from 'next/image'
import { RESTAURANT_CONFIG } from '@/lib/config/restaurant'

export default function Footer() {
  return (
    <footer className="bg-[var(--secondary)] text-[var(--foreground)] mt-20 border-t border-primary/20 transition-colors duration-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-primary/50 shadow-lg">
              <Image
                src="/images/logo.jpg"
                alt="APNA DERA Restaurant"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold gold-gradient-text tracking-wide">
                APNA DERA
              </h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary -mt-1">
                Restaurant
              </p>
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
            Good Food • Good Mood
          </p>

          <p className="text-sm text-[var(--foreground)] opacity-70 leading-relaxed">
            Where culinary passion meets sophisticated taste. Crafting memorable dining experiences with the finest ingredients.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-[var(--foreground)] tracking-wider">
            Explore
          </h4>
          <ul className="space-y-2.5 text-sm text-[var(--foreground)] opacity-75">
            <li><Link href="/menu" className="hover:text-primary transition">Our Menu</Link></li>
            <li><Link href="/reservations" className="hover:text-primary transition">Book a Table & Chairs</Link></li>
            <li><Link href="/cart" className="hover:text-primary transition">Your Cart</Link></li>
            <li><Link href="/orders" className="hover:text-primary transition">Track Orders</Link></li>
            <li><Link href="/admin" className="hover:text-primary transition text-[#C5A059] font-medium">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-[var(--foreground)] tracking-wider">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm text-[var(--foreground)] opacity-75">
            <li>{RESTAURANT_CONFIG.address}</li>
            <li>{RESTAURANT_CONFIG.phone}</li>
            <li>{RESTAURANT_CONFIG.email}</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-[var(--foreground)] tracking-wider">
            Opening Hours
          </h4>
          <ul className="space-y-2.5 text-sm text-[var(--foreground)] opacity-75">
            <li><span className="font-medium opacity-100">Mon – Thu:</span> 11:00 AM – 11:00 PM</li>
            <li><span className="font-medium opacity-100">Fri – Sat:</span> 11:00 AM – 12:00 AM</li>
            <li><span className="font-medium opacity-100">Sun:</span> 12:00 PM – 10:00 PM</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-primary/20 py-6 text-center text-xs tracking-wider text-[var(--foreground)] opacity-60">
        © {new Date().getFullYear()} APNA DERA Restaurant. All rights reserved.
      </div>
    </footer>
  )
}
