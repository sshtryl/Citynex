import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { GalleryVerticalEnd } from "lucide-react"
import { Geist } from "next/font/google"
import Link from 'next/link';

const geist = Geist ({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-geist",
    })

export default function ForgotPassword() {
    return (
        <>
         <div className="bg-black flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className={`${geist.className} flex items-center gap-2 self-center text-white text-2xl font-semibold`}>
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Citynex
        </Link>
        <ForgotPasswordForm />
      </div>
    </div>
        </>
    )
}