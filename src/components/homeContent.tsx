"use client"
import { useAuth } from "@/lib/useAuth"
import { Mail } from 'lucide-react'
import { useRouter } from "next/navigation"

export function HomeContent() {
  const router = useRouter()
  const { user } = useAuth({ required: true })


  return (
    <div className="min-h-screen bg-white">

    </div>
  )
}