'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { showErrorAlert, showSuccessAlert } from '@/lib/utils/sweetalert'
import { Loader2, Lock, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Validation Error', {
        description: 'New password must be at least 6 characters long.',
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error('Validation Error', {
        description: 'Passwords do not match.',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      setLoading(false)

      if (error) {
        showErrorAlert('Password Update Failed', error.message)
        return
      }

      setCompleted(true)
      showSuccessAlert(
        'Password Updated!',
        'Your password has been successfully updated. You may now sign in with your new credentials.'
      )
    } catch (err: any) {
      setLoading(false)
      showErrorAlert('Error', err.message || 'Failed to update password.')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 relative h-20 w-20 overflow-hidden rounded-full border border-primary/40 shadow-xl">
          <Image
            src="/images/logo.jpg"
            alt="APNA DERA Restaurant"
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
          APNA DERA Restaurant
        </span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-[var(--foreground)]">
          Create New Password
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Enter your new secure password below to regain full access.
        </p>
      </div>

      <div className="rounded-2xl bg-[var(--surface)] border border-primary/20 p-8 shadow-xl">
        {completed ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[var(--foreground)]">Password Changed</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your account password has been updated securely.
            </p>
            <Link
              href="/login"
              className="mt-4 block w-full rounded-full gold-gradient-bg py-3.5 font-semibold text-black transition hover:opacity-90 shadow-md text-center"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wider text-[var(--muted)] font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--muted-foreground)]" />
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[var(--input)] border border-[var(--border)] pl-10 pr-4 py-3 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full gold-gradient-bg py-3.5 font-semibold text-black shadow-lg transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                'Save New Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
