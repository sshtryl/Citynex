"use client";
import { useAdminReports } from "@/hooks/useadminreports";
import { ClipboardList, CheckCircle, Clock, XCircle, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useEffect } from "react";

export default function AdminDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const { stats, isLoading: statsLoading } = useAdminReports();

    const id = params.id as string;

    // Security check: ensure admins cannot view other admin routes (except superadmin)
    useEffect(() => {
        if (!authLoading && user) {
            const userRoleIdStr = String(user.role_id);
            if (user.role_id !== 1 && userRoleIdStr !== id) {
                // Redirect to their own dashboard
                router.replace(`/admin/${user.role_id}`);
            }
        }
    }, [user, authLoading, id, router]);

    const statCards = stats ? [
        { label: "Total Laporan",  value: stats.reports.total,       icon: ClipboardList, color: "text-gray-900",    bg: "bg-gray-100" },
        { label: "Menunggu",       value: stats.reports.pending,      icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50" },
        { label: "Diproses",       value: stats.reports.in_progress,  icon: Clock,         color: "text-blue-600",   bg: "bg-blue-50" },
        { label: "Selesai",        value: stats.reports.resolved,     icon: CheckCircle,   color: "text-emerald-600",bg: "bg-emerald-50" },
        { label: "Ditolak",        value: stats.reports.rejected,     icon: XCircle,       color: "text-red-500",    bg: "bg-red-50" },
        { label: "Admin Online",   value: stats.online_admins,        icon: Users,         color: "text-purple-600", bg: "bg-purple-50" },
    ] : [];

    const displayRole = user?.role_id === 1 
        ? `Superadmin (Viewing Admin ${id})` 
        : user?.role_name || `Admin ${id}`;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 capitalize">Dashboard {displayRole}</h1>
                <p className="text-sm text-gray-400 mt-0.5">Ringkasan laporan masuk</p>
            </div>

            {statsLoading || authLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-20" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            )}

            <Link
                href="/admin/laporan"
                className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4 hover:border-gray-200 transition-colors"
            >
                <div>
                    <p className="text-sm font-semibold text-gray-900">Kelola Laporan</p>
                    <p className="text-xs text-gray-400 mt-0.5">Lihat, verifikasi, dan tolak laporan</p>
                </div>
                <ClipboardList className="w-5 h-5 text-gray-400" />
            </Link>
        </div>
    );
}
