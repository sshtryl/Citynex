// app/admin/layout.tsx
"use client";
import { useAuth } from "@/lib/useAuth";
import { AdminSidebar } from "@/components/admin/adminsidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth({ required: true });
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!isLoading && isAuthenticated && !isAdmin) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ml-14">
        {children}
      </main>
    </div>
  );
}