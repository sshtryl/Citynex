import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UseAuthOptions {
  redirectTo?: string
  required?: boolean
}

export function useAuth({ redirectTo = '/login', required = true }: UseAuthOptions = {}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        if (required) {
          router.replace(redirectTo)
        }
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
        // Gunakan endpoint /home yang sudah ada dengan authMiddleware
        const response = await fetch(`${apiUrl}/home`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Data dari response: { success: true, message, user }
          setUser(data.user || JSON.parse(localStorage.getItem('user') || '{}'))
          setIsAuthenticated(true)
        } else {
          // Token invalid atau expired
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (required) {
            router.replace(redirectTo)
          }
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (required) {
          router.replace(redirectTo)
        }
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo, required])

  return { isAuthenticated, isLoading, user }
}