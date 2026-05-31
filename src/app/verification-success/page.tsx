import React from 'react'
import Link from 'next/link'

export default function VerificationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="p-6 bg-black/40 rounded text-white max-w-lg">
        <h1 className="text-2xl font-semibold">Email Terverifikasi</h1>
        <p className="mt-2">Terima kasih, email Anda telah berhasil diverifikasi. Silakan masuk ke akun Anda.</p>
        <div className="mt-4">
          <Link href="/login" className="px-4 py-2 bg-white text-black rounded">Go to Login</Link>
        </div>
      </div>
    </div>
  )
}
