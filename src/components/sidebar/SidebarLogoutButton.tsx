"use client";
import { SidebarLink } from "@/components/ui/sidebar";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function SidebarLogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <SidebarLink
      link={{
        label: "Logout",
        href: "#",
        icon: <IconLogout className="h-5 w-5" />,
        onClick: handleLogout,
      }}
    />
  );
}