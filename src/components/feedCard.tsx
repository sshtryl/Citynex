"use client";
import { useState } from "react";
import {
  MapPin,
  MessageCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";

interface FeedCardProps {
  report: {
    id: string;
    title: string;
    description: string;
    status: string;
    location: string;
    images: string[];
    likes_count: number;
    is_liked: boolean;
    comment_count: number;
    created_at: string;
    user: {
      username: string;
      profile_image: string | null;
    };
    category: {
      name: string;
    };
  };
  onLike: (id: string, isCurrentlyLiked: boolean) => void;
  isLiking: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-stone-100 text-stone-500" },
  verified: {
    label: "Terverifikasi",
    className: "bg-emerald-50 text-emerald-600",
  },
  in_progress: { label: "Diproses", className: "bg-blue-50 text-blue-600" },
  resolved: { label: "Selesai", className: "bg-gray-100 text-gray-500" },
  rejected: { label: "Ditolak", className: "bg-red-50 text-red-500" },
};

export function FeedCard({ report, onLike, isLiking }: FeedCardProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = report.images || [];
  const mainImage = images.length > 0 ? images[currentImageIndex] : null;

  const formatDate = (dateString: string) => {
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
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowFullImage(true);
  };

  return (
    <>
      <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
        <Link href={`/laporan/${report.id}`} className="block cursor-pointer">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {report.user.profile_image ? (
                <img
                  src={report.user.profile_image}
                  alt={report.user.username}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {report.user.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {report.user.username}
                  </span>
                  <span className="text-gray-300 text-xs">·</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatDate(report.created_at)}
                  </span>
                  {report.status && statusConfig[report.status] && (
                    <>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConfig[report.status].className}`}>
                        {statusConfig[report.status].label}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-400 truncate max-w-[180px]">
                    {report.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          {mainImage && (
            <div
              className="relative aspect-[4/3] bg-gray-100 cursor-pointer select-none"
              onClick={handleImageClick}
            >
              <img
                src={mainImage}
                alt={report.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`block rounded-full transition-all ${
                          i === currentImageIndex
                            ? "w-4 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">
              {report.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
              {report.description}
            </p>
            <div className="mt-2">
              <span className="text-[11px] font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                {report.category?.name}
              </span>
            </div>
          </div>
        </Link>

        <div className="px-4 pt-2.5 pb-3.5 flex items-center gap-5 border-t border-gray-100 mt-3">
          <button
            onClick={() => onLike(report.id, report.is_liked)}
            disabled={!!isLiking}
            className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${
              report.is_liked
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${report.is_liked ? "fill-current" : ""}`}
            />
            <span>{Number(report.likes_count) || 0}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{report.comment_count || 0}</span>
          </button>
        </div>
      </article>

      {/* Full Image Modal */}
      {showFullImage && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setShowFullImage(false)}
        >
          <img
            src={images[currentImageIndex]}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            onClick={() => setShowFullImage(false)}
          >
            <X className="w-4 h-4" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
