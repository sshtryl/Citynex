"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/useAuth";

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();

    const dashboardHref = user?.role_id === 1 ? "/superadmin" : user?.role_id ? `/admin/${user.role_id}` : "/admin";

    const navItems = [
        { href: dashboardHref, icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/laporan", icon: ClipboardList, label: "Laporan" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <aside className="w-14 h-screen bg-white border-r border-gray-100 flex flex-col items-center py-5 gap-2 fixed left-0 top-0 z-20">
            {/* Logo */}
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xs font-bold">A</span>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 flex-1">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || (href !== "/admin" && href !== "/superadmin" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={label}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                active ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                title="Keluar"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </aside>
    );
}