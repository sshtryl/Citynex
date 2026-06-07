"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useReportDetail } from "@/hooks/useReportDetail";
import { useAdminReports } from "@/hooks/useadminreports";
import { useAuth } from "@/lib/useAuth";
import { ChatSection } from "@/components/ChatSection";

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending:     { label: "Menunggu",      dot: "bg-amber-400",   bg: "bg-amber-50",   text: "text-amber-700" },
    verified:    { label: "Terverifikasi", dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
    in_progress: { label: "Diproses",      dot: "bg-blue-400",   bg: "bg-blue-50",    text: "text-blue-700" },
    resolved:    { label: "Selesai",       dot: "bg-gray-400",   bg: "bg-gray-100",   text: "text-gray-600" },
    rejected:    { label: "Ditolak",       dot: "bg-red-400",    bg: "bg-red-50",     text: "text-red-600" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    low:      { label: "Rendah",  color: "text-emerald-600 bg-emerald-50" },
    medium:   { label: "Sedang",  color: "text-amber-600 bg-amber-50" },
    high:     { label: "Tinggi",  color: "text-orange-600 bg-orange-50" },
    critical: { label: "Kritis",  color: "text-red-600 bg-red-50" },
};

const nextActions: Record<string, { label: string; status: string; style: string }[]> = {
    pending:     [
        { label: "Verifikasi", status: "verified",    style: "bg-emerald-500 text-white hover:bg-emerald-600" },
        { label: "Tolak",      status: "rejected",    style: "bg-red-500 text-white hover:bg-red-600" },
    ],
    verified:    [{ label: "Proses",     status: "in_progress", style: "bg-blue-500 text-white hover:bg-blue-600" }],
    in_progress: [{ label: "Selesaikan", status: "resolved",    style: "bg-gray-800 text-white hover:bg-gray-900" }],
};

export default function AdminLaporanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { report, isLoading, error, refetch } = useReportDetail(id);
    const { updateStatus, isActing } = useAdminReports();
    const { user: currentUser } = useAuth();

    const [imgIdx, setImgIdx] = useState(0);
    const [notes, setNotes] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleAction = (status: string) => {
        if (status === "rejected") { setPendingStatus(status); setShowNotes(true); return; }
        confirmAction(status);
    };

    const confirmAction = async (status: string) => {
        const ok = await updateStatus(id, status, notes || undefined);
        if (ok) {
            setActionMsg({ type: "success", text: "Status berhasil diubah" });
            refetch();
        } else {
            setActionMsg({ type: "error", text: "Gagal mengubah status" });
        }
        setShowNotes(false);
        setNotes("");
        setPendingStatus(null);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
        </div>
    );

    if (error || !report) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-3">
            <p className="text-sm text-red-500">{error ?? "Laporan tidak ditemukan"}</p>
            <button onClick={() => router.back()} className="text-sm text-gray-500 underline">Kembali</button>
        </div>
    );

    const images = report.images ?? [];
    const status = statusConfig[report.status] ?? statusConfig.pending;
    const priority = priorityConfig[report.priority] ?? priorityConfig.medium;
    const actions = nextActions[report.status] ?? [];

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => router.back()}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h1 className="text-base font-semibold text-gray-900">Detail Laporan</h1>
            </div>

            <div className="space-y-3">
                {/* Image */}
                {images.length > 0 && (
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 select-none">
                        <img src={images[imgIdx]} alt="" className="w-full h-full object-cover" />
                        {images.length > 1 && (
                            <>
                                <button onClick={() => setImgIdx(i => i > 0 ? i - 1 : images.length - 1)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setImgIdx(i => i < images.length - 1 ? i + 1 : 0)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Main info */}
                <div className="bg-white rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priority.color}`}>
                            {priority.label}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
                            {report.category?.name}
                        </span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900">{report.title}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{report.description}</p>

                    <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5"><User className="w-3 h-3" />{report.user?.username} · {report.user?.email}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{report.location}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>

                    {report.admin && (
                        <div className="border-t border-gray-100 pt-3">
                            <p className="text-[11px] text-gray-400">Ditangani oleh</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">{report.admin.username}</p>
                        </div>
                    )}
                </div>

                {/* Status history */}
                {report.status_history && report.status_history.length > 0 && (
                    <div className="bg-white rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Riwayat Status</h3>
                        <div className="space-y-2">
                            {report.status_history.map((h, i) => (
                                <div key={i} className="flex gap-2 text-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-700 font-medium">{statusConfig[h.new_status]?.label ?? h.new_status}</p>
                                        {h.notes && <p className="text-gray-400">{h.notes}</p>}
                                        <p className="text-gray-400">{h.changed_by_name} · {new Date(h.created_at).toLocaleDateString("id-ID")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action message */}
                {actionMsg && (
                    <p className={`text-xs px-3 py-2 rounded-lg ${actionMsg.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {actionMsg.text}
                    </p>
                )}

                {/* Actions */}
                {actions.length > 0 && (
                    <div className="bg-white rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 mb-3">Tindakan</p>
                        <div className="flex gap-2">
                            {actions.map(action => (
                                <button
                                    key={action.status}
                                    onClick={() => handleAction(action.status)}
                                    disabled={isActing}
                                    className={`flex-1 text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 ${action.style}`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        {showNotes && (
                            <div className="space-y-2 pt-2">
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Alasan penolakan (opsional)..."
                                    rows={3}
                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 resize-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => { setShowNotes(false); setPendingStatus(null); }}
                                        className="flex-1 text-sm py-2 bg-gray-100 text-gray-600 rounded-xl">
                                        Batal
                                    </button>
                                    <button onClick={() => confirmAction(pendingStatus!)} disabled={isActing}
                                        className="flex-1 text-sm py-2 bg-red-500 text-white rounded-xl disabled:opacity-50">
                                        Konfirmasi Tolak
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Chat Section */}
                {currentUser && (
                    <ChatSection
                        reportId={id}
                        currentUserId={currentUser.id}
                        currentUsername={currentUser.username}
                    />
                )}
            </div>
        </div>
    );
}