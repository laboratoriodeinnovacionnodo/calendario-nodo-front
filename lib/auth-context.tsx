'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User, UserRole } from '@/types'
import { api } from './api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeToken(token: string): { sub: string; email: string; rol: UserRole } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/login')
  }, [router])

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      const decoded = decodeToken(token)
      if (decoded) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          logout()
        }
      } else {
        logout()
      }
    }
    setIsLoading(false)
  }, [logout])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    router.push('/dashboard')
  }

  const register = async (nombre: string, email: string, password: string) => {
    const response = await api.register(nombre, email, password)
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    setUser(response.user)
    router.push('/dashboard')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isAdmin: user?.rol === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
