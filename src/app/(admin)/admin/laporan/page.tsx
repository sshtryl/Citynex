"use client";
import { useAdminReports } from "@/hooks/useadminreports";
import { AdminReportCard } from "@/components/admin/adminreportcard";
import { RefreshCw } from "lucide-react";

const filters = [
    { key: "all",         label: "Semua" },
    { key: "pending",     label: "Menunggu" },
    { key: "verified",    label: "Terverifikasi" },
    { key: "in_progress", label: "Diproses" },
    { key: "resolved",    label: "Selesai" },
    { key: "rejected",    label: "Ditolak" },
];

export default function AdminLaporanPage() {
    const { reports, isLoading, isActing, error, activeFilter, setActiveFilter, refresh, updateStatus, pagination } = useAdminReports();

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Laporan</h1>
                    <p className="text-xs text-gray-400 mt-0.5">{pagination.total} laporan total</p>
                </div>
                <button onClick={refresh} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-hide">
                {filters.map(f => (
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

            {/* Content */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : error ? (
                <p className="text-sm text-red-500 text-center py-10">{error}</p>
            ) : reports.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-3xl mb-3">📋</p>
                    <p className="text-sm text-gray-400">Tidak ada laporan</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map(report => (
                        <AdminReportCard
                            key={report.id}
                            report={report}
                            onUpdateStatus={updateStatus}
                            isActing={isActing}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}