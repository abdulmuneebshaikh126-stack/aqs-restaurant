'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600',
    heading: 'Delicious Food, Delivered Fresh',
    description: 'Experience amazing flavors made with fresh ingredients.',
    cta: { text: 'Explore Menu', href: '/menu' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1600',
    heading: 'Taste the Difference',
    description: "Discover our chef's special dishes.",
    cta: { text: 'Order Now', href: '/menu' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600',
    heading: 'Your Favorite Food, Your Way',
    description: 'Enjoy delicious meals at your convenience.',
    cta: { text: 'Book a Table', href: '/reservations' },
  },
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduce = useReducedMotion()

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
    []
  )

  useEffect(() => {
    if (paused || reduce) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [paused, next, reduce])

  const s = slides[current]

  return (
    <section
      className="relative h-[85vh] min-h-[560px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.7 }}
          className="absolute inset-0"
        >
          <Image
            src={s.image}
            alt={s.heading}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="relative z-10 flex h-full max-w-3xl flex-col items-start justify-center px-6 md:px-16 lg:px-24">
            <motion.h1
              initial={reduce ? false : { y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="font-serif text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
            >
              {s.heading}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-4 text-lg text-gray-200 md:text-xl font-light tracking-wide"
            >
              {s.description}
            </motion.p>
            <motion.div
              initial={reduce ? false : { y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8"
            >
              <Link
                href={s.cta.href}
                className="inline-block rounded-full gold-gradient-bg px-8 py-4 text-base font-semibold text-black shadow-xl transition hover:opacity-90 hover:scale-105"
              >
                {s.cta.text}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm hover:bg-white/40"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 backdrop-blur-sm hover:bg-white/40"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === current ? 'w-8 bg-primary' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
