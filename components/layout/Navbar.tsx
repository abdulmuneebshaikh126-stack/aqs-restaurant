'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/reservations', label: 'Reservations' },
  { href: '/orders', label: 'Orders' },
  { href: '/admin', label: 'Admin' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-[#0c0c0e]/95 backdrop-blur-md border-b border-primary/20 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary/40 shadow-md transition group-hover:scale-105 group-hover:border-primary">
            <Image
              src="/images/logo.jpg"
              alt="AQS Restaurant Logo"
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-wider gold-gradient-text">
              AQS
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium -mt-1">
              Restaurant
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-300 hover:text-primary transition font-medium tracking-wide text-sm uppercase"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-gray-300 hover:text-primary transition" aria-label="Cart">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-black shadow">
                {itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full gold-gradient-bg px-6 py-2 text-sm font-semibold text-black hover:opacity-90 shadow-md transition md:block"
          >
            Login
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-300 hover:text-primary p-2"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-primary/20 bg-[#121214] md:hidden"
          >
            <nav className="flex flex-col gap-2 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-gray-200 hover:bg-[#1a1a20] hover:text-primary transition font-medium"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full gold-gradient-bg py-2.5 text-center font-semibold text-black shadow"
              >
                Login
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
