"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { Settings } from "@/components/settings";
import { Loader2, Pencil, Mail, Phone, Shield, Star, LogOut } from "lucide-react";
import { removeToken } from "@/lib/useAuth";

export default function SettingsPage() {
    const router = useRouter();
    const { user, isLoading, error, refetch } = useUser();
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleLogout = () => {
        removeToken(); // hapus localStorage + cookie sekaligus
        router.push("/login");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-2">
                <p className="text-sm text-red-500">{error ?? "User tidak ditemukan"}</p>
                <button onClick={() => refetch()} className="text-sm text-gray-500 underline">
                    Coba lagi
                </button>
            </div>
        );
    }

    const infoItems = [
        { icon: Mail,   label: "Email",          value: user.email },
        { icon: Phone,  label: "Nomor Telepon",  value: user.phone_number ?? "Belum diisi" },
        { icon: Shield, label: "Role",            value: user.role_name === "super_admin" ? "Super Admin" : user.role_name ?? "User" },
        { icon: Star,   label: "Trust Score",     value: `${user.trust_score ?? 0}%` },
    ];

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-lg mx-auto px-4 py-8 space-y-3">

                    {/* Profile card */}
                    <div className="bg-white rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h1 className="text-base font-semibold text-gray-900">Akun Saya</h1>
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        </div>

                        {/* Avatar + name */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
                                {user.profile_image
                                    ? <img src={user.profile_image} alt="avatar" className="w-full h-full object-cover" />
                                    : user.username?.[0]?.toUpperCase() ?? "?"
                                }
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-900">{user.username}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Bergabung {new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info items */}
                    <div className="bg-white rounded-2xl divide-y divide-gray-50">
                        {infoItems.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-3 px-5 py-4">
                                <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[11px] text-gray-400">{label}</p>
                                    <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl text-red-500 text-sm font-medium hover:bg-red-50 transition-colors border border-gray-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </button>
                </div>
            </div>

            <Settings isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} onSuccess={refetch} />
        </>
    );
}