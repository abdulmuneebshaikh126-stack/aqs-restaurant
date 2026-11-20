'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    setLoading(false)
    if (error) {
      toast.error('Authentication Failed', {
        description: error.message,
      })
      return
    }

    toast.success(mode === 'login' ? 'Signed in successfully!' : 'Account created successfully!', {
      description: 'Welcome to AQS Restaurant.',
    })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 relative h-20 w-20 overflow-hidden rounded-full border border-primary/40 shadow-xl">
          <Image
            src="/images/logo.jpg"
            alt="AQS Restaurant"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          AQS Restaurant
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-white">
          {mode === 'login' ? 'Welcome Back' : 'Join AQS Dining'}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {mode === 'login' ? 'Sign in to access your orders and reservations' : 'Create an account to begin your journey'}
        </p>
      </div>

      <div className="rounded-2xl bg-[#141418] border border-primary/20 p-8 shadow-xl">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-300 font-medium">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-300 font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-[#0c0c0e] border border-white/10 px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full gold-gradient-bg py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="mt-6 w-full text-center text-xs tracking-wider uppercase text-gray-400 hover:text-primary transition"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  )
}
