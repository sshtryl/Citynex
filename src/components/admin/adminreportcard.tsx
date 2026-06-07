"use client";
import { useState } from "react";
import { MapPin, Clock, MessageCircle, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending:     { label: "Menunggu",    dot: "bg-amber-400",   bg: "bg-amber-50",   text: "text-amber-700" },
    verified:    { label: "Terverifikasi", dot: "bg-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
    in_progress: { label: "Diproses",    dot: "bg-blue-400",   bg: "bg-blue-50",    text: "text-blue-700" },
    resolved:    { label: "Selesai",     dot: "bg-gray-400",   bg: "bg-gray-100",   text: "text-gray-600" },
    rejected:    { label: "Ditolak",     dot: "bg-red-400",    bg: "bg-red-50",     text: "text-red-600" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    low:      { label: "Rendah",  color: "text-emerald-600" },
    medium:   { label: "Sedang",  color: "text-amber-600" },
    high:     { label: "Tinggi",  color: "text-orange-600" },
    critical: { label: "Kritis",  color: "text-red-600" },
};

interface AdminReportCardProps {
    report: {
        id: string;
        title: string;
        location: string;
        status: string;
        priority: string;
        category_name: string;
        username: string;
        images: string[];
        comment_count: number;
        likes_count: number;
        created_at: string;
        assigned_admin_name: string | null;
    };
    onUpdateStatus: (id: string, status: string, notes?: string) => Promise<boolean>;
    isActing: boolean;
}

function formatDate(d: string) {
    const date = new Date(d);
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff === 0) return "Hari ini";
    if (diff === 1) return "Kemarin";
    if (diff < 7) return `${diff} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function AdminReportCard({ report, onUpdateStatus, isActing }: AdminReportCardProps) {
    const [notes, setNotes] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    const status = statusConfig[report.status] ?? statusConfig.pending;
    const priority = priorityConfig[report.priority] ?? priorityConfig.medium;
    const thumb = report.images?.[0];

    const handleAction = async (newStatus: string) => {
        if (newStatus === "rejected") {
            setPendingStatus(newStatus);
            setShowNotes(true);
            return;
        }
        await onUpdateStatus(report.id, newStatus);
    };

    const confirmReject = async () => {
        if (!pendingStatus) return;
        await onUpdateStatus(report.id, pendingStatus, notes);
        setShowNotes(false);
        setNotes("");
        setPendingStatus(null);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all">
            <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {thumb
                        ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">📷</div>
                    }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </span>
                            <span className={`text-[10px] font-medium ${priority.color}`}>
                                {priority.label}
                            </span>
                        </div>
                        <Link href={`/admin/laporan/${report.id}`} className="text-gray-400 hover:text-gray-700 flex-shrink-0">
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-1">{report.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{report.category_name} · {report.username}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(report.created_at)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {(report.status === "pending" || report.status === "verified" || report.status === "in_progress") && (
                <div className="px-3 pb-3 flex gap-2">
                    {report.status === "pending" && (
                        <>
                            <button
                                onClick={() => handleAction("verified")}
                                disabled={isActing}
                                className="flex-1 text-xs font-medium py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Verifikasi
                            </button>
                            <button
                                onClick={() => handleAction("rejected")}
                                disabled={isActing}
                                className="flex-1 text-xs font-medium py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Tolak
                            </button>
                        </>
                    )}
                    {report.status === "verified" && (
                        <button
                            onClick={() => handleAction("in_progress")}
                            disabled={isActing}
                            className="flex-1 text-xs font-medium py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Proses
                        </button>
                    )}
                    {report.status === "in_progress" && (
                        <button
                            onClick={() => handleAction("resolved")}
                            disabled={isActing}
                            className="flex-1 text-xs font-medium py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Selesaikan
                        </button>
                    )}
                </div>
            )}

            {/* Notes input for rejection */}
            {showNotes && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-3">
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Alasan penolakan (opsional)..."
                        rows={2}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 resize-none"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => { setShowNotes(false); setPendingStatus(null); }}
                            className="flex-1 text-xs py-1.5 bg-gray-100 text-gray-600 rounded-lg">
                            Batal
                        </button>
                        <button onClick={confirmReject} disabled={isActing}
                            className="flex-1 text-xs py-1.5 bg-red-500 text-white rounded-lg disabled:opacity-50">
                            Konfirmasi Tolak
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}