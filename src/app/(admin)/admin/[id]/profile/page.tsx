"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { ArrowLeft, User, Mail, Phone, Shield, ClipboardList, CheckCircle, Clock } from "lucide-react";

interface AdminProfileData {
    id: string;
    username: string;
    email: string;
    phone_number: string | null;
    profile_image: string | null;
    role_name: string;
    role_id: number;
    is_online: boolean;
    trust_score: number;
    max_concurrent_reports: number | null;
}

interface AssignedReport {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
}

export default function AdminProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<AdminProfileData | null>(null);
    const [reports, setReports] = useState<AssignedReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const id = params.id as string;

    useEffect(() => {
        const fetchProfileAndReports = async () => {
            setIsLoading(true);
            setError("");
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Unauthorized");
                setIsLoading(false);
                return;
            }

            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
                
                // Fetch Profile details
                const profileRes = await fetch(`${apiBase}/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!profileRes.ok) {
                    throw new Error("Gagal mengambil data profil admin");
                }

                const profileData = await profileRes.json();
                if (profileData.success) {
                    setProfile(profileData.data);
                } else {
                    throw new Error(profileData.message || "Gagal memuat profil");
                }

                // Fetch reports assigned to this admin
                const reportsRes = await fetch(`${apiBase}/reports?assigned_admin_id=${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (reportsRes.ok) {
                    const reportsData = await reportsRes.json();
                    if (reportsData.success) {
                        setReports(reportsData.data || []);
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Terjadi kesalahan saat memuat data");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProfileAndReports();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
                <p className="text-sm text-red-500 font-medium">{error || "Admin tidak ditemukan"}</p>
                <button onClick={() => router.back()} className="text-sm text-gray-900 font-semibold underline">
                    Kembali
                </button>
            </div>
        );
    }

    const activeReports = reports.filter(r => !["resolved", "rejected"].includes(r.status));
    const resolvedReports = reports.filter(r => r.status === "resolved");

    const statusColors: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
        in_progress: "bg-blue-50 text-blue-700 border-blue-200",
        resolved: "bg-gray-100 text-gray-700 border-gray-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
            {/* Header / Back */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-gray-150 transition-colors shadow-sm">
                    <ArrowLeft className="w-4 h-4 text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Profil Admin</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Admin Card */}
                <div className="md:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-white shadow-xs">
                        <span className={`w-2 h-2 rounded-full ${profile.is_online ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                        {profile.is_online ? "Online" : "Offline"}
                    </div>

                    <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center mb-4">
                        {profile.profile_image ? (
                            <img src={profile.profile_image} alt={profile.username} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-12 h-12 text-gray-300" />
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profile.username}</h2>
                    <span className="mt-1.5 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-medium uppercase tracking-wider">
                        {profile.role_name}
                    </span>

                    <div className="w-full border-t border-gray-100 mt-6 pt-5 space-y-4 text-left">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>{profile.phone_number || "Tidak ada nomor"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                            <span>Max Concurrent: {profile.max_concurrent_reports || "Unlimited"}</span>
                        </div>
                    </div>
                </div>

                {/* Stats & Reports */}
                <div className="md:col-span-2 space-y-6">
                    {/* Workload Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-3">
                                <ClipboardList className="w-4 h-4 text-gray-700" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Total Laporan</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                            <p className="text-2xl font-bold text-amber-600">{activeReports.length}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Laporan Aktif</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-600">{resolvedReports.length}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-medium">Laporan Selesai</p>
                        </div>
                    </div>

                    {/* Assigned Reports List */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-white">
                            <h3 className="text-sm font-semibold text-gray-900">Daftar Laporan yang Ditugaskan</h3>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                            {reports.length === 0 ? (
                                <div className="p-8 text-center text-sm text-gray-400">
                                    Belum ada laporan yang ditugaskan kepada admin ini.
                                </div>
                            ) : (
                                reports.map(report => (
                                    <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="pr-4 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{report.title}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                Dibuat: {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[report.status] || "bg-gray-100"}`}>
                                                {report.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full">
                                                {report.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
