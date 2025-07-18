import {useEffect, useState} from 'react'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const API_BASE_URL = 'http://localhost:8080/api'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false })
        return
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const user = await response.json()
        setAuthState({ user, isLoading: false, isAuthenticated: true })
      } else {
        localStorage.removeItem('authToken')
        setAuthState({ user: null, isLoading: false, isAuthenticated: false })
      }
    } catch (error) {
      localStorage.removeItem('authToken')
      setAuthState({ user: null, isLoading: false, isAuthenticated: false })
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        const user = {
          id: data.username,
          username: data.username,
          email: data.email,
          role: data.role,
        }
        setAuthState({ user, isLoading: false, isAuthenticated: true })
        return { success: true }
      } else {
        return { success: false, error: 'Invalid credentials' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('authToken', data.token)
        const user = {
          id: data.username,
          username: data.username,
          email: data.email,
          role: data.role,
        }
        setAuthState({ user, isLoading: false, isAuthenticated: true })
        return { success: true }
      } else {
        return { success: false, error: 'Registration failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setAuthState({ user: null, isLoading: false, isAuthenticated: false })
  }

  return {
    ...authState,
    login,
    register,
    logout,
    checkAuthStatus,
  }
}
