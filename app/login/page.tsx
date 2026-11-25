'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'
import { toast } from 'sonner'
import { showErrorAlert, showSuccessAlert } from '@/lib/utils/sweetalert'
import { Loader2, ArrowLeft, Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { user, refreshProfile } = useAuth()

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  // If already logged in, redirect to home or account
  useEffect(() => {
    if (user && mode !== 'forgot') {
      router.push('/account')
    }
  }, [user, router, mode])

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address.',
      })
      return
    }

    // 1. FORGOT PASSWORD MODE
    if (mode === 'forgot') {
      setLoading(true)
      try {
        const redirectUrl = `${window.location.origin}/reset-password`
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
        })
        setLoading(false)

        if (error) {
          showErrorAlert('Password Reset Request Failed', error.message)
          return
        }

        setResetSent(true)
        showSuccessAlert(
          'Reset Link Dispatched',
          `We have sent instructions to reset your password to ${email}. Please check your inbox and spam folder.`
        )
      } catch (err: any) {
        setLoading(false)
        showErrorAlert('Error', err.message || 'Unable to process reset request.')
      }
      return
    }

    // 2. SIGNUP MODE
    if (mode === 'signup') {
      if (!fullName.trim() || fullName.trim().length < 2) {
        toast.error('Validation Error', { description: 'Please enter your full name.' })
        return
      }
      if (!phone.trim() || phone.trim().length < 7) {
        toast.error('Validation Error', { description: 'Please enter a valid phone number.' })
        return
      }
      if (password.length < 6) {
        toast.error('Weak Password', { description: 'Password must be at least 6 characters.' })
        return
      }
      if (password !== confirmPassword) {
        toast.error('Password Mismatch', { description: 'Passwords do not match.' })
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'customer',
            },
          },
        })

        if (error) {
          setLoading(false)
          // Duplicate account handling
          if (
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('unique')
          ) {
            showErrorAlert(
              'Account Already Exists',
              'An account with this email address is already registered. Please sign in instead.'
            )
            setMode('login')
          } else {
            showErrorAlert('Registration Failed', error.message)
          }
          return
        }

        // Try direct profile insert in case trigger didn't fire
        if (data.user) {
          try {
            await supabase.from('profiles').insert({
              id: data.user.id,
              full_name: fullName.trim(),
              phone: phone.trim(),
              role: 'customer',
            })
          } catch {}
        }

        setLoading(false)
        await refreshProfile()

        toast.success('Account Created Successfully!', {
          description: `Welcome to APNA-DERA Restaurant, ${fullName}!`,
        })

        router.push('/account')
        router.refresh()
      } catch (err: any) {
        setLoading(false)
        showErrorAlert('Signup Error', err.message || 'Something went wrong.')
      }
      return
    }

    // 3. LOGIN MODE
    if (mode === 'login') {
      if (!password) {
        toast.error('Validation Error', { description: 'Please enter your password.' })
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        setLoading(false)

        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            showErrorAlert(
              'Invalid Credentials',
              'The email or password you entered is incorrect. Please verify and try again.'
            )
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            showErrorAlert(
              'Email Not Confirmed',
              'Please verify your email address via the confirmation link sent to your inbox.'
            )
          } else {
            showErrorAlert('Login Failed', error.message)
          }
          return
        }

        await refreshProfile()

        // Check user role for proper welcome message
        const userRole = data.user?.user_metadata?.role
        if (userRole === 'admin') {
          toast.success('Welcome Back, Administrator!', {
            description: 'Access granted to APNA-DERA Management Portal.',
          })
          router.push('/admin')
        } else {
          toast.success('Signed in successfully!', {
            description: 'Welcome back to APNA-DERA Restaurant.',
          })
          router.push('/account')
        }
        router.refresh()
      } catch (err: any) {
        setLoading(false)
        showErrorAlert('Authentication Error', err.message || 'Failed to sign in.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 relative h-20 w-20 overflow-hidden rounded-full border border-primary/40 shadow-xl">
          <Image
            src="/images/logo.jpg"
            alt="APNA-DERA Restaurant"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          APNA-DERA Restaurant
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)]">
          {mode === 'login'
            ? 'Welcome Back'
            : mode === 'signup'
            ? 'Join APNA-DERA Dining'
            : 'Reset Password'}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {mode === 'login'
            ? 'Sign in to access your orders and reservations'
            : mode === 'signup'
            ? 'Create an account to begin your luxury dining journey'
            : 'Enter your email to receive a password reset link'}
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-8 shadow-xl">
        {mode === 'forgot' && resetSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">Check Your Inbox</h3>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              We sent a password reset link to <span className="text-[#C5A059]">{email}</span>. Click the link in that email to reset your password.
            </p>
            <button
              onClick={() => {
                setResetSent(false)
                setMode('login')
              }}
              className="mt-4 w-full rounded-full gold-gradient-bg py-3 font-semibold text-black transition hover:opacity-90 shadow-md"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign up only) */}
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="e.g. Alexander Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            {/* Phone Number (Sign up only) */}
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="tel"
                    placeholder="e.g. +92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Password (Login & Sign up) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#C5A059] hover:underline transition"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password (Sign up only) */}
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full gold-gradient-bg py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : mode === 'login' ? (
                'Sign In'
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        {/* Mode switcher tabs */}
        <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 text-center">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-xs tracking-wider uppercase text-[var(--muted-foreground)] hover:text-primary transition"
            >
              Don&apos;t have an account? <span className="text-[#C5A059] font-semibold">Sign Up</span>
            </button>
          ) : mode === 'signup' ? (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs tracking-wider uppercase text-[var(--muted-foreground)] hover:text-primary transition"
            >
              Already have an account? <span className="text-[#C5A059] font-semibold">Sign In</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs tracking-wider uppercase text-[var(--muted-foreground)] hover:text-primary transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
