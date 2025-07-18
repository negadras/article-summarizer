import {useEffect, useState} from 'react'
import {useLocation} from 'wouter'
import {Button} from '../components/ui/button'
import {LoginForm} from '../components/auth/login-form'
import {RegisterForm} from '../components/auth/register-form'
import {useAuth} from '../hooks/use-auth'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [, setLocation] = useLocation()
  const { isAuthenticated } = useAuth()

  // Check for mode parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode')
    if (modeParam === 'register') {
      setMode('register')
    }
  }, [])

  if (isAuthenticated) {
    setLocation('/')
    return null
  }

  const handleAuthSuccess = () => {
    setLocation('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center space-x-4 mb-8">
            <Button
              variant={mode === 'login' ? 'default' : 'ghost'}
              onClick={() => setMode('login')}
            >
              Login
            </Button>
            <Button
              variant={mode === 'register' ? 'default' : 'ghost'}
              onClick={() => setMode('register')}
            >
              Register
            </Button>
          </div>
        </div>

        {mode === 'login' ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <RegisterForm onSuccess={handleAuthSuccess} />
        )}
      </div>
    </div>
  )
}
