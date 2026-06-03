import { SidebarWrapper } from "@/components/SidebarWrapper";
import { Geist } from "next/font/google"

const geist = Geist ({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
})

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex h-screen w-full overflow-hidden bg-white ${geist.className}`}>
      <SidebarWrapper />  
        <div className="md:hidden h-14" /> 
        {children}
    </div>
  );
}