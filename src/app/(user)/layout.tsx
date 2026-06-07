import { SidebarWrapper } from "@/components/sidebarwrapper";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
});

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`flex h-screen w-full bg-white ${geist.className}`}>
      <SidebarWrapper />
      <div className="flex-1 overflow-auto">
        <div className="md:hidden h-14" />
        {children}
      </div>
    </div>
  );
}
