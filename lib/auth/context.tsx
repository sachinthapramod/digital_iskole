"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "teacher" | "parent"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  assignedClass?: string // For teachers
  children?: string[] // For parents - array of student IDs
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo purposes
const mockUsers: Record<string, User & { password: string }> = {
  "admin@iskole.lk": {
    id: "1",
    email: "admin@iskole.lk",
    name: "System Administrator",
    role: "admin",
    password: "admin123",
  },
  "teacher@iskole.lk": {
    id: "2",
    email: "teacher@iskole.lk",
    name: "Kumari Perera",
    role: "teacher",
    password: "teacher123",
    assignedClass: "Grade 10-A",
  },
  "parent@iskole.lk": {
    id: "3",
    email: "parent@iskole.lk",
    name: "Nimal Silva",
    role: "parent",
    password: "parent123",
    children: ["student-1", "student-2"],
  },
}

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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockUser = mockUsers[email]
    if (mockUser && mockUser.password === password) {
      const { password: _, ...userWithoutPassword } = mockUser
      setUser(userWithoutPassword)
      localStorage.setItem("digital-iskole-user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("digital-iskole-user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
