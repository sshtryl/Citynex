"use client"
import { useAuth } from "@/lib/useAuth"


interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth({ redirectTo, required: true })

  if (isLoading) {
    return null
  }

  if (!isAuthenticated) {
    return null 
  }

  return <>{children}</>
}