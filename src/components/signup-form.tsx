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
import { Inter }  from "next/font/google"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Alert, CloseButton } from "@heroui/react"


const inter = Inter ({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})
import { usePasswordVisibility } from "@/lib/Password"
import Link from "next/link"


export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {


  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error">("error")
  const passwordVisibility = usePasswordVisibility()
  const confirmPasswordVisibility = usePasswordVisibility()


  // valudasi
 const validateForm = () => {
    // Validasi name
    if (!name.trim()) {
      setAlertMessage("Name is required")
      setAlertType("error")
      setShowAlert(true)
      return false
    }

    // Validasi email
    if (!email.trim()) {
      setAlertMessage("Email is required")
      setAlertType("error")
      setShowAlert(true)
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setAlertMessage("Please enter a valid email address")
      setAlertType("error")
      setShowAlert(true)
      return false
    }

    // Validasi password
    if (!password) {
      setAlertMessage("Password is required")
      setAlertType("error")
      setShowAlert(true)
      return false
    }

    if (password.length < 6) {
      setAlertMessage("Password must be at least 6 characters")
      setAlertType("error")
      setShowAlert(true)
      return false
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match")
      setAlertType("error")
      setShowAlert(true)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowAlert(false)

    if (validateForm()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        })

        if (response.ok) {
          setAlertMessage("Account created successfully! Redirecting to login...")
          setAlertType("success")
          setShowAlert(true)
          setTimeout(() => {
            router.push("/login")
          }, 2000)
        } else {
          const data = await response.json()
          const errorMessage = data.message || data.error || "Registration failed"
          setAlertMessage(errorMessage)
          setAlertType("error")
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Network error:", error)
        setAlertMessage("Network error. Please check your connection and try again.")
        setAlertType("error")
        setShowAlert(true)
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
        }
    }

  return (
    <div className={cn("flex flex-col gap-6 bg-blackrounded-lg ", className)} {...props}>
      <Card className="w-full h-full bg-black border border-white/30 shadow-2xl">
        <CardHeader className="text-center bg-black pb-6">
          <CardTitle className={`${inter.className} text-xl text-white font-semibold`}>Create your account</CardTitle>
          <CardDescription className={`${inter.className} text-sm text-white`}>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
           {showAlert && (
            <div className="mb-6">
              <Alert className={`flex items-start gap-3 p-3 rounded-md border ${
                alertType === 'success' 
                  ? 'bg-green-900/40 border-green-600' 
                  : 'bg-red-900/40 border-red-600'
              } text-white`}>
                <Alert.Indicator className={alertType === 'success' ? 'text-green-400' : 'text-red-400'} />
                <div className="flex-1">
                  <Alert.Content>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Alert.Title className={`font-semibold ${
                          alertType === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {alertType === 'success' ? 'Success!' : 'Error'}
                        </Alert.Title>
                        <Alert.Description className="mt-1 text-sm text-white/90">
                          {alertMessage}
                        </Alert.Description>
                      </div>
                      <div className="shrink-0">
                        <CloseButton 
                          aria-label="Close alert" 
                          className="text-white/80 hover:text-white" 
                          onClick={() => {
                            setShowAlert(false)
                            setAlertMessage("")
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
                <FieldLabel className={`${inter.className} text-white`} htmlFor="name">
                  Name
                </FieldLabel>
                <Input className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm`} id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
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
                  <Field>
                    <FieldLabel className={`${inter.className} text-white`} htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                    <Input className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm`} id="password" type={passwordVisibility.type} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={passwordVisibility.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" >
                       <passwordVisibility.Icon size={18} />
                      </button>
                      </div>
                  </Field>
                  <Field className="mt-4">
                    <FieldLabel className={`${inter.className} text-white`} htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                    <Input className={`${inter.className} text-white border border-white/30 shadow-2xl rounded-sm`} id="confirm-password" type={confirmPasswordVisibility.type} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" onClick={confirmPasswordVisibility.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" >
                       <confirmPasswordVisibility.Icon size={18} />
                      </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
                  </Field>
              </Field>
              <Field>
                <Button className={`${inter.className} text-white`} type="submit">
                  Create Account
                </Button>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className={`${inter.className} bg-black px-3 text-white`}>Or continue with</span>
                  </div>
                </div>
                <Button className={`${inter.className} text-white`}>
                  <img src="/google.png" alt="Google Icon" className="w-4 h-4 mr-2" />
                  Sign in with Google
                </Button>
                <FieldDescription className={`${inter.className} text-white text-center py-4`}>
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
