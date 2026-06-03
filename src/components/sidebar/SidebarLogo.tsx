"use client";
import { motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import { Geist } from "next/font/google"

const geist = Geist ({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
})

interface SidebarLogoProps {
  open: boolean;
}

export function SidebarLogo({ open }: SidebarLogoProps) {
  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shadow-lg bg-primary text-white">
          <GalleryVerticalEnd className="size-4" />
        </div>
        <motion.span
          animate={{
            opacity: open ? 1 : 0,
            display: open ? "inline-block" : "none",
          }}
          className={`${geist.className} text-lg font-semibold bg-black dark:from-white dark:to-gray-400 bg-clip-text text-transparent`}
        >
          Citynex
        </motion.span>
      </div>
    </div>
  );
}