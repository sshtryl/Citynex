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
import { useRouter } from "next/navigation"
import { usePasswordVisibility } from "@/lib/Password"
import Link from "next/link"
import {Alert, CloseButton, Spinner} from "@heroui/react";
import React from "react"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const router = useRouter()
  const passwordVisibility = usePasswordVisibility()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showAlert, setShowAlert] = useState(false) 
  const [alertMessage, setAlertMessage] = useState("") 

  // Auto-hide alert setelah 5 detik
  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false)
        setAlertMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showAlert])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setShowAlert(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Gagal parse JSON:", parseError);
        const errorMsg = "Server error: Invalid response";
        setError(errorMsg);
        setAlertMessage(errorMsg);
        setShowAlert(true);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push("/home")
      } else {
        const errorMessage = data.message || data.error || "Login failed"
        setError(errorMessage)
        setAlertMessage(errorMessage)
        setShowAlert(true) 
      }
    } catch (error) {
      console.error("Network error:", error)
      const errorMsg = "Network error. Please check your connection and try again."
      setError(errorMsg)
      setAlertMessage(errorMsg)
      setShowAlert(true) 
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 bg-black rounded-lg", className)} {...props}>
      <Card className="w-full h-full bg-black border border-white/30 shadow-2xl">
        <CardHeader className="text-center bg-black pb-6">
          <CardTitle className={`${inter.className} text-xl text-white font-semibold`}>Sign In</CardTitle>
          <CardDescription className={`${inter.className} text-sm text-white whitespace-nowrap`}>
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAlert && (
            <div className="mb-6">
              <Alert className={`flex items-start gap-3 p-3 rounded-md border ${error ? 'bg-red-900/40 border-red-600' : 'bg-white/5 border-white/20'} text-white`}>
                <Alert.Indicator className={error ? 'text-red-400' : 'text-blue-400'} />
                <div className="flex-1">
                  <Alert.Content>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Alert.Title className="font-semibold text-white">{error ? 'Error' : 'Info'}</Alert.Title>
                        <Alert.Description className="mt-1 text-sm text-white/90">
                          {alertMessage}
                        </Alert.Description>
                      </div>
                      <div className="shrink-0">
                        <CloseButton aria-label="Close alert" className="text-white/80 hover:text-white" onClick={() => { setShowAlert(false); setAlertMessage(""); }} />
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
                <FieldLabel className={`${inter.className} text-white`} htmlFor="email">
                  Email
                </FieldLabel>
                <Input
                  className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm`}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel className={`${inter.className} text-white flex justify-between items-center`} htmlFor="password">
                  Password
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white">
                    Forgot your password?
                  </Link>
                </FieldLabel>
                <div className="relative">
                  <Input 
                    className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm pr-10`} 
                    id="password" 
                    type={passwordVisibility.type} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={passwordVisibility.toggle} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <passwordVisibility.Icon size={18} />
                  </button>
                </div>
              </Field>
              <Field>
                <Button className={`${inter.className} text-white`} type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className={`${inter.className} bg-black px-3 text-white`}>OR CONTINUE WITH</span>
                  </div>
                </div>
                <Button className={`${inter.className} text-white`} type="button">
                  <img src="/google.png" alt="Google Icon" className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Button>
                <FieldDescription className={`${inter.className} text-white text-center py-4`}>
                  Dont have an account? <Link href="/register">Sign Up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}