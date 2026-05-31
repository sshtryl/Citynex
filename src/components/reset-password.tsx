"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Inter } from "next/font/google"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Alert, CloseButton } from "@heroui/react"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

export function Resetpassword({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')


  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      router.replace('/login')
    }
  }, [token, router])


  useEffect(() => {
    if (showAlert || message) {
      const timer = setTimeout(() => {
        setShowAlert(false)
        setAlertMessage('')
        setMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showAlert, message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      setMessage('Token tidak ditemukan')
      setAlertMessage('Token tidak ditemukan')
      setShowAlert(true)
      return
    }
    if (!password || password.length < 6) {
      setMessage('Password minimal 6 karakter')
      setAlertMessage('Password minimal 6 karakter')
      setShowAlert(true)
      return
    }
    if (password !== confirm) {
      setMessage('Passwords do not match')
      setAlertMessage('Passwords do not match')
      setShowAlert(true)
      return
    }

    setLoading(true)
    setShowAlert(false)
    setMessage('')
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message || 'Password berhasil direset')
        setAlertMessage(data.message || 'Password berhasil direset')
        setSuccess(true)
        setShowAlert(true)
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setMessage(data.message || 'Gagal mereset password')
        setAlertMessage(data.message || 'Gagal mereset password')
        setSuccess(false)
        setShowAlert(true)
      }
    } catch (err) {
      setMessage('Network error during reset')
      setAlertMessage('Network error during reset')
      setSuccess(false)
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const displayMessage = message || alertMessage
  const isSuccess = success

  return (
    <div className={cn("flex flex-col gap-6 bg-black rounded-lg", className)} {...props}>
      <Card className="w-full bg-black border border-white/30 shadow-2xl">
        <CardHeader className="relative text-center bg-black pb-6">
           <button
            onClick={() => router.push('/login')}
            className="absolute left-6 top-4 -translate-y-1/2 text-white/80 hover:text-white cursor-pointer transition-colors"
            aria-label="Back to Login"
          >
            <ArrowLeft size={20} />
          </button>
          <CardTitle className={`${inter.className} text-xl text-white font-semibold`}>
            Reset Password
          </CardTitle>
          <CardDescription className={`${inter.className} text-sm text-white/80`}>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAlert && displayMessage && (
            <div className="mb-6">
              <Alert className={`flex items-start gap-3 p-3 rounded-md border ${
                isSuccess 
                  ? 'bg-green-900/40 border-green-600' 
                  : 'bg-red-900/40 border-red-600'
              } text-white`}>
                <Alert.Indicator className={isSuccess ? 'text-green-400' : 'text-red-400'} />
                <div className="flex-1">
                  <Alert.Content>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Alert.Title className={`font-semibold ${
                          isSuccess ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isSuccess ? 'Success!' : 'Error'}
                        </Alert.Title>
                        <Alert.Description className="mt-1 text-sm text-white/90">
                          {displayMessage}
                        </Alert.Description>
                      </div>
                      <div className="shrink-0">
                        <CloseButton 
                          aria-label="Close alert" 
                          className="text-white/80 hover:text-white" 
                          onClick={() => {
                            setShowAlert(false)
                            setMessage('')
                            setAlertMessage('')
                          }} 
                        />
                      </div>
                    </div>
                  </Alert.Content>
                </div>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel className={`${inter.className} text-white`} htmlFor="password">
                  New Password
                </FieldLabel>
                <div className="relative">
                  <Input 
                    className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm pr-10`} 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password (min. 6 characters)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel className={`${inter.className} text-white`} htmlFor="confirm">
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Input 
                    className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm pr-10 ${
                      confirm && password !== confirm 
                        ? 'border-red-500 focus:border-red-500' 
                        : ''
                    }`} 
                    id="confirm" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm your password" 
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-red-400 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
              </Field>

              <Field>
                <Button 
                  className={`${inter.className} text-white w-full`} 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Reset Password"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}