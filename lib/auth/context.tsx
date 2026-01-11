"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "teacher" | "parent"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  phone?: string
  profilePicture?: string
  assignedClass?: string // For teachers
  children?: string[] // For parents - array of student IDs
}

export interface LoginError {
  message: string
  code?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: LoginError }>
  logout: () => Promise<void>
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("digital-iskole-user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("digital-iskole-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: LoginError }> => {
    setIsLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setIsLoading(false)
        return {
          success: false,
          error: {
            message: data.message || data.error?.message || 'Invalid email or password',
            code: data.code || data.error?.code,
          },
        }
      }

      // Store user data and token
      const { user, token, refreshToken } = data.data
      setUser(user)
      localStorage.setItem("digital-iskole-user", JSON.stringify(user))
      localStorage.setItem("digital-iskole-token", token)
      localStorage.setItem("digital-iskole-refresh-token", refreshToken)
      
      setIsLoading(false)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      setIsLoading(false)
      return {
        success: false,
        error: {
          message: error.message || 'Network error. Please try again.',
        },
      }
    }
  }

  const logout = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const token = localStorage.getItem("digital-iskole-token")
      
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore errors on logout
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem("digital-iskole-user")
      localStorage.removeItem("digital-iskole-token")
      localStorage.removeItem("digital-iskole-refresh-token")
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem("digital-iskole-user", JSON.stringify(userData))
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
