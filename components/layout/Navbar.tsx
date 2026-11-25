
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Menu, X, ShoppingCart, User, LogOut, ShieldCheck, Sun, Moon } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/lib/auth/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const baseLinks = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/reservations', label: 'Reservations' },
  { href: '/orders', label: 'Orders' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { itemCount } = useCart()
  const { user, profile, isAdmin, signOut } = useAuth()

  const links = isAdmin
    ? [...baseLinks, { href: '/admin', label: 'Admin' }]
    : baseLinks

  return (
    <header className="sticky top-0 z-50 bg-[var(--secondary)]/95 text-[var(--foreground)] backdrop-blur-md border-b border-primary/20 shadow-lg transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-primary/40 shadow-md transition group-hover:scale-105 group-hover:border-primary">
            <Image src="/images/logo.jpg" alt="APNA-DERA Restaurant Logo" fill sizes="48px" className="object-cover" priority />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider gold-gradient-text">APNA-DERA</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-medium -mt-1">Restaurant</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-[var(--foreground)] opacity-80 hover:opacity-100 hover:text-primary transition font-medium tracking-wide text-sm uppercase">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark and light mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="rounded-full border border-primary/30 p-2 text-primary hover:bg-primary/10 transition"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link href="/cart" className="relative p-2 text-[var(--foreground)] opacity-80 hover:opacity-100 hover:text-primary transition" aria-label="Cart">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-black shadow animate-in zoom-in-50 duration-200">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/account" className="flex items-center gap-2 rounded-full border border-primary/40 bg-[var(--background)] px-4 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-primary transition shadow">
                <div className="flex h-6 w-6 items-center justify-center rounded-full gold-gradient-bg text-black font-bold text-[10px]">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{profile?.full_name || 'My Account'}</span>
                {isAdmin && (
                  <span className="text-[9px] bg-amber-500/20 text-[#E5C158] px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>
                )}
              </Link>
              <button onClick={() => signOut()} title="Sign Out" className="p-2 text-[var(--foreground)] opacity-60 hover:opacity-100 hover:text-red-400 transition">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden rounded-full gold-gradient-bg px-6 py-2 text-sm font-semibold text-black hover:opacity-90 shadow-md transition md:block">
              Login
            </Link>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden text-[var(--foreground)] hover:text-primary p-2" aria-label="Toggle menu">
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
            className="overflow-hidden border-t border-primary/20 bg-[var(--secondary)] md:hidden"
          >
            <nav className="flex flex-col gap-2 px-4 py-4">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-[var(--foreground)] opacity-80 hover:opacity-100 hover:bg-primary/10 hover:text-primary transition font-medium">
                  {l.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary hover:bg-primary/10 transition font-medium">
                    <User className="h-4 w-4" /> My Account ({profile?.full_name || 'Profile'})
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-primary hover:bg-primary/10 transition font-medium">
                      <ShieldCheck className="h-4 w-4" /> Admin Portal
                    </Link>
                  )}
                  <button onClick={() => { setOpen(false); signOut() }} className="flex items-center gap-2 text-left rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10 transition font-medium text-sm">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="mt-2 rounded-full gold-gradient-bg py-2.5 text-center font-semibold text-black shadow">
                  Login / Register
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
