"use client";
import { SidebarLink, SidebarDivider } from "@/components/ui/sidebar";
import { UserStar, Settings } from 'lucide-react';

const bottomLinks = [
   {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: <UserStar className="h-5 w-5" />,
  }
];

export function SidebarBottom() {
  return (
    <>
      <SidebarDivider />
      {bottomLinks.map((link, idx) => (
        <SidebarLink key={idx} link={link} />
      ))}
    </>
  );
}