"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function AdminPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role_id === 1) {
                router.replace("/superadmin");
            } else if ([2, 3, 4, 6, 7].includes(user.role_id)) {
                router.replace(`/admin/${user.role_id}`);
            } else {
                router.replace("/home");
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
        </div>
    );
}