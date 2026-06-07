"use client";
import { useEffect, useRef } from 'react';
import { FeedCard } from './feedCard';
import { Loader2 } from 'lucide-react';

interface FeedListProps {
    reports: any[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    isLiking: Record<string, boolean>;
    onLike: (id: string, isLiked: boolean) => void;
    onLoadMore: () => void;
}

export function FeedList({
    reports,
    isLoading,
    error,
    hasMore,
    isLiking,
    onLike,
    onLoadMore
}: FeedListProps) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastReportRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isLoading) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) onLoadMore();
            },
            { threshold: 0.1 }
        );

        if (lastReportRef.current) observerRef.current.observe(lastReportRef.current);
        return () => observerRef.current?.disconnect();
    }, [isLoading, hasMore, onLoadMore]);

    if (isLoading && reports.length === 0) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
            </div>
        );
    }

    if (error && reports.length === 0) {
        return (
            <div className="text-center py-24 ">
                <p className="text-sm text-red-400">{error}</p>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-24">
                <h1 className="text-sm font-semibold text-2xl text-gray-400">Belum ada laporan yang dipublikasikan</h1>
            </div>
        );
    }

    return (
        <div className="space-y-3 ">
            {reports.map((report, index) => (
                <div
                    key={report.id}
                    ref={index === reports.length - 1 ? lastReportRef : null}
                >
                    <FeedCard
                        report={report}
                        onLike={onLike}
                        isLiking={isLiking[report.id] || false}
                    />
                </div>
            ))}

            {isLoading && reports.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                </div>
            )}

            {!hasMore && reports.length > 0 && (
                <p className="text-center text-xs text-gray-300 py-6">Semua laporan sudah ditampilkan</p>
            )}
        </div>
    );
}