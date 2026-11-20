import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-[#08080a] text-gray-300 mt-20 border-t border-primary/20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-primary/50 shadow-lg">
              <Image
                src="/images/logo.jpg"
                alt="AQS Restaurant"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold gold-gradient-text tracking-wide">
                AQS
              </h3>
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary -mt-1">
                Restaurant
              </p>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
            Good Food • Good Mood
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Where culinary passion meets sophisticated taste. Crafting memorable dining experiences with the finest ingredients.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-white tracking-wider">
            Explore
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link href="/menu" className="hover:text-primary transition">Our Menu</Link></li>
            <li><Link href="/reservations" className="hover:text-primary transition">Book a Table & Chairs</Link></li>
            <li><Link href="/cart" className="hover:text-primary transition">Your Cart</Link></li>
            <li><Link href="/orders" className="hover:text-primary transition">Track Orders</Link></li>
            <li><Link href="/admin" className="hover:text-primary transition text-[#E5C158] font-medium">Admin Portal</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-white tracking-wider">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li>123 Luxury Avenue, Gourmet District</li>
            <li>+92 300 1234567</li>
            <li>contact@aqsrestaurant.com</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-serif text-lg font-semibold text-white tracking-wider">
            Opening Hours
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><span className="text-gray-200">Mon – Thu:</span> 11:00 AM – 11:00 PM</li>
            <li><span className="text-gray-200">Fri – Sat:</span> 11:00 AM – 12:00 AM</li>
            <li><span className="text-gray-200">Sun:</span> 12:00 PM – 10:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs tracking-wider text-gray-500">
        © {new Date().getFullYear()} AQS Restaurant. All rights reserved.
      </div>
    </footer>
  )
}
