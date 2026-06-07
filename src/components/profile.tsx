"use client";
import { useProfile } from "@/hooks/useprofile";
import { ProfileReportCard } from "@/components/profilereportcard";
const filters = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "verified", label: "Terverifikasi" },
  { key: "in_progress", label: "Diproses" },
  { key: "resolved", label: "Selesai" },
  { key: "rejected", label: "Ditolak" },
];

export default function ProfilePage() {
  const { reports, stats, isLoading, error, activeFilter, setActiveFilter } =
    useProfile();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-5">Laporan Saya</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "Semua", value: stats.total, color: "text-gray-900" },
            {
              label: "Proses",
              value: stats.in_progress,
              color: "text-blue-600",
            },
            {
              label: "Selesai",
              value: stats.resolved,
              color: "text-emerald-600",
            },
            { label: "Ditolak", value: stats.rejected, color: "text-red-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-100 rounded-xl p-3 text-center"
            >
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 text-center py-10">{error}</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">Belum ada laporan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {reports.map((report) => (
            <ProfileReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
