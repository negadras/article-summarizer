// Custom auth implementation for Spring Boot backend
export interface User {
  id: string
  username: string
  email: string
  role: string
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
}