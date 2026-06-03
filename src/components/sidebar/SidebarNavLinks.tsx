"use client";
import { 
  SidebarSection, 
  SidebarLink 
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { Geist } from "next/font/google"
import { BotMessageSquare, House, Form } from 'lucide-react';

const geist = Geist ({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
})

const mainLinks = [
  {
    label: "Home",
    href: "/home",
    icon: <House className={`${geist.className} h-5 w-5`} />,
  },
  {
    label: "Chat",
    href: "/lapor-ai",
    icon: <BotMessageSquare className={`${geist.className} h-5 w-5`} />,
  },
  {
    label: "Form",
    href: "/form",
    icon: <Form className={`${geist.className} h-5 w-5`} />,
  },
];

export function SidebarNavLinks() {
  const pathname = usePathname();
  return (
    <SidebarSection >
      {mainLinks.map((link, idx) => {
        const isActive = pathname === link.href;
        return (
          <SidebarLink
            key={idx}
            link={link}
            className={cn(
              isActive && `${geist.className} bg-black-50 dark:bg-black-900/20 text-black`
            )}
          />
        );
      })}
    </SidebarSection>
  );
}