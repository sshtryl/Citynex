"use client";
import { MapPin, Clock } from "lucide-react";
import { ProfileReport } from "@/hooks/useprofile";
import Link from "next/link";

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Menunggu",
    className: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
  },
  verified: {
    label: "Terverifikasi",
    className: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
  },
  in_progress: {
    label: "Diproses",
    className: "bg-blue-50 text-blue-600",
    dot: "bg-blue-400",
  },
  resolved: {
    label: "Selesai",
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
  rejected: {
    label: "Ditolak",
    className: "bg-red-50 text-red-500",
    dot: "bg-red-400",
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) return `${diff} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProfileReportCard({ report }: { report: ProfileReport }) {
  const status = statusConfig[report.status] ?? statusConfig.pending;
  const thumb = report.images?.[0] ?? null;

  return (
    <Link href={`/laporan/${report.id}`} className="block h-full">
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer h-full">
        {/* Thumbnail */}
        <div className="aspect-[4/3] bg-gray-50 relative">
          {thumb ? (
            <img
              src={thumb}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
            </div>
          )}

          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>

        <div className="p-3">
          <p className="text-[11px] text-gray-400 mb-1">{report.category_name}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
            {report.title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{report.location}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
