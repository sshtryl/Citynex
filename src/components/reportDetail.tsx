"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useReportDetail } from "@/hooks/useReportDetail";
import { CommentSection } from "@/components/CommentSection";
import { useAuth } from "@/lib/useAuth";
import { ChatSection } from "@/components/ChatSection";

interface ReportDetailProps {
  reportId: string;
}

const statusConfig: Record<
  string,
  { label: string; dot: string; bg: string; text: string }
> = {
  pending: {
    label: "Menunggu Verifikasi",
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  verified: {
    label: "Terverifikasi",
    dot: "bg-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  in_progress: {
    label: "Sedang Diproses",
    dot: "bg-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  resolved: {
    label: "Selesai",
    dot: "bg-gray-400",
    bg: "bg-gray-100",
    text: "text-gray-600",
  },
  rejected: {
    label: "Ditolak",
    dot: "bg-red-400",
    bg: "bg-red-50",
    text: "text-red-600",
  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Rendah", color: "text-emerald-600 bg-emerald-50" },
  medium: { label: "Sedang", color: "text-amber-600 bg-amber-50" },
  high: { label: "Tinggi", color: "text-orange-600 bg-orange-50" },
  critical: { label: "Kritis", color: "text-red-600 bg-red-50" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ReportDetail({ reportId }: ReportDetailProps) {
  const router = useRouter();
  const { report, isLoading, error } = useReportDetail(reportId);
  const [imgIdx, setImgIdx] = useState(0);
  const { user: currentUser } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4">
        <p className="text-sm text-red-500">
          {error ?? "Laporan tidak ditemukan"}
        </p>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  const images = report.images ?? [];
  const status = statusConfig[report.status] ?? statusConfig.pending;
  const priority = priorityConfig[report.priority] ?? priorityConfig.medium;

  const mappedComments = (report.comments ?? []).map((c: any) => ({
    id: c.id,
    comment: c.comment ?? c.content,
    created_at: c.created_at,
    username: c.username,
    profile_image: c.profile_image ?? null,
    user_id: c.user_id ?? "",
    replies: [],
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            Detail Laporan
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {/* Image gallery */}
        {images.length > 0 && (
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 select-none">
            <img
              src={images[imgIdx]}
              alt={report.title}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setImgIdx((i) => (i > 0 ? i - 1 : images.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setImgIdx((i) => (i < images.length - 1 ? i + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`block rounded-full transition-all ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          {/* Status + priority badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${priority.color}`}
            >
              Prioritas: {priority.label}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-500">
              {report.category?.name}
            </span>
          </div>

          <h1 className="text-lg font-bold text-gray-900 leading-snug">
            {report.title}
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {report.description}
          </p>

          <div className="border-t border-gray-100" />

          <div className="flex items-center gap-2.5">
            {/* 🔥 Profile Image atau Initial */}
            {report.user?.profile_image ? (
              <img
                src={report.user.profile_image}
                alt={report.user.username}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  // Fallback jika gambar error
                  (e.target as HTMLImageElement).style.display = "none";
                  (
                    e.target as HTMLImageElement
                  ).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <div
              className={`w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${report.user?.profile_image ? "hidden" : ""}`}
            >
              {report.user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {report.user?.username}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {report.location}
                </span>
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>
          </div>

          {report.admin && (
            <>
              <div className="border-t border-gray-100" />
              <div className="flex items-center gap-2">
                {report.admin.profile_image ? (
                  <img
                    src={report.admin.profile_image}
                    alt={report.admin.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="text-[11px] text-gray-400">Ditangani oleh</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {report.admin.username}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status history */}
        {report.status_history && report.status_history.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              Riwayat Status
            </h3>
            <div className="space-y-3">
              {report.status_history.map((h, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                    {i < report.status_history.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-gray-700 font-medium">
                      {statusConfig[h.new_status]?.label ?? h.new_status}
                    </p>
                    {h.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{h.notes}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {h.changed_by_name} ·{" "}
                      {new Date(h.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentSection reportId={reportId} initialComments={mappedComments} />

        {/* Real-time Chat Section with Admin */}
        {currentUser && (currentUser.id === report.user_id || currentUser.id === report.user?.id || [1, 2, 3, 4, 6, 7].includes(currentUser.role_id)) && (
          <ChatSection 
            reportId={reportId} 
            currentUserId={currentUser.id} 
            currentUsername={currentUser.username} 
          />
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}
