'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserProfile } from '@/types'
import { getUserProfile } from '@/lib/supabase/database'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  role: 'customer' | 'admin'
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: 'customer',
  isAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null)
      return
    }

    try {
      const p = await getUserProfile(u.id)
      if (p) {
        setProfile(p)
      } else {
        // Fallback default profile from user metadata
        setProfile({
          id: u.id,
          full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Guest',
          phone: u.user_metadata?.phone || null,
          email: u.email,
          role: (u.user_metadata?.role as 'admin' | 'customer') || 'customer',
        })
      }
    } catch {
      setProfile({
        id: u.id,
        full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Guest',
        phone: u.user_metadata?.phone || null,
        email: u.email,
        role: 'customer',
      })
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        const currentUser = session?.user || null
        setUser(currentUser)
        await loadProfile(currentUser)
      } catch (err) {
        console.warn('Auth initialization notice:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const currentUser = session?.user || null
      setUser(currentUser)
      await loadProfile(currentUser)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Sign out notice:', e)
    }
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user)
    }
  }

  const role = profile?.role || 'customer'
  const isAdmin = role === 'admin'

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
