"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) {
            router.replace('/login')
            return
        }

        const check = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/home`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                })
                if (res.status === 200) {
                    // allowed
                    setLoading(false)
                } else {
                    // token invalid or not verified
                    localStorage.removeItem('token')
                    router.replace('/login')
                }
            } catch (err) {
                console.error('Error checking auth:', err)
                localStorage.removeItem('token')
                router.replace('/login')
            }
        }

        check()
    }, [router])

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>

    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            <h1 className="text-2xl">Welcome to Home</h1>
        </div>
    )
}