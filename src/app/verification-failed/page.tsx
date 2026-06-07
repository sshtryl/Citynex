"use client";
import React from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerificationFailed() {
  const params = useSearchParams()
  const message = params?.get('message') || 'Verifikasi gagal'

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-6 bg-black/40 rounded text-white max-w-lg">
        <h1 className="text-2xl font-semibold">Verifikasi Gagal</h1>
        <p className="mt-2">{message}</p>
      </div>
    </div>
  )
}
