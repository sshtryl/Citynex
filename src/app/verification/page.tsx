"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Alert, CloseButton } from '@heroui/react'

export default function VerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage('Token tidak ditemukan di URL')
      setSuccess(false)
      setLoading(false)
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-email?token=${encodeURIComponent(token)}`, {
          headers: { Accept: 'application/json' },
        })
        const data = await res.json()
        if (res.ok) {
          setMessage(data.message || 'Verifikasi berhasil')
          setSuccess(true)
          // optionally redirect to login after short delay
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setMessage(data.message || 'Verifikasi gagal')
          setSuccess(false)
        }
      } catch (err) {
        setMessage('Terjadi kesalahan jaringan saat verifikasi')
        setSuccess(false)
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-xl w-full p-6">
        {loading ? (
          <p className="text-white">Verifying...</p>
        ) : (
          <div>
            <Alert className={`p-4 ${success ? 'bg-green-900/40 border border-green-600' : 'bg-red-900/40 border border-red-600'} text-white`}> 
              <Alert.Content>
                <Alert.Title>{success ? 'Verifikasi Berhasil' : 'Verifikasi Gagal'}</Alert.Title>
                <Alert.Description className="mt-2">{message}</Alert.Description>
              </Alert.Content>
              <CloseButton onClick={() => { setMessage(''); }} />
            </Alert>
            <div className="mt-6 text-center">
              <button className="px-4 py-2 bg-white text-black rounded" onClick={() => router.push('/login')}>Go to Login</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
